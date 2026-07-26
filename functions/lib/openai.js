const http = require('http');
const https = require('https');
const catalyst = require('zcatalyst-sdk-node');

async function getOpenAIKey(app) {
  const connName = process.env.OPENAI_CONNECTION_NAME || 'openai';
  try {
    if (app && app.connections) {
      const conn = await app.connections().getConnection(connName);
      if (conn) {
        const key = conn.get('apiKey') || conn.getOAuthToken();
        if (key) return key;
      }
    }
  } catch (e) {}
  return process.env.OPENAI_API_KEY || process.env.LLAMA_API_KEY || '';
}

const DB_SCHEMA = `
Database: Karnataka Police FIR System
`;

async function callOpenAI(messages, temperature = 0.3, maxTokens = 2000, app) {
  return new Promise(async (resolve, reject) => {
    const apiKey = await getOpenAIKey(app);
    const provider = process.env.LLM_PROVIDER || (apiKey ? 'openai' : 'ollama');

    let isHttps = true;
    let hostname = 'api.openai.com';
    let port = 443;
    let path = '/v1/chat/completions';
    let model = process.env.LLM_MODEL || (provider === 'ollama' ? 'llama3.2' : 'gpt-4o');

    if (provider === 'ollama' || process.env.OLLAMA_BASE_URL || process.env.OPENAI_BASE_URL || !apiKey) {
      const baseUrlStr = process.env.OLLAMA_BASE_URL || process.env.OPENAI_BASE_URL || 'http://127.0.0.1:11434/v1';
      try {
        const parsedUrl = new URL(baseUrlStr.endsWith('/chat/completions') ? baseUrlStr : `${baseUrlStr.replace(/\/$/, '')}/chat/completions`);
        isHttps = parsedUrl.protocol === 'https:';
        hostname = parsedUrl.hostname;
        port = parsedUrl.port || (isHttps ? 443 : 80);
        path = parsedUrl.pathname + parsedUrl.search;
        model = process.env.LLM_MODEL || 'llama3.2';
      } catch (err) {
        isHttps = false;
        hostname = '127.0.0.1';
        port = 11434;
        path = '/v1/chat/completions';
        model = process.env.LLM_MODEL || 'llama3.2';
      }
    }

    const body = JSON.stringify({ model, messages, temperature, max_tokens: maxTokens });
    const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) };
    if (apiKey && isHttps) headers['Authorization'] = `Bearer ${apiKey}`;

    const options = { hostname, port, path, method: 'POST', headers };
    const requester = isHttps ? https : http;

    const req = requester.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) reject(new Error(typeof parsed.error === 'string' ? parsed.error : parsed.error.message || JSON.stringify(parsed.error)));
          else if (parsed.choices && parsed.choices[0] && parsed.choices[0].message) resolve(parsed.choices[0].message.content);
          else if (parsed.message && parsed.message.content) resolve(parsed.message.content);
          else reject(new Error(`Unexpected response format from LLM`));
        } catch (e) { reject(e); }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(body);
    req.end();
  });
}

function fallbackSQLGenerator(userQuery) {
  const q = userQuery.toLowerCase();
  if (q.includes('bengaluru') || q.includes('bangalore') || q.includes('ಬೆಂಗಳೂರು')) {
    return `SELECT cm.CaseMasterID, cm.CrimeNo, cm.CaseNo, cm.CrimeRegisteredDate, d.DistrictName FROM CaseMaster cm JOIN Unit u ON cm.PoliceStationID = u.UnitID JOIN District d ON u.DistrictID = d.DistrictID WHERE d.DistrictName LIKE '%Bengaluru%' LIMIT 50`;
  }
  if (q.includes('murder') || q.includes('heinous') || q.includes('கொலை') || q.includes('ಕೊಲೆ')) {
    return `SELECT CaseMasterID, CrimeNo, CaseNo, CrimeRegisteredDate, BriefFacts FROM CaseMaster WHERE GravityOffenceID = 3 OR BriefFacts LIKE '%murder%' LIMIT 50`;
  }
  if (q.includes('repeat') || q.includes('offender') || q.includes('accused') || q.includes('suspect')) {
    return `SELECT AccusedName, AgeYear, GenderID, COUNT(CaseMasterID) as TotalCases FROM Accused GROUP BY AccusedName, AgeYear, GenderID HAVING COUNT(CaseMasterID) >= 1 ORDER BY TotalCases DESC LIMIT 50`;
  }
  if (q.includes('trend') || q.includes('month') || q.includes('count') || q.includes('total')) {
    return `SELECT CrimeRegisteredDate, COUNT(*) as TotalCrimes FROM CaseMaster GROUP BY CrimeRegisteredDate ORDER BY CrimeRegisteredDate DESC LIMIT 50`;
  }
  return `SELECT CaseMasterID, CrimeNo, CaseNo, CrimeRegisteredDate, PoliceStationID FROM CaseMaster ORDER BY CrimeRegisteredDate DESC LIMIT 50`;
}

async function generateSQL(userQuery, conversationHistory = [], app) {
  try {
    const systemPrompt = `You are an expert SQL generator for the Karnataka Police crime database.
Rules:
- Generate ONLY a valid SQL SELECT query. No INSERT/UPDATE/DELETE/DROP/ALTER.
- Always LIMIT results to 100.
- Return ONLY the SQL query — no markdown, no explanation.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6).map((t) => ({ role: t.role, content: t.content })),
      { role: 'user', content: `Generate SQL for: ${userQuery}` }
    ];

    const res = await callOpenAI(messages, 0.1, 1000, app);
    return res;
  } catch (err) {
    return fallbackSQLGenerator(userQuery);
  }
}

async function generateAnswer(userQuery, sqlQuery, queryResults, conversationHistory = [], language = 'en', app) {
  try {
    const langInstruction = language === 'kn' ? 'Respond in Kannada language (Kannada script).' : 'Respond in clear, professional English.';
    const systemPrompt = `You are CrimeIQ, an AI assistant for Karnataka Police crime intelligence.\n${langInstruction}\nBe concise, professional, and factual. Always cite specific case numbers or IDs when available.`;

    const resultSummary = Array.isArray(queryResults) && queryResults.length > 0
      ? `SQL returned ${queryResults.length} records. First few records: ${JSON.stringify(queryResults.slice(0, 5))}`
      : 'SQL returned no results.';

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6).map((t) => ({ role: t.role, content: t.content })),
      { role: 'user', content: `User question: "${userQuery}"\n\nSQL executed: ${sqlQuery}\n\n${resultSummary}\n\nProvide a helpful answer.` }
    ];

    return await callOpenAI(messages, 0.5, 1500, app);
  } catch (err) {
    const count = Array.isArray(queryResults) ? queryResults.length : 0;
    if (language === 'kn') {
      return `ಪ್ರಶ್ನೆಗಾಗಿ ${count} ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿವೆ: "${userQuery}". ಪ್ರದರ್ಶಿತ SQL ಫಲಿತಾಂಶಗಳಲ್ಲಿ ಪೂರ್ಣ ವಿವರಗಳನ್ನು ನೀಡಲಾಗಿದೆ.`;
    }
    return `Query executed successfully. Found ${count} matching record(s) for: "${userQuery}". Details and cited case IDs are listed in the evidence panel below.`;
  }
}

module.exports = { generateSQL, generateAnswer, DB_SCHEMA, getOpenAIKey, callOpenAI };
