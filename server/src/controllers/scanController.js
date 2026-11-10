const { auditDomain } = require('../services/dnsService');
const { calculateScore } = require('../utils/scoreCalculator');
const db = require('../config/db');

/**
 * Controller to handle domain audit requests.
 * Runs DNS deliverability checks, computes deliverability score,
 * and persists the scan into the database if the user is authenticated.
 *
 * POST /api/scan/audit
 * Body: { domain: string, selectors?: string[] | string }
 */
async function handleDomainScan(req, res) {
  try {
    const { domain, selectors } = req.body || {};

    if (!domain || typeof domain !== 'string' || !domain.trim()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'The "domain" field is required and must be a non-empty string.',
      });
    }

    // Perform DNS deliverability audit
    const auditResult = await auditDomain(domain, selectors);

    // Structure raw DNS check results
    const results = {
      mx: auditResult.mx,
      spf: auditResult.spf,
      dmarc: auditResult.dmarc,
      dkim: auditResult.dkim,
    };

    // Calculate score, summary metrics, and scan status
    const { score, summary, status } = calculateScore(results);

    let scanId = null;
    let createdAt = auditResult.timestamp;

    // If request has an authenticated user, persist the scan
    if (req.user && req.user.id) {
      const insertSql = `
        INSERT INTO scans (user_id, domain, status, score, summary, results)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, created_at;
      `;
      const insertParams = [
        req.user.id,
        auditResult.domain,
        status,
        score,
        JSON.stringify(summary),
        JSON.stringify(results),
      ];

      const dbRes = await db.query(insertSql, insertParams);
      if (dbRes.rows && dbRes.rows.length > 0) {
        scanId = dbRes.rows[0].id;
        createdAt = dbRes.rows[0].created_at;
      }
    }

    return res.status(200).json({
      success: true,
      id: scanId,
      domain: auditResult.domain,
      status,
      score,
      summary,
      results,
      created_at: createdAt,
      // Retain top-level checks for compatibility with frontend components
      mx: results.mx,
      spf: results.spf,
      dmarc: results.dmarc,
      dkim: results.dkim,
      timestamp: createdAt,
      data: {
        id: scanId,
        domain: auditResult.domain,
        status,
        score,
        summary,
        results,
        created_at: createdAt,
      },
    });
  } catch (error) {
    console.error('Domain audit error:', error);

    if (error.message && error.message.includes('valid domain')) {
      return res.status(400).json({
        error: 'Invalid Domain',
        message: error.message,
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'An unexpected error occurred while auditing the domain.',
    });
  }
}

module.exports = {
  handleDomainScan,
  auditDomainController: handleDomainScan,
};
