// Auth middleware for CrimeIQ Catalyst functions
// Role is stored in a custom header set by the API Gateway after authentication.

function extractRole(req) {
  return req.headers['x-user-role'] || 'investigator';
}

function extractUserEmail(req) {
  return req.headers['x-user-email'] || 'unknown';
}

/**
 * Masks PII fields for non-investigator roles (e.g. policymakers).
 * @param {Array|Object} data - Query result rows
 * @param {string} role - The user role from the request header
 */
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
