'use strict';

/**
 * CrimeIQ — admin-function
 */

const catalyst = require('zcatalyst-sdk-node');

function setCORS(res) {
  if (!res) return;
  try {
    if (typeof res.set === 'function') {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-role, x-user-email');
    } else if (typeof res.setHeader === 'function') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-role, x-user-email');
    }
  } catch (e) {}
}

function resolveArgs(a, b, c) {
  if (b && (typeof b.status === 'function' || typeof b.setHeader === 'function' || typeof b.set === 'function' || typeof b.json === 'function' || typeof b.send === 'function')) {
    return { context: a, req: a, res: b };
  }
  if (c && (typeof c.status === 'function' || typeof c.setHeader === 'function' || typeof c.set === 'function' || typeof c.json === 'function' || typeof c.send === 'function')) {
    return { context: a, req: b, res: c };
  }
  return { context: a, req: a || {}, res: b || c || {} };
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

const FALLBACK_USERS = [
  { UserID: 'investigator_01', Email: 'investigator@karnataka.gov.in', Role: 'investigator', StationID: 1, IsActive: 1 },
  { UserID: 'analyst_01',      Email: 'analyst@karnataka.gov.in',      Role: 'analyst',      StationID: 1, IsActive: 1 },
  { UserID: 'supervisor_01',   Email: 'supervisor@karnataka.gov.in',   Role: 'supervisor',   StationID: 2, IsActive: 1 },
  { UserID: 'policy_01',       Email: 'policy@karnataka.gov.in',       Role: 'policymaker',  StationID: 1, IsActive: 1 },
  { UserID: 'admin_01',        Email: 'admin@karnataka.gov.in',        Role: 'admin',        StationID: 1, IsActive: 1 }
];

const FALLBACK_AUDIT_LOGS = [
  { LogID: 101, UserEmail: 'investigator@karnataka.gov.in', Action: 'CHAT_QUERY', Resource: 'CaseMaster', ResourceID: 'CASE-101', Timestamp: new Date().toISOString(), IPAddress: '127.0.0.1' }
];

async function handler(a, b, c) {
  const { req, res } = resolveArgs(a, b, c);
  setCORS(res);

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') return res.status(200).send('');
    return;
  }

  const urlStr = req.url || req.path || '';
  const pathWithoutQuery = urlStr.split('?')[0];
  const body = parseBody(req);

  if (pathWithoutQuery.includes('login')) {
    const payload = {
      token: Buffer.from(JSON.stringify({ email: body.email || 'user@karnataka.gov.in', role: body.role || 'investigator' })).toString('base64'),
      email: body.email || 'user@karnataka.gov.in',
      role: body.role || 'investigator',
      stationId: 1
    };
    if (typeof res.status === 'function') return res.status(200).json(payload);
    return payload;
  }

  if (pathWithoutQuery.includes('audit-log')) {
    const payload = { auditLog: FALLBACK_AUDIT_LOGS, count: 1 };
    if (typeof res.status === 'function') return res.status(200).json(payload);
    return payload;
  }

  const payload = { users: FALLBACK_USERS };
  if (typeof res.status === 'function') return res.status(200).json(payload);
  return payload;
}

module.exports = handler;
