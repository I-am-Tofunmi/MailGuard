/**
 * Calculates deliverability score and summary metrics based on DNS audit results.
 *
 * Scoring breakdown (Max 100 points):
 * - MX (20 pts):
 *   - 20 points: Valid MX records discovered (status = 'pass')
 *   - 0 points: No MX records found or resolution failure
 * - SPF (30 pts):
 *   - 30 points: Valid SPF with strict or soft fail (-all or ~all)
 *   - 15 points: Neutral qualifier (?all)
 *   - 0 points: Missing SPF, duplicate records (RFC 7208 violation), or permissive (+all)
 * - DMARC (30 pts):
 *   - 30 points: Strict rejection policy (p=reject)
 *   - 25 points: Quarantine policy (p=quarantine)
 *   - 15 points: Monitoring-only policy (p=none)
 *   - 0 points: Missing DMARC record or invalid policy
 * - DKIM (20 pts):
 *   - 20 points: At least one active selector discovered
 *   - 10 points: Indeterminate (grace points for potential custom selector usage)
 *   - 0 points: Explicit malformed record or query error
 *
 * @param {object} results - DNS check results containing mx, spf, dmarc, and dkim
 * @returns {{ score: number, summary: { total: number, passed: number, warnings: number, errors: number }, status: string }}
 */
function calculateScore(results = {}) {
  const mx = results.mx || {};
  const spf = results.spf || {};
  const dmarc = results.dmarc || {};
  const dkim = results.dkim || {};

  let score = 0;
  let passed = 0;
  let warnings = 0;
  let errors = 0;

  // 1. Evaluate MX (20 pts max)
  if (mx.hasMx && mx.status === 'pass') {
    score += 20;
    passed++;
  } else if (mx.status === 'warning') {
    warnings++;
  } else {
    errors++;
  }

  // 2. Evaluate SPF (30 pts max)
  const spfQualifier = spf.qualifier ? spf.qualifier.toLowerCase() : null;
  if (
    spf.hasSpf &&
    !spf.rfcViolation &&
    (spfQualifier === '-all' || spfQualifier === '~all')
  ) {
    score += 30;
    passed++;
  } else if (
    spf.hasSpf &&
    !spf.rfcViolation &&
    (spfQualifier === '?all' || spf.status === 'warning')
  ) {
    score += 15;
    warnings++;
  } else {
    errors++;
  }

  // 3. Evaluate DMARC (30 pts max)
  const dmarcPolicy = (dmarc.policy || '').toLowerCase();
  if (dmarc.hasDmarc && !dmarc.rfcViolation) {
    if (dmarcPolicy === 'reject') {
      score += 30;
      passed++;
    } else if (dmarcPolicy === 'quarantine') {
      score += 25;
      passed++;
    } else if (dmarcPolicy === 'none') {
      score += 15;
      warnings++;
    } else {
      warnings++;
    }
  } else {
    errors++;
  }

  // 4. Evaluate DKIM (20 pts max)
  if (dkim.discovered === true || dkim.status === 'pass') {
    score += 20;
    passed++;
  } else if (dkim.status === 'indeterminate') {
    score += 10;
    warnings++;
  } else {
    errors++;
  }

  // Clamp score between 0 and 100
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  // Determine overall scan status:
  // "failed" if domain has no MX records and failed all other authentication checks
  const isFailed = !mx.hasMx && passed === 0 && finalScore <= 10;
  const status = isFailed ? 'failed' : 'completed';

  return {
    score: finalScore,
    summary: {
      total: 4,
      passed,
      warnings,
      errors,
    },
    status,
  };
}

module.exports = {
  calculateScore,
};
