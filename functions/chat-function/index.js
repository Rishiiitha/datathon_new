'use strict';

/**
 * CrimeIQ — chat-function
 * Context-Aware Crime Intelligence Engine
 * Passes full conversation history to LLM and produces varied, context-relevant answers.
 */

const { generateSQL, generateAnswer, generateContextualFallback } = require('./lib/openai');
const { extractRole, maskPII } = require('./lib/auth');

function setCORS(res) {
  if (!res) return;
  try {
    const set = typeof res.set === 'function' ? (k, v) => res.set(k, v) : (k, v) => res.setHeader(k, v);
    set('Access-Control-Allow-Origin', '*');
    set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-role, x-user-email');
  } catch (e) {}
}

function resolveArgs(a, b, c) {
  const isRes = (x) => x && (typeof x.status === 'function' || typeof x.setHeader === 'function' || typeof x.json === 'function' || typeof x.send === 'function');
  if (isRes(b)) return { req: a, res: b };
  if (isRes(c)) return { req: b, res: c };
  return { req: a || {}, res: b || c || {} };
}

function parseBody(req) {
  let body = req.body;
  if (Buffer.isBuffer(body)) {
    try { body = JSON.parse(body.toString('utf-8')); } catch { body = {}; }
  } else if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  return body || {};
}

function sendJSON(res, status, payload) {
  try {
    if (typeof res.status === 'function') return res.status(status).json(payload);
    if (typeof res.setHeader === 'function') {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = status;
      res.end(JSON.stringify(payload));
      return;
    }
  } catch (e) {}
  return payload;
}

async function handler(a, b, c) {
  const { req, res } = resolveArgs(a, b, c);
  setCORS(res);

  if (req.method === 'OPTIONS') {
    return sendJSON(res, 200, {});
  }

  // Init Catalyst app (optional — only for DB queries)
  let app = null;
  try {
    const catalyst = require('zcatalyst-sdk-node');
    app = catalyst.initialize(req);
  } catch (e) {}

  const role = extractRole(req);
  const body = parseBody(req);

  const message     = (body.message     || req.query?.message     || '').trim();
  const sessionId   =  body.sessionId   || req.query?.sessionId;
  const language    =  body.language    || req.query?.language    || 'en';
  // conversationHistory: array of {role, content} pairs sent from the frontend
  const history     = Array.isArray(body.history) ? body.history : [];

  const sid = sessionId || `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  if (!message) {
    return sendJSON(res, 400, { error: 'message is required' });
  }

  // ── 1. Generate SQL via LLM (with conversation context) ──────────────────
  let generatedSql = null;
  try {
    generatedSql = await generateSQL(message, history, app);
  } catch (e) {
    generatedSql = null;
  }

  // ── 2. Execute SQL against DB (best-effort) ──────────────────────────────
  let dbResults = [];
  if (generatedSql && app) {
    try {
      const { executeQuery } = require('./lib/db');
      const raw = await executeQuery(app, generatedSql);
      dbResults = Array.isArray(raw) ? raw : [];
    } catch (e) {
      dbResults = [];
    }
  }

  // ── 3. Generate answer via LLM (with conversation context + DB results) ──
  let answer = null;
  try {
    answer = await generateAnswer(message, generatedSql, dbResults, history, language, app);
  } catch (e) {
    answer = null;
  }

  // ── 4. If LLM unavailable, use smart context-aware rule-based fallback ───
  if (!answer || !answer.trim()) {
    const fallback = generateContextualFallback(message, history, language, dbResults);
    answer    = fallback.answer;
    if (!generatedSql) generatedSql = fallback.sql;
    if (!dbResults.length) dbResults = fallback.results || [];
  }

  // ── 5. Collect cited IDs from results ────────────────────────────────────
  const citedIds = [...new Set(dbResults.flatMap(r => [
    r.CrimeNo, r.CaseNo, r.PersonID, r.AccusedMasterID?.toString()
  ].filter(Boolean)))].slice(0, 10);

  const maskedResults = maskPII(dbResults.slice(0, 10), role);

  const payload = {
    answer,
    sql:       generatedSql || '',
    results:   maskedResults,
    sessionId: sid,
    citedIds:  citedIds.length ? citedIds : ['CRIMEIQ-ASSISTANT'],
    timestamp: new Date().toISOString()
  };

  return sendJSON(res, 200, payload);
}

module.exports = handler;
