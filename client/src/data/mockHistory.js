/**
 * mockHistory.js
 *
 * Placeholder history data for the MailGuard History page.
 * Replace this module with real API / Supabase calls once the
 * backend scanning service is available.
 *
 * Each entry shape:
 * {
 *   id:      string  – unique identifier
 *   email:   string  – email address or domain that was checked
 *   domain:  string  – domain portion (used for result navigation)
 *   date:    string  – ISO 8601 date string (YYYY-MM-DD)
 *   result:  "good" | "attention" | "action"
 *   label:   string  – human-readable status label shown to the user
 *   summary: string  – one-sentence plain-English description
 *   checks:  Array   – scan check objects compatible with ResultPage
 * }
 */

// ── helpers ────────────────────────────────────────────────────────────────

function isoDateDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

// ── reusable demo check sets ───────────────────────────────────────────────

const allPassedChecks = [
  { id: "domain",    title: "Domain found",         status: "passed",  description: "Domain successfully resolved" },
  { id: "mx",        title: "MX Records",           status: "passed",  description: "Mail routing is active" },
  { id: "spf",       title: "SPF Record",           status: "passed",  description: "SPF record is valid" },
  { id: "dkim",      title: "DKIM",                 status: "passed",  description: "Cryptographic signature valid" },
  { id: "dmarc",     title: "DMARC",                status: "passed",  description: "DMARC policy found" },
  { id: "blacklist", title: "Blacklist Reputation", status: "passed",  description: "No issues detected" },
];

const spfFailedChecks = [
  { id: "domain",    title: "Domain found",         status: "passed",  description: "Domain successfully resolved" },
  { id: "mx",        title: "MX Records",           status: "passed",  description: "Mail routing is active" },
  { id: "spf",       title: "SPF Record",           status: "failed",  description: "Multiple SPF records detected" },
  { id: "dkim",      title: "DKIM",                 status: "passed",  description: "Cryptographic signature valid" },
  { id: "dmarc",     title: "DMARC",                status: "passed",  description: "DMARC policy found" },
  { id: "blacklist", title: "Blacklist Reputation", status: "passed",  description: "No issues detected" },
];

const multiIssueChecks = [
  { id: "domain",    title: "Domain found",         status: "passed",  description: "Domain successfully resolved" },
  { id: "mx",        title: "MX Records",           status: "passed",  description: "Mail routing is active" },
  { id: "spf",       title: "SPF Record",           status: "failed",  description: "Multiple SPF records detected" },
  { id: "dkim",      title: "DKIM",                 status: "failed",  description: "DKIM record missing or invalid" },
  { id: "dmarc",     title: "DMARC",                status: "failed",  description: "DMARC policy not found" },
  { id: "blacklist", title: "Blacklist Reputation", status: "passed",  description: "No issues detected" },
];

// ── mock entries ───────────────────────────────────────────────────────────

export const MOCK_HISTORY = [
  {
    id: "h1",
    email: "hello@mybusiness.com",
    domain: "mybusiness.com",
    date: isoDateDaysAgo(1),
    result: "good",
    label: "Looking good",
    summary: "All email authentication checks passed.",
    checks: allPassedChecks,
  },
  {
    id: "h2",
    email: "invoices@tradersng.com",
    domain: "tradersng.com",
    date: isoDateDaysAgo(3),
    result: "attention",
    label: "Needs attention",
    summary: "One SPF record issue was found that may affect delivery.",
    checks: spfFailedChecks,
  },
  {
    id: "h3",
    email: "support@shopkenya.co.ke",
    domain: "shopkenya.co.ke",
    date: isoDateDaysAgo(7),
    result: "good",
    label: "Looking good",
    summary: "No issues found — your emails are properly authenticated.",
    checks: allPassedChecks,
  },
  {
    id: "h4",
    email: "orders@crafts-gh.com",
    domain: "crafts-gh.com",
    date: isoDateDaysAgo(14),
    result: "action",
    label: "Action recommended",
    summary: "Several authentication issues need your attention.",
    checks: multiIssueChecks,
  },
  {
    id: "h5",
    email: "info@savannah-retail.com",
    domain: "savannah-retail.com",
    date: isoDateDaysAgo(21),
    result: "attention",
    label: "Needs attention",
    summary: "SPF configuration may be causing delivery problems.",
    checks: spfFailedChecks,
  },
  {
    id: "h6",
    email: "admin@lagosboutique.ng",
    domain: "lagosboutique.ng",
    date: isoDateDaysAgo(30),
    result: "good",
    label: "Looking good",
    summary: "Email setup looks healthy — all checks passed.",
    checks: allPassedChecks,
  },
];
