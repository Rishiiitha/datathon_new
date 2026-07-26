'use strict';

/**
 * CrimeIQ — investigation-function
 */

const catalyst = require('zcatalyst-sdk-node');

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

const FALLBACK_CASE = {
  caseMaster: {
    CaseMasterID: 101,
    CrimeNo: 'CR-2024-001',
    CaseNo: 'C-881',
    CrimeRegisteredDate: '2024-03-15',
    PoliceStationID: 'Bengaluru Central',
    DistrictName: 'Bengaluru Urban',
    BriefFacts: 'Heinous offense investigation under IPC Section 302/380.',
    CaseStatusName: 'Under Investigation',
    GravityOffence: 'Heinous'
  },
  accused: [
    { AccusedMasterID: 501, AccusedName: 'Ramesh Kumar', AgeYear: 34, PersonID: 'ACC-8821' },
    { AccusedMasterID: 502, AccusedName: 'Suresh Gowda', AgeYear: 29, PersonID: 'ACC-4412' }
  ],
  victims: [ { VictimMasterID: 301, VictimName: 'Anand Rao', AgeYear: 45 } ],
  acts: [ { ActCode: 'IPC', SectionCode: '302', SectionDescription: 'Punishment for murder' } ],
  aiSummary: 'FIR CR-2024-001 involves a burglary and homicide incident registered at Bengaluru Central.',
  similarCases: [ { CaseMasterID: 201, CrimeNo: 'FIR-2024-101', MatchScore: '92%', SimilarityReason: 'Identical MO in commercial premises' } ],
  leads: [
    'Cross-examine CDR location data for Ramesh Kumar near Koramangala tower on night of incident.',
    'Execute warrant on HDFC account 987112001 for wire transfers following the crime date.'
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
  const pathParts = urlStr.split('?')[0].split('/').filter(Boolean);
  const route = pathParts[pathParts.length - 2] || 'case';

  let payload = FALLBACK_CASE;
  if (route === 'similar') payload = { similarCases: FALLBACK_CASE.similarCases };
  else if (route === 'leads') payload = { leads: FALLBACK_CASE.leads };

  if (typeof res.status === 'function') return res.status(200).json(payload);
  return payload;
}

module.exports = handler;
