const dns = require('dns').promises;

/**
 * Standard list of commonly used DKIM selectors across major email service providers
 * (e.g., Google Workspace, Microsoft 365, Mailchimp, SendGrid, Amazon SES, Postmark).
 */
const DEFAULT_DKIM_SELECTORS = [
  'default',
  'google',
  'selector1',
  'selector2',
  'k1',
  'mail',
  'smtp',
  's1',
  's2',
  'dkim',
];

/**
 * Extracts a normalized, pure domain name from email strings or URLs.
 * Handles inputs like 'user@example.com', 'https://mail.example.com/path', 'example.com:8080'.
 *
 * @param {string} input - The input string representing a domain, email, or URL.
 * @returns {string} The normalized root or subdomain hostname.
 */
function cleanDomain(input) {
  if (!input || typeof input !== 'string') {
    throw new Error('A valid domain string is required.');
  }

  let cleaned = input.trim().toLowerCase();

  // Strip mailto: prefix if present
  if (cleaned.startsWith('mailto:')) {
    cleaned = cleaned.replace(/^mailto:/, '');
  }

  // Handle email addresses: extract domain portion after '@'
  if (cleaned.includes('@')) {
    cleaned = cleaned.split('@').pop().trim();
  }

  // If input contains a protocol or double slashes, parse via URL
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://') || cleaned.startsWith('//')) {
    try {
      const urlToParse = cleaned.startsWith('//') ? `http:${cleaned}` : cleaned;
      const parsedUrl = new URL(urlToParse);
      cleaned = parsedUrl.hostname;
    } catch {
      // Fallback manual strip if URL parsing fails
      cleaned = cleaned.replace(/^(?:https?:)?\/\//, '');
    }
  }

  // Strip paths, query strings, and hashes
  cleaned = cleaned.split('/')[0];
  cleaned = cleaned.split('?')[0];
  cleaned = cleaned.split('#')[0];

  // Strip port numbers (e.g., example.com:3000)
  cleaned = cleaned.replace(/:\d+$/, '');

  // Strip leading and trailing dots
  cleaned = cleaned.replace(/^\.+|\.+$/g, '');

  if (!cleaned) {
    throw new Error('Could not extract a valid domain from the provided input.');
  }

  return cleaned;
}

/**
 * Resolves MX (Mail Exchange) records for a domain and sorts them by priority.
 *
 * @param {string} domain
 * @returns {Promise<object>} Structured MX diagnostic result
 */
async function checkMX(domain) {
  const targetDomain = cleanDomain(domain);

  try {
    const rawRecords = await dns.resolveMx(targetDomain);
    const records = (rawRecords || []).sort((a, b) => a.priority - b.priority);

    if (records.length === 0) {
      return {
        status: 'warning',
        hasMx: false,
        records: [],
        message: 'No MX records found. The domain cannot receive inbound emails.',
      };
    }

    return {
      status: 'pass',
      hasMx: true,
      records,
      primaryExchange: records[0].exchange,
      message: `Found ${records.length} MX record(s). Mail routing is active.`,
    };
  } catch (error) {
    if (
      error.code === 'ENODATA' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'NODATA' ||
      error.code === 'NOTFOUND'
    ) {
      return {
        status: 'warning',
        hasMx: false,
        records: [],
        message: 'No MX records found for this domain. Email receiving is not configured.',
      };
    }

    return {
      status: 'error',
      hasMx: false,
      records: [],
      error: error.message,
      message: `Failed to resolve MX records: ${error.message}`,
    };
  }
}

/**
 * Parses SPF mechanisms and extracts qualifier details.
 *
 * @param {string} spfRecord
 * @returns {object} Parsed SPF details
 */
function parseSpfRecord(spfRecord) {
  const tokens = spfRecord.split(/\s+/).filter(Boolean);
  const mechanisms = [];
  let qualifier = null;
  let allMechanism = null;

  for (const token of tokens) {
    const lower = token.toLowerCase();
    if (lower === 'v=spf1') continue;

    // Check for 'all' mechanism (e.g., -all, ~all, ?all, +all, all)
    const allMatch = lower.match(/^([-+~?])?all$/);
    if (allMatch) {
      qualifier = allMatch[1] || '+';
      allMechanism = `${qualifier}all`;
      mechanisms.push(allMechanism);
    } else {
      mechanisms.push(token);
    }
  }

  return {
    record: spfRecord,
    mechanisms,
    qualifier,
    allMechanism,
  };
}

