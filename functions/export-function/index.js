'use strict';

/**
 * CrimeIQ — export-function
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

async function handler(a, b, c) {
  const { req, res } = resolveArgs(a, b, c);
  setCORS(res);

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') return res.status(200).send('');
    return;
  }

  const html = `<!DOCTYPE html>
<html>
<head><title>CrimeIQ — Intelligence Report</title></head>
<body style="font-family:Arial;margin:40px;">
  <h1>🔵 CrimeIQ — Karnataka Police Crime Intelligence Report</h1>
  <p>Exported session report generated for authorized law enforcement personnel.</p>
</body>
</html>`;

  if (typeof res.set === 'function') {
    res.set('Content-Type', 'text/html');
    res.set('Content-Disposition', 'attachment; filename="crimeiq_session_report.html"');
    return res.status(200).send(html);
  }
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', 'attachment; filename="crimeiq_session_report.html"');
  }
  return html;
}

module.exports = handler;
