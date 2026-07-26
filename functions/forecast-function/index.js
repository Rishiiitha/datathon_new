'use strict';

/**
 * CrimeIQ — forecast-function
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

const FALLBACK_FORECAST = {
  historical: [
    { month: '2024-01', count: 990 },
    { month: '2024-02', count: 1050 },
    { month: '2024-03', count: 1100 },
    { month: '2024-04', count: 1080 },
    { month: '2024-05', count: 1150 },
    { month: '2024-06', count: 1120 },
    { month: '2024-07', count: 1200 }
  ],
  predicted: [
    { date: '2024-08-01', count: 1220, isAlert: true },
    { date: '2024-08-15', count: 1260, isAlert: true }
  ],
  hotspots: [
    { district: 'Bengaluru Urban', lat: 12.9716, lng: 77.5946, predictedCount: 1290, severity: 'HIGH' },
    { district: 'Mysuru', lat: 12.2958, lng: 76.6394, predictedCount: 840, severity: 'MEDIUM' }
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
  const route = pathParts[pathParts.length - 1] || 'forecast';

  const payload = route === 'hotspots' ? { hotspots: FALLBACK_FORECAST.hotspots } : FALLBACK_FORECAST;
  if (typeof res.status === 'function') return res.status(200).json(payload);
  return payload;
}

module.exports = handler;
