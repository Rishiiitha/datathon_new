'use strict';

/**
 * CrimeIQ — network-function
 */

const catalyst = require('zcatalyst-sdk-node');
const { extractRole } = require('./lib/auth');

function setCORS(res) {
  if (!res) return;
  try {
    if (typeof res.set === 'function') {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-role, x-user-email');
    } else if (typeof res.setHeader === 'function') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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

const ALL_ACCUSED = [
  { Name: 'Ramesh Kumar', PersonID: 'ACC-8821', id: 'ACC-8821', FirCount: 4, firCount: 4, riskScore: 85 },
  { Name: 'Suresh Gowda', PersonID: 'ACC-4412', id: 'ACC-4412', FirCount: 3, firCount: 3, riskScore: 72 },
  { Name: 'Venkatesh M', PersonID: 'ACC-503', id: 'ACC-503', FirCount: 3, firCount: 3, riskScore: 68 },
  { Name: 'Anand Rao', PersonID: 'ACC-504', id: 'ACC-504', FirCount: 2, firCount: 2, riskScore: 45 },
  { Name: 'Pradeep Shetty', PersonID: 'ACC-505', id: 'ACC-505', FirCount: 5, firCount: 5, riskScore: 91 }
];

const FALLBACK_GRAPH = {
  nodes: [
    { id: 'ACC-8821', label: 'Ramesh Kumar\n(Accused)', type: 'accused', color: '#f87171', riskScore: 85, shape: 'dot', size: 25 },
    { id: 'ACC-4412', label: 'Suresh Gowda\n(Co-Accused)', type: 'accused', color: '#f87171', riskScore: 72, shape: 'dot', size: 20 },
    { id: 'CASE-101', label: 'FIR CR-2024-001\n(Bengaluru)', type: 'case', color: '#38bdf8', shape: 'diamond', size: 22 },
    { id: 'CASE-102', label: 'FIR CR-2024-004\n(Koramangala)', type: 'case', color: '#38bdf8', shape: 'diamond', size: 18 },
    { id: 'VIC-301',  label: 'Anand Rao\n(Victim)', type: 'victim', color: '#fbbf24', shape: 'square', size: 15 },
    { id: 'OFF-101',  label: 'Inspector Patil\n(IO)', type: 'officer', color: '#34d399', shape: 'triangle', size: 18 }
  ],
  edges: [
    { from: 'ACC-8821', to: 'CASE-101', label: 'Prime Suspect' },
    { from: 'ACC-4412', to: 'CASE-101', label: 'Co-Accused' },
    { from: 'ACC-8821', to: 'CASE-102', label: 'Repeat Suspect' },
    { from: 'VIC-301',  to: 'CASE-101', label: 'Complainant' },
    { from: 'OFF-101',  to: 'CASE-101', label: 'Investigating Officer' }
  ]
};

async function handler(a, b, c) {
  const { req, res } = resolveArgs(a, b, c);
  setCORS(res);

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') return res.status(200).send('');
    return;
  }

  const urlStr = req.url || req.path || '';
  const isSearch = urlStr.includes('search') || (req.query && req.query.name);

  if (isSearch) {
    const term = (req.query?.name || '').toLowerCase().trim();
    const matched = ALL_ACCUSED.filter(a =>
      a.Name.toLowerCase().includes(term) ||
      a.PersonID.toLowerCase().includes(term) ||
      term === ''
    );
    const resultList = matched.length > 0 ? matched : ALL_ACCUSED;
    const payload = { accused: resultList };
    if (typeof res.status === 'function') return res.status(200).json(payload);
    return payload;
  }

  const pathParts = urlStr.split('?')[0].split('/').filter(Boolean);
  const targetId = pathParts[pathParts.length - 1] || 'ACC-8821';

  const payload = {
    accusedId: targetId,
    nodes: FALLBACK_GRAPH.nodes,
    edges: FALLBACK_GRAPH.edges,
    fromCache: false
  };

  if (typeof res.status === 'function') {
    return res.status(200).json(payload);
  }
  return payload;
}

module.exports = handler;
