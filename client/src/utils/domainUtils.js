/**
 * List of common free public webmail providers.
 * MailGuard is designed for custom business domains where owners can configure DNS.
 */
export const PUBLIC_WEBMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'aol.com',
  'zoho.com',
  'mail.com',
  'yandex.com',
];

/**
 * Sanitizes user input into a clean domain name:
 * - Trims leading/trailing whitespace
 * - Converts to lowercase
 * - Strips protocols (e.g., https://, http://, mailto:)
 * - Extracts the domain part if a full email address is entered (e.g., info@company.com -> company.com)
 * - Strips slashes, ports, query strings, and paths
 *
 * @param {string} input
 * @returns {string} Sanitized domain name
 */
export function sanitizeDomain(input) {
  if (!input || typeof input !== 'string') return '';

  let cleaned = input.trim().toLowerCase();

  // Strip mailto: prefix if present
  if (cleaned.startsWith('mailto:')) {
    cleaned = cleaned.replace(/^mailto:/, '').trim();
  }

  // If a full email address was entered, take the domain portion after '@'
  if (cleaned.includes('@')) {
    const parts = cleaned.split('@');
    cleaned = parts[parts.length - 1].trim();
  }

  // Strip protocols (http://, https://, //)
  cleaned = cleaned.replace(/^[a-z]+:\/\//, '');
  cleaned = cleaned.replace(/^\/\//, '');

  // Strip path, query params, hash
  cleaned = cleaned.split('/')[0];
  cleaned = cleaned.split('?')[0];
  cleaned = cleaned.split('#')[0];

  // Strip ports (e.g. :5000)
  cleaned = cleaned.replace(/:\d+$/, '');

  // Strip any remaining leading or trailing slashes / dots / spaces
  cleaned = cleaned.replace(/^[\s./]+|[\s./]+$/g, '');

  return cleaned;
}

/**
 * Checks if a given input or domain belongs to a public free webmail provider.
 *
 * @param {string} input
 * @returns {boolean}
 */
export function isPublicWebmailDomain(input) {
  const sanitized = sanitizeDomain(input);
  if (!sanitized) return false;

  return PUBLIC_WEBMAIL_DOMAINS.some(
    (publicDomain) => sanitized === publicDomain || sanitized.endsWith(`.${publicDomain}`)
  );
}