/**
 * Resolves SPF configuration on apex domain, checks RFC 7208 compliance,
 * and analyzes qualifier enforcement.
 *
 * @param {string} domain
 * @returns {Promise<object>} Structured SPF diagnostic result
 */
async function checkSPF(domain) {
  const targetDomain = cleanDomain(domain);

  try {
    const rawTxt = await dns.resolveTxt(targetDomain);
    const flattenedTxt = (rawTxt || []).map((chunks) => chunks.join(''));

    // Filter TXT records starting with v=spf1
    const spfRecords = flattenedTxt.filter((rec) =>
      rec.trim().toLowerCase().startsWith('v=spf1')
    );

    // RFC 7208 Section 3.2: Multiple SPF records are strictly forbidden and cause PermError
    if (spfRecords.length > 1) {
      return {
        status: 'error',
        hasSpf: true,
        rfcViolation: true,
        recordCount: spfRecords.length,
        records: spfRecords,
        record: null,
        qualifier: null,
        message:
          'Multiple SPF records detected. RFC 7208 forbids multiple SPF records on a single domain; receiving mail transfer agents (MTAs) will return a PermError.',
      };
    }

    if (spfRecords.length === 0) {
      return {
        status: 'error',
        hasSpf: false,
        rfcViolation: false,
        recordCount: 0,
        records: [],
        record: null,
        qualifier: null,
        message:
          'No SPF record found. Senders can forge emails using your domain without SPF authentication checks.',
      };
    }

    const singleRecord = spfRecords[0];
    const parsed = parseSpfRecord(singleRecord);

    // Determine status based on qualifier
    let status = 'pass';
    let message = 'Valid SPF configuration detected.';

    if (parsed.qualifier === '-') {
      status = 'pass';
      message = 'Strict SPF policy (-all) configured. Unauthorized senders will be rejected.';
    } else if (parsed.qualifier === '~') {
      status = 'pass';
      message =
        'SoftFail SPF policy (~all) configured. Unlisted senders will be accepted but flagged as suspicious.';
    } else if (parsed.qualifier === '?') {
      status = 'warning';
      message =
        'Neutral SPF policy (?all) configured. Does not provide explicit authentication protection against unauthorized senders.';
    } else if (parsed.qualifier === '+') {
      status = 'error';
      message =
        'Permissive SPF policy (+all) configured. Explicitly permits any server on the internet to send mail on your behalf.';
    } else {
      status = 'warning';
      message =
        'SPF record lacks an explicit "all" fallback mechanism (-all / ~all). Mail receivers may handle unauthorized senders unpredictably.';
    }

    return {
      status,
      hasSpf: true,
      rfcViolation: false,
      recordCount: 1,
      record: singleRecord,
      qualifier: parsed.allMechanism,
      mechanisms: parsed.mechanisms,
      message,
    };
  } catch (error) {
    if (
      error.code === 'ENODATA' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'NODATA' ||
      error.code === 'NOTFOUND'
    ) {
      return {
        status: 'error',
        hasSpf: false,
        rfcViolation: false,
        recordCount: 0,
        records: [],
        record: null,
        qualifier: null,
        message: 'No SPF record found on domain apex.',
      };
    }

    return {
      status: 'error',
      hasSpf: false,
      rfcViolation: false,
      recordCount: 0,
      records: [],
      record: null,
      qualifier: null,
      error: error.message,
      message: `Failed to resolve SPF record: ${error.message}`,
    };
  }
}

/**
 * Parses DMARC tag-value pairs according to RFC 7489.
 *
 * @param {string} record
 * @returns {object} Parsed tags dictionary
 */
function parseDmarcTags(record) {
  const tags = {};
  const parts = record.split(';');

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex !== -1) {
      const key = trimmed.slice(0, eqIndex).trim().toLowerCase();
      const value = trimmed.slice(eqIndex + 1).trim();
      if (key) {
        tags[key] = value;
      }
    }
  }

  return tags;
}

