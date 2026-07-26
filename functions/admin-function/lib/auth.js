function extractRole(req) {
  return req.headers['x-user-role'] || 'investigator';
}

function extractUserEmail(req) {
  return req.headers['x-user-email'] || 'unknown';
}

function maskPII(data, role) {
  if (role === 'policymaker') {
    if (Array.isArray(data)) {
      return data.map((row) => {
        const masked = { ...row };
        ['AccusedName', 'VictimName', 'ComplainantName', 'FirstName'].forEach(
          (field) => {
            if (masked[field] !== undefined) masked[field] = '***MASKED***';
          }
        );
        return masked;
      });
    }
  }
  return data;
}

module.exports = { extractRole, extractUserEmail, maskPII };
