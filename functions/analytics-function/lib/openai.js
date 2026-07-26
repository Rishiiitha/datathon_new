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
  return process.env.OPENAI_API_KEY || process.env.LLAMA_API_KEY || 'REPLACE_WITH_YOUR_OPENAI_API_KEY';
}

const DB_SCHEMA = `Karnataka Police FIR System Schema`;

async function callOpenAI(messages, temperature = 0.3, maxTokens = 2000, app) {
  return new Promise(async (resolve, reject) => {
    const apiKey = await getOpenAIKey(app);
    const provider = process.env.LLM_PROVIDER || (apiKey ? 'openai' : 'ollama');
    let isHttps = true, hostname = 'api.openai.com', port = 443, path = '/v1/chat/completions';
    let model = process.env.LLM_MODEL || (provider === 'ollama' ? 'llama3.2' : 'gpt-4o');

    if (provider === 'ollama' || process.env.OLLAMA_BASE_URL || process.env.OPENAI_BASE_URL || !apiKey) {
      const baseUrlStr = process.env.OLLAMA_BASE_URL || process.env.OPENAI_BASE_URL || 'http://127.0.0.1:11434/v1';
      try {
        const parsedUrl = new URL(baseUrlStr.endsWith('/chat/completions') ? baseUrlStr : `${baseUrlStr.replace(/\/$/, '')}/chat/completions`);
        isHttps = parsedUrl.protocol === 'https:';
        hostname = parsedUrl.hostname; port = parsedUrl.port || (isHttps ? 443 : 80); path = parsedUrl.pathname + parsedUrl.search;
        model = process.env.LLM_MODEL || 'llama3.2';
      } catch (err) {
        isHttps = false; hostname = '127.0.0.1'; port = 11434; path = '/v1/chat/completions'; model = process.env.LLM_MODEL || 'llama3.2';
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
      if (err.code === 'ECONNREFUSED' && hostname === '127.0.0.1') {
        reject(new Error('Connection refused to local Llama/Ollama instance at 127.0.0.1:11434. Please ensure Ollama is running.'));
      } else { reject(err); }
    });
    req.write(body);
    req.end();
  });
}

async function generateSQL(userQuery, conversationHistory = [], app) {
  return callOpenAI([{ role: 'system', content: 'Generate SQL' }, { role: 'user', content: userQuery }], 0.1, 1000, app);
}

async function generateAnswer(userQuery, sqlQuery, queryResults, conversationHistory = [], language = 'en', app) {
  return callOpenAI([{ role: 'system', content: 'Answer question' }, { role: 'user', content: userQuery }], 0.5, 1500, app);
}

async function generateSociologicalInsights(demographicData, app) {
  const messages = [
    { role: 'system', content: 'You are a criminology sociologist analyzing crime patterns in Karnataka, India. Provide evidence-based sociological insights.' },
    { role: 'user', content: `Analyze these demographic crime patterns and provide sociological insights:\n${JSON.stringify(demographicData)}` }
  ];
  return callOpenAI(messages, 0.6, 1200, app);
}

module.exports = { generateSQL, generateAnswer, generateSociologicalInsights, DB_SCHEMA, getOpenAIKey, callOpenAI };