/**
 * Resolves DMARC policy at `_dmarc.<domain>` and analyzes enforcement settings.
 *
 * @param {string} domain
 * @returns {Promise<object>} Structured DMARC diagnostic result
 */
async function checkDMARC(domain) {
  const targetDomain = cleanDomain(domain);
  const dmarcHost = `_dmarc.${targetDomain}`;

  try {
    const rawTxt = await dns.resolveTxt(dmarcHost);
    const flattenedTxt = (rawTxt || []).map((chunks) => chunks.join(''));

    const dmarcRecords = flattenedTxt.filter((rec) =>
      rec.trim().toLowerCase().startsWith('v=dmarc1')
    );

    // RFC 7489 Section 6.6.3: More than one DMARC record must be treated as no record
    if (dmarcRecords.length > 1) {
      return {
        status: 'error',
        hasDmarc: false,
        rfcViolation: true,
        recordCount: dmarcRecords.length,
        records: dmarcRecords,
        record: null,
        policy: null,
        message:
          'Multiple DMARC records detected at _dmarc. RFC 7489 forbids multiple DMARC records; receivers will ignore all records.',
      };
    }

    if (dmarcRecords.length === 0) {
      return {
        status: 'error',
        hasDmarc: false,
        rfcViolation: false,
        recordCount: 0,
        records: [],
        record: null,
        policy: null,
        message: `No DMARC record found at ${dmarcHost}. Domain lacks policy for handling unauthorized senders.`,
      };
    }

    const singleRecord = dmarcRecords[0];
    const tags = parseDmarcTags(singleRecord);
    const policy = (tags.p || '').toLowerCase();

    let status = 'pass';
    let message = `DMARC record found with policy "${policy || 'none'}".`;

    if (policy === 'reject') {
      status = 'pass';
      message =
        'Strict DMARC policy configured (p=reject). Unauthenticated emails are rejected by receiving servers.';
    } else if (policy === 'quarantine') {
      status = 'pass';
      message =
        'Protective DMARC policy configured (p=quarantine). Unauthenticated emails are directed to spam/quarantine.';
    } else if (policy === 'none') {
      status = 'warning';
      message =
        'Monitoring-only DMARC policy configured (p=none). Receivers will report failures but will not block spoofed emails.';
    } else {
      status = 'warning';
      message =
        'DMARC record found, but the policy ("p=") tag is missing or not recognized (expected none, quarantine, or reject).';
    }

    return {
      status,
      hasDmarc: true,
      rfcViolation: false,
      recordCount: 1,
      record: singleRecord,
      policy: policy || null,
      subdomainPolicy: tags.sp || null,
      percentage: tags.pct ? parseInt(tags.pct, 10) : 100,
      rua: tags.rua || null,
      ruf: tags.ruf || null,
      tags,
      message,
    };
  } catch (error) {
    if (
      error.code === 'ENODATA' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'NODATA' ||
      error.code === 'NOTFOUND'
    ) {
      return {
        status: 'error',
        hasDmarc: false,
        rfcViolation: false,
        recordCount: 0,
        records: [],
        record: null,
        policy: null,
        message: `No DMARC record found at ${dmarcHost}.`,
      };
    }

    return {
      status: 'error',
      hasDmarc: false,
      rfcViolation: false,
      recordCount: 0,
      records: [],
      record: null,
      policy: null,
      error: error.message,
      message: `Failed to resolve DMARC record: ${error.message}`,
    };
  }
}

/**
 * Probes DKIM DNS records using default standard selectors and optional user-provided selectors.
 *
 * @param {string} domain
 * @param {string[]|string} [customSelectors=[]]
 * @returns {Promise<object>} Structured DKIM diagnostic result
 */
