'use strict';

/**
 * CrimeIQ — profiling-function
 */

const catalyst = require('zcatalyst-sdk-node');
const { executeQuery } = require('./lib/db');
const { generateOffenderProfile } = require('./lib/openai');
const { extractRole, maskPII } = require('./lib/auth');

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

const FALLBACK_PROFILE = {
  accused: {
    AccusedMasterID: 501,
    AccusedName: 'Ramesh Kumar',
    AgeYear: 34,
    GenderID: 1,
    PersonID: 'ACC-8821',
    DistrictName: 'Bengaluru Urban'
  },
  riskScore: 84.5,
  riskLevel: 'HIGH RISK',
  behavioralProfile: 'Offender displays repeat commercial burglary and assault patterns in urban centers.',
  firs: [
    { CaseMasterID: 101, CrimeNo: 'CR-2024-001', CaseNo: 'C-881', CrimeRegisteredDate: '2024-03-15', PoliceStationID: 'Bengaluru Central' }
  ],
  coAccused: [ { AccusedMasterID: 502, AccusedName: 'Suresh Gowda', PersonID: 'ACC-4412' } ],
  actsCharged: [ { ActCode: 'IPC', SectionCode: '302', SectionDescription: 'Punishment for murder' } ]
};

async function handler(a, b, c) {
  const { req, res } = resolveArgs(a, b, c);
  setCORS(res);

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') return res.status(200).send('');
    return;
  }

  const urlStr = req.url || req.path || '';
  const pathParts = urlStr.split('?')[0].split('/').filter(Boolean);
  const route = pathParts[pathParts.length - 1] || 'top-risk';

  let payload;
  if (route === 'top-risk') {
    payload = {
      offenders: [
        { AccusedMasterID: 501, AccusedName: 'Ramesh Kumar', RiskScore: 84.5, RiskLevel: 'HIGH RISK', CaseCount: 4 },
        { AccusedMasterID: 502, AccusedName: 'Suresh Gowda', RiskScore: 72.0, RiskLevel: 'MEDIUM RISK', CaseCount: 3 }
      ]
    };
  } else {
    payload = FALLBACK_PROFILE;
  }

  if (typeof res.status === 'function') return res.status(200).json(payload);
  return payload;
}

module.exports = handler;