async function checkDKIM(domain, customSelectors = []) {
  const targetDomain = cleanDomain(domain);

  // Normalize custom selectors array or comma-separated string
  let customList = [];
  if (Array.isArray(customSelectors)) {
    customList = customSelectors;
  } else if (typeof customSelectors === 'string') {
    customList = customSelectors.split(',').map((s) => s.trim());
  }

  // Combine and deduplicate selector list
  const selectorsToProbe = Array.from(
    new Set([...DEFAULT_DKIM_SELECTORS, ...customList])
  )
    .map((s) => String(s || '').trim().toLowerCase())
    .filter(Boolean);

  // Concurrently query each selector at <selector>._domainkey.<domain>
  const probePromises = selectorsToProbe.map(async (selector) => {
    const dkimHost = `${selector}._domainkey.${targetDomain}`;
    try {
      const rawTxt = await dns.resolveTxt(dkimHost);
      const flattened = (rawTxt || []).map((chunks) => chunks.join(''));

      // Look for public key definition or DKIM version identifier
      const dkimMatch = flattened.find(
        (rec) =>
          rec.includes('p=') || rec.toLowerCase().startsWith('v=dkim1')
      );

      if (dkimMatch) {
        return {
          selector,
          host: dkimHost,
          record: dkimMatch,
          hasKey: dkimMatch.includes('p='),
          discovered: true,
        };
      }
      return null;
    } catch {
      // Selector does not exist or timed out; normal for unassigned selectors
      return null;
    }
  });

  const probeResults = await Promise.all(probePromises);
  const discovered = probeResults.filter(Boolean);

  if (discovered.length > 0) {
    const selectorNames = discovered.map((d) => d.selector);
    return {
      status: 'pass',
      discovered: true,
      selectorsProbed: selectorsToProbe,
      discoveredSelectors: selectorNames,
      records: discovered,
      primaryRecord: discovered[0].record,
      message: `Discovered active DKIM record(s) on selector(s): ${selectorNames.join(', ')}.`,
    };
  }

  // If no records discovered among probed selectors, report as indeterminate
  return {
    status: 'indeterminate',
    discovered: false,
    selectorsProbed: selectorsToProbe,
    discoveredSelectors: [],
    records: [],
    primaryRecord: null,
    message:
      'No DKIM records found on standard selectors. DKIM uses custom selector names defined by your email provider (e.g. Google Workspace, Microsoft 365, Mailgun). Specify your selector to verify DKIM configuration.',
  };
}

/**
 * Runs MX, SPF, DMARC, and DKIM diagnostics concurrently for a given domain.
 *
 * @param {string} domain
 * @param {string[]|string} [customSelectors=[]]
 * @returns {Promise<object>} Consolidated diagnostic audit payload
 */
async function auditDomain(domain, customSelectors = []) {
  const cleanedDomain = cleanDomain(domain);
  const timestamp = new Date().toISOString();

  // Run all four core checks concurrently
  const [mx, spf, dmarc, dkim] = await Promise.all([
    checkMX(cleanedDomain),
    checkSPF(cleanedDomain),
    checkDMARC(cleanedDomain),
    checkDKIM(cleanedDomain, customSelectors),
  ]);

  // Compute a consolidated health overview
  const checks = [
    { id: 'mx', name: 'MX Records', result: mx },
    { id: 'spf', name: 'SPF Record', result: spf },
    { id: 'dmarc', name: 'DMARC Policy', result: dmarc },
    { id: 'dkim', name: 'DKIM Signatures', result: dkim },
  ];

  const passCount = checks.filter((c) => c.result.status === 'pass').length;
  const warningCount = checks.filter((c) => c.result.status === 'warning').length;
  const errorCount = checks.filter((c) => c.result.status === 'error').length;
  const indeterminateCount = checks.filter((c) => c.result.status === 'indeterminate').length;

  return {
    domain: cleanedDomain,
    timestamp,
    mx,
    spf,
    dmarc,
    dkim,
    summary: {
      totalChecks: checks.length,
      passed: passCount,
      warnings: warningCount,
      errors: errorCount,
      indeterminate: indeterminateCount,
      score: Math.round(((passCount + indeterminateCount * 0.5) / checks.length) * 100),
    },
  };
}

module.exports = {
  cleanDomain,
  checkMX,
  checkSPF,
  checkDMARC,
  checkDKIM,
  auditDomain,
  DEFAULT_DKIM_SELECTORS,
};
