import { useState, useEffect } from "react";
import { useLocation, useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  Check,
  CheckCircle2,
  CheckCheck,
  AlertTriangle,
  Info,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  ShieldCheck,
  Shield,
  Server,
  RotateCcw,
  LoaderCircle,
  MailSearch,
  Sparkles,
  Copy,
  ChevronDown,
  ChevronUp,
  Send,
  Mail,
  X,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getScanById } from "../services/api";
import { sanitizeDomain, isWebmailDomain } from "../utils/domainUtils";

const REGISTRAR_GUIDES = [
  {
    id: "whogohost",
    name: "Whogohost / Truehost",
    steps: [
      "Log in to your Client Area and click Domains > Manage DNS.",
      "Click Add New Record (choose TXT).",
      "Enter the Host name (@ or _dmarc), paste the value, and click Save Changes.",
    ],
  },
  {
    id: "cpanel",
    name: "cPanel (Zone Editor)",
    steps: [
      "Log in to cPanel and open Zone Editor.",
      "Click Manage next to your domain, then click + Add Record > Add TXT Record.",
      "Enter the Valid Zone Name, paste the TXT string, and save.",
    ],
  },
  {
    id: "namecheap",
    name: "Namecheap",
    steps: [
      "Go to Domain List > click Manage next to your domain.",
      "Switch to the Advanced DNS tab and click Add New Record.",
      "Select TXT Record, enter Host and Value, and click the green checkmark.",
    ],
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    steps: [
      "Log in to Cloudflare Dashboard and select your domain.",
      "Go to DNS > Records and click Add record.",
      "Select Type TXT, enter Name (@ or _dmarc), paste the Content, and click Save.",
    ],
  },
];

const issueGuides = {
  mx: {
    title: "Your domain is not set up to receive incoming emails.",
    severity: "Mailbox Destination (MX)",
    impact: "HIGH",
    description:
      "No Mail Exchange (MX) records were detected. Customer inquiries, quote requests, and email replies sent to your business will bounce or fail to arrive.",
    provider: "Your Domain Registrar",
    steps: [
      "Log in to your domain registrar (e.g., Whogohost, Truehost, Namecheap, GoDaddy, or Cloudflare).",
      "Open your DNS Management or Zone Editor.",
      "Add the MX records provided by your email host (e.g. Google Workspace, Microsoft 365, or Zoho Mail).",
    ],
    explanation:
      "MX records tell other mail servers which email provider handles incoming messages for your business domain.",
    benefits: [
      "Ensures customer inquiries, proposals, and invoice replies reach your inbox",
      "Prevents email delivery failures and bounced messages",
      "Enables smooth business communication with your clients",
    ],
  },
  spf: {
    title: "Your domain needs an authorized sender policy (SPF).",
    severity: "Authorized Senders List (SPF)",
    impact: "HIGH",
    description:
      "Without a proper SPF record, inbox providers like Gmail and Yahoo cannot verify that your emails genuinely come from your business, causing your proposals and invoices to land in spam.",
    provider: "Your DNS Provider",
    steps: [
      "Log in to your domain registrar (e.g., Whogohost, Truehost, Namecheap, or Cloudflare) and open DNS Management.",
      "Find all TXT records beginning with v=spf1.",
      "Combine all your sending services (like Google Workspace, Zoho, or cPanel) into a single valid SPF record ending with -all or ~all. Remove any duplicate SPF records.",
    ],
    explanation:
      "SPF is like a public guest list for your domain: it tells Gmail, Yahoo, and Outlook which servers are officially allowed to send emails on your behalf.",
    benefits: [
      "Stops fraudsters from impersonating your business name",
      "Keeps your sales quotes and invoices in clients' inboxes",
      "Complies with mandatory sender rules enforced by Google and Yahoo",
    ],
  },
  dkim: {
    title: "Your emails need a digital signature (DKIM).",
    severity: "Official Digital Stamp (DKIM)",
    impact: "HIGH",
    description:
      "DKIM adds a tamper-proof digital signature to every email you send. Without it, spam filters may suspect your emails have been altered or forged in transit.",
    provider: "Your Email Provider",
    steps: [
      "Open your email provider admin console (Google Workspace, Microsoft 365, or Zoho Mail).",
      "Go to the Email Authentication or DKIM section and generate a DKIM record.",
      "Copy the selector name and key, then publish it as a TXT record in your domain's DNS settings.",
    ],
    explanation:
      "DKIM works like an official wax seal on a letter—it proves to the recipient's inbox that your message really came from you and was not tampered with.",
    benefits: [
      "Protects your brand credibility and email integrity",
      "Builds sender domain reputation with Gmail and Outlook",
      "Greatly improves email deliverability for invoices and proposals",
    ],
  },
  dmarc: {
    title: "Your domain needs a security guard policy (DMARC).",
    severity: "Security Guard Rules (DMARC)",
    impact: "MEDIUM",
    description:
      "DMARC tells receiving inboxes what to do when someone tries to forge an email using your business name. Without it, scammers can freely spoof your domain to defraud your clients.",
    provider: "Your DNS Provider",
    steps: [
      "Log in to your domain manager (Whogohost, Truehost, Namecheap, Cloudflare, etc.).",
      "Create a new TXT record at _dmarc.yourdomain.com.",
      "Set an enforced policy such as v=DMARC1; p=quarantine; (or p=reject; once all sending tools are verified) with an email address for reporting.",
    ],
    explanation:
      "DMARC is your domain's security guard. It commands Gmail, Yahoo, and Outlook to quarantine or reject forged messages sent by scammers pretending to be you.",
    benefits: [
      "Prevents invoice fraud and business email compromise",
      "Protects your clients and partners from spoofed scams",
      "Satisfies mandatory inbox provider security requirements",
    ],
  },
};

function buildIssuesFromResults(results) {
  if (!results) return [];
  const list = [];

  // Check MX
  if (!results.mx?.hasMx || results.mx?.status === "error") {
    list.push({
      id: "mx",
      title: "Mailbox Destination (MX)",
      status: "failed",
      description: results.mx?.message || "No MX records found.",
      guide: issueGuides.mx,
    });
  }

  // Check SPF
  if (!results.spf?.hasSpf || results.spf?.rfcViolation || results.spf?.status !== "pass") {
    list.push({
      id: "spf",
      title: "Authorized Senders List (SPF)",
      status: results.spf?.rfcViolation || results.spf?.status === "error" ? "failed" : "warning",
      description: results.spf?.message || "SPF record needs review.",
      guide: {
        ...issueGuides.spf,
        description: results.spf?.message || issueGuides.spf.description,
      },
    });
  }

  // Check DKIM
  if (results.dkim?.status !== "pass") {
    list.push({
      id: "dkim",
      title: "Official Digital Stamp (DKIM)",
      status: results.dkim?.status === "indeterminate" ? "warning" : "failed",
      description: results.dkim?.message || "DKIM record needs verification.",
      guide: {
        ...issueGuides.dkim,
        description: results.dkim?.message || issueGuides.dkim.description,
      },
    });
  }

  // Check DMARC
  const dmarcPolicy = (results.dmarc?.policy || "").toLowerCase();
  if (!results.dmarc?.hasDmarc || dmarcPolicy === "none" || results.dmarc?.status !== "pass") {
    list.push({
      id: "dmarc",
      title: "Security Guard Rules (DMARC)",
      status: !results.dmarc?.hasDmarc ? "failed" : "warning",
      description: results.dmarc?.message || "DMARC policy needs enforcement.",
      guide: {
        ...issueGuides.dmarc,
        description: results.dmarc?.message || issueGuides.dmarc.description,
      },
    });
  }

  return list;
}

function getScoreBreakdownText(score) {
  if (score >= 80) {
    return "Your business emails are well-protected and trusted by Gmail, Yahoo, and Outlook.";
  }
  if (score >= 50) {
    return "Your emails are at risk of landing in spam folders or being delayed.";
  }
  return "Major deliverability issues detected. Scammers can send emails using your domain, and major inboxes may reject your messages entirely.";
}

function ResultPage() {
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 1. Retrieve initial result from router state if available
  const initialResult = location.state?.result || (location.state?.results ? location.state : null);

  const [scanResult, setScanResult] = useState(initialResult);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showAllSteps, setShowAllSteps] = useState(true);
  const [selectedRegistrar, setSelectedRegistrar] = useState("whogohost");
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [handoverCopied, setHandoverCopied] = useState(false);

  const scanId = params.id || searchParams.get("id");

  // 2. Direct Load / Permalinks / Refresh: fetch by ID if state is missing
  useEffect(() => {
    if (scanResult) return;

    if (scanId) {
      setLoading(true);
      setFetchError(null);
      getScanById(scanId)
        .then((res) => {
          if (res?.data) {
            setScanResult(res.data);
          } else {
            setFetchError("Audit record not found.");
          }
        })
        .catch((err) => {
          console.error("Failed to fetch scan by ID:", err);
          setFetchError(err.message || "Unable to load scan report.");
        })
        .finally(() => setLoading(false));
    }
  }, [scanId, scanResult]);

  const domain = scanResult?.domain || location.state?.domain || "";
  const score = scanResult?.score ?? 0;
  const status = scanResult?.status || "completed";
  const results = scanResult?.results || {
    mx: scanResult?.mx,
    spf: scanResult?.spf,
    dmarc: scanResult?.dmarc,
    dkim: scanResult?.dkim,
  };

  const explanation = scanResult?.explanation;
  const issues = buildIssuesFromResults(results);

  const [currentIssue, setCurrentIssue] = useState(0);
  const [reviewComplete, setReviewComplete] = useState(false);

  const activeIssue = issues[currentIssue];

  const handleNext = () => {
    if (currentIssue < issues.length - 1) {
      setCurrentIssue((prev) => prev + 1);
    } else {
      setReviewComplete(true);
    }
  };

  const handleBack = () => {
    if (reviewComplete) {
      setReviewComplete(false);
    } else if (currentIssue > 0) {
      setCurrentIssue((prev) => prev - 1);
    }
  };

  const handleReverify = () => {
    const cleaned = sanitizeDomain(domain);
    if (!cleaned || isWebmailDomain(cleaned)) {
      navigate("/");
      return;
    }
    navigate(`/scan?domain=${encodeURIComponent(cleaned)}`, {
      state: { domain: cleaned },
    });
  };

  const handleCopyValue = async (val, idx) => {
    try {
      await navigator.clipboard.writeText(val);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy DNS value:", err);
    }
  };

  const activeRegistrarGuide =
    REGISTRAR_GUIDES.find((g) => g.id === selectedRegistrar) || REGISTRAR_GUIDES[0];

  const generateHandoverText = () => {
    let recordsList = "";
    if (explanation?.steps && explanation.steps.length > 0) {
      recordsList = explanation.steps
        .map(
          (st, i) =>
            `${i + 1}. Record Type: ${st.recordType || "TXT"}\n   Host / Name: ${st.host || "@"}${
              st.priority ? `\n   Priority: ${st.priority}` : ""
            }\n   Value: ${st.value || "(See instructions: " + st.title + ")"}`
        )
        .join("\n\n");
    } else {
      recordsList = "All core DNS records (MX, SPF, DKIM, DMARC) are currently configured properly.";
    }

    return `Hi,

MailGuard ran a deliverability check on our domain (${domain || "our domain"}) and found our score is ${score}/100.
Our invoices and proposals are at risk of going to spam because our email authentication records need to be updated.

Please log in to our domain/DNS provider and publish or update these DNS records:
${recordsList}

Once done, we can re-verify at https://mail-guard-azure.vercel.app.

Thanks!`;
  };

  const handleCopyHandover = async () => {
    try {
      await navigator.clipboard.writeText(generateHandoverText());
      setHandoverCopied(true);
      setTimeout(() => setHandoverCopied(false), 3500);
    } catch (err) {
      console.error("Failed to copy handover note:", err);
    }
  };

  const handleEmailHandover = () => {
    const subject = `Action Required: DNS Fixes for ${domain || "our domain"}`;
    const body = generateHandoverText();
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F7F9FE]">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <LoaderCircle size={32} className="animate-spin text-emerald-700" />
            <p className="text-sm font-medium text-gray-600">Retrieving audit report...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error fetching state
  if (fetchError) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F7F9FE]">
        <Navbar />
        <main className="mx-auto w-full max-w-lg flex-1 px-4 py-16 text-center">
          <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
            <AlertTriangle size={36} className="mx-auto mb-3 text-red-500" />
            <h2 className="text-lg font-bold text-gray-900">Audit Report Unavailable</h2>
            <p className="mt-2 text-sm text-gray-600 break-words">{fetchError}</p>
            <Link
              to="/"
              className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Start New Audit
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 3. Graceful Empty State (direct visit with no state and no ID)
  if (!scanResult) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F7F9FE]">
        <Navbar />
        <main className="mx-auto w-full max-w-lg flex-1 px-4 py-16 text-center">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <MailSearch size={32} className="text-emerald-700" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">No scan results found</h2>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              Run an email deliverability audit first to view your domain's diagnostic score and step-by-step fix recommendations.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Start a Free Scan
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F9FE] overflow-x-hidden">
      <Navbar />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-6 sm:px-8 sm:py-8 lg:px-12">
        {/* Progress Tracker (Responsive) */}
        <div className="mb-7 sm:mb-9 rounded-xl bg-[#EEF3FD] px-3 py-5 sm:px-8 sm:py-6">
          <div className="flex items-start justify-between">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-white">
                <Check size={16} />
              </div>
              <span className="mt-1.5 text-[10px] font-medium sm:text-xs">
                Scan Complete
              </span>
            </div>

            <div className="mt-4 h-[2px] flex-1 bg-emerald-600 mx-2" />

            <div className="flex flex-col items-center text-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-xs sm:text-sm font-bold text-white">
                {reviewComplete ? <Check size={16} /> : issues.length > 0 ? currentIssue + 1 : 1}
              </div>
              <span className="mt-1.5 text-[10px] font-bold sm:text-xs">
                {issues.length === 0
                  ? "All Clear"
                  : reviewComplete
                  ? "Fixes Reviewed"
                  : `Fix ${currentIssue + 1} of ${issues.length}`}
              </span>
            </div>

            <div
              className={`mt-4 h-[2px] flex-1 mx-2 ${
                reviewComplete ? "bg-emerald-600" : "bg-gray-300"
              }`}
            />

            <div className="flex flex-col items-center text-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs sm:text-sm font-bold ${
                  reviewComplete ? "bg-emerald-700 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
              <span className="mt-1.5 text-[10px] text-gray-500 sm:text-xs">
                Verify
              </span>
            </div>

            <div className="mt-4 h-[2px] flex-1 bg-gray-300 mx-2" />

            <div className="flex flex-col items-center text-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                <Shield size={15} />
              </div>
              <span className="mt-1.5 text-[10px] text-gray-500 sm:text-xs">
                Protected
              </span>
            </div>
          </div>
        </div>

        {/* Live Score Header Card */}
        <div className="mb-7 flex flex-col gap-4 rounded-xl border border-emerald-300 bg-[#A0F3D0] p-4 sm:p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white">
              <ShieldCheck size={22} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-xl font-bold text-[#071B36] break-all">
                  {domain}
                </h1>
                <span className="rounded-full bg-emerald-800/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-950 capitalize">
                  {status}
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-emerald-950 leading-snug">
                {getScoreBreakdownText(score)}
              </p>
              <p className="mt-0.5 text-xs text-gray-700">
                {issues.length === 0
                  ? "All core authentication protocols are properly configured to protect your proposals and invoices."
                  : `Identified ${issues.length} deliverability ${
                      issues.length === 1 ? "remediation" : "remediations"
                    } to help keep your emails out of the spam folder.`}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 self-stretch sm:self-auto pt-2 sm:pt-0 border-t border-emerald-400/30 sm:border-t-0">
            <div className="rounded-lg bg-white/70 px-4 py-2 sm:px-5 sm:py-2.5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                Deliverability Score
              </p>
              <p className="text-xl sm:text-2xl font-black text-emerald-950">
                {score}<span className="text-xs font-normal text-gray-600">/100</span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleReverify}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-emerald-800 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-emerald-900 cursor-pointer"
            >
              <RotateCcw size={14} />
              Re-scan
            </button>
          </div>
        </div>

        {/* AI Deliverability Breakdown Section */}
        {explanation && (
          <div className="mb-7 overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
            {/* Header with Urgency Badge */}
            <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white px-5 py-4 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-xs">
                    <Sparkles size={17} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-bold text-[#071B36]">
                        AI Deliverability Diagnosis
                      </h2>
                      {explanation.source === "ai" && (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                          AI Generated
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Plain-English guidance designed for business owners
                    </p>
                  </div>
                </div>

                {/* Urgency Badge */}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                    explanation.urgency === "High"
                      ? "bg-red-100 text-red-800 border border-red-200"
                      : explanation.urgency === "Medium"
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {explanation.urgency === "High" && <AlertTriangle size={13} className="shrink-0" />}
                  {explanation.urgency === "Medium" && <Info size={13} className="shrink-0" />}
                  {explanation.urgency === "Low" && <CheckCircle2 size={13} className="shrink-0" />}
                  {explanation.urgency === "High"
                    ? "Action Required"
                    : explanation.urgency === "Medium"
                    ? "Attention Recommended"
                    : "Good Standing"}
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {/* Executive Summary */}
              <p className="text-sm sm:text-base leading-relaxed text-gray-800 break-words">
                {explanation.summary}
              </p>

              {/* Copy-pasteable DNS Checklist */}
              {explanation.steps && explanation.steps.length > 0 && (
                <div className="mt-5 border-t border-gray-100 pt-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-800">
                        Required DNS Actions
                      </h3>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                        {explanation.steps.length} {explanation.steps.length === 1 ? "step" : "steps"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setShowHandoverModal(true)}
                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-emerald-800 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-900 cursor-pointer"
                      >
                        <Send size={13} />
                        <span>Send to My Web Designer / Developer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowAllSteps(!showAllSteps)}
                        className="text-xs font-semibold text-gray-600 hover:text-gray-900 inline-flex items-center gap-1 cursor-pointer px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white"
                      >
                        <span>{showAllSteps ? "Collapse Checklist" : "Expand Checklist"}</span>
                        {showAllSteps ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {showAllSteps && (
                    <div className="space-y-4">
                      {/* Interactive Registrar Tabs */}
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2.5">
                          <div className="flex items-center gap-2">
                            <Server size={15} className="text-emerald-700 shrink-0" />
                            <span className="text-xs sm:text-sm font-bold text-[#071B36]">
                              How to add these records in your domain dashboard:
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-500">
                            Select your provider:
                          </span>
                        </div>

                        {/* Horizontal Tab Bar */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
                          {REGISTRAR_GUIDES.map((tab) => (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setSelectedRegistrar(tab.id)}
                              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                                selectedRegistrar === tab.id
                                  ? "bg-emerald-700 text-white shadow-xs"
                                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                              }`}
                            >
                              {tab.name}
                            </button>
                          ))}
                        </div>

                        {/* Step Details */}
                        <div className="mt-2.5 rounded-lg border border-emerald-100 bg-white p-3">
                          <p className="text-xs font-bold text-emerald-950 mb-2">
                            Follow these 3 steps in {activeRegistrarGuide.name}:
                          </p>
                          <div className="space-y-2">
                            {activeRegistrarGuide.steps.map((st, i) => (
                              <div key={i} className="flex items-start gap-2.5">
                                <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800 mt-0.5">
                                  {i + 1}
                                </span>
                                <p className="text-xs text-gray-700 leading-relaxed">
                                  {st}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {explanation.steps.map((st, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-gray-200 bg-[#F9FBFE] p-4 transition hover:border-emerald-200"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-[11px] font-bold text-white">
                                {st.step || idx + 1}
                              </span>
                              <h4 className="text-xs sm:text-sm font-bold text-[#071B36] break-words">
                                {st.title}
                              </h4>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[10px] font-semibold text-gray-500 uppercase">Record Type:</span>
                              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                {st.recordType || "TXT"}
                              </span>
                            </div>
                          </div>

                          <p className="mt-1 text-xs text-gray-600 sm:pl-7 leading-relaxed break-words">
                            {st.explanation}
                          </p>

                          {st.value && (
                            <div className="mt-3 sm:pl-7">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white p-3">
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-600">
                                    <span>
                                      <strong className="text-gray-700 uppercase font-semibold text-[10px]">Name / Host:</strong>{" "}
                                      <span className="font-mono text-gray-900 select-all font-medium">{st.host || "@"}</span>
                                    </span>
                                    {st.priority && (
                                      <span>
                                        • <strong className="text-gray-700 uppercase font-semibold text-[10px]">Priority:</strong>{" "}
                                        <span className="font-mono text-gray-900 font-medium">{st.priority}</span>
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-2">
                                    <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                                      Paste This Value:
                                    </span>
                                    <p className="font-mono text-xs text-emerald-950 break-all select-all font-medium bg-emerald-50/60 p-2 rounded border border-emerald-100">
                                      {st.value}
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleCopyValue(st.value, idx)}
                                  className="inline-flex min-h-[36px] shrink-0 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer"
                                >
                                  {copiedIndex === idx ? (
                                    <>
                                      <Check size={13} className="text-emerald-700" />
                                      <span className="text-emerald-700">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={13} />
                                      <span>Copy Value</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              {st.location && (
                                <p className="mt-1.5 text-[11px] text-gray-500">
                                  Where to add: <span className="font-medium text-gray-700">{st.location}</span>
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Diagnostic Protocol Grid (MX, SPF, DMARC, DKIM) */}
        {results && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* MX Records */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-800 block">
                      Mailbox Destination (MX)
                    </span>
                    <p className="mt-0.5 text-[11px] text-gray-500 leading-snug">
                      Tells the internet where to deliver emails sent to your company.
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      results.mx?.hasMx
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {results.mx?.hasMx ? "Active" : "Missing"}
                  </span>
                </div>
                <p className="mt-3 text-xs text-gray-600 leading-relaxed break-words">
                  {results.mx?.message || "Mail exchange routing"}
                </p>
              </div>
              {results.mx?.primaryExchange && (
                <p className="mt-3 text-[11px] font-mono text-gray-500 truncate break-all">
                  Host: {results.mx.primaryExchange}
                </p>
              )}
            </div>

            {/* SPF Record */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-800 block">
                      Authorized Senders List (SPF)
                    </span>
                    <p className="mt-0.5 text-[11px] text-gray-500 leading-snug">
                      A VIP guest list showing Gmail and Yahoo which servers are permitted to send emails on your behalf.
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      results.spf?.status === "pass"
                        ? "bg-emerald-100 text-emerald-800"
                        : results.spf?.status === "warning"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {results.spf?.qualifier || (results.spf?.hasSpf ? "Detected" : "Missing")}
                  </span>
                </div>
                <p className="mt-3 text-xs text-gray-600 leading-relaxed break-words">
                  {results.spf?.message || "Sender Policy Framework"}
                </p>
              </div>
              {results.spf?.record && (
                <div className="mt-3 rounded bg-gray-50 p-1.5 border border-gray-100">
                  <p className="text-[10px] font-mono text-gray-600 line-clamp-1 break-all">
                    {results.spf.record}
                  </p>
                </div>
              )}
            </div>

            {/* DKIM Signatures */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-800 block">
                      Official Digital Stamp (DKIM)
                    </span>
                    <p className="mt-0.5 text-[11px] text-gray-500 leading-snug">
                      A tamper-proof digital wax seal proving that invoices or quotes weren't altered along the way.
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      results.dkim?.discovered
                        ? "bg-emerald-100 text-emerald-800"
                        : results.dkim?.status === "indeterminate"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {results.dkim?.discovered
                      ? `${results.dkim.discoveredSelectors.length} Found`
                      : "Custom Selector"}
                  </span>
                </div>
                <p className="mt-3 text-xs text-gray-600 leading-relaxed break-words">
                  {results.dkim?.message || "DKIM verification"}
                </p>
              </div>
              {results.dkim?.discoveredSelectors?.length > 0 && (
                <p className="mt-3 text-[11px] font-mono text-emerald-700 truncate break-all">
                  Selectors: {results.dkim.discoveredSelectors.join(", ")}
                </p>
              )}
            </div>

            {/* DMARC Policy */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-800 block">
                      Security Guard Rules (DMARC)
                    </span>
                    <p className="mt-0.5 text-[11px] text-gray-500 leading-snug">
                      Instructions to mailboxes on whether to reject or quarantine fake emails sent by scammers using your business name.
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      results.dmarc?.policy === "reject" || results.dmarc?.policy === "quarantine"
                        ? "bg-emerald-100 text-emerald-800"
                        : results.dmarc?.policy === "none"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {results.dmarc?.policy ? `p=${results.dmarc.policy}` : "Missing"}
                  </span>
                </div>
                <p className="mt-3 text-xs text-gray-600 leading-relaxed break-words">
                  {results.dmarc?.message || "Domain protection enforcement"}
                </p>
              </div>
              {results.dmarc?.rua && (
                <p className="mt-3 text-[11px] font-mono text-gray-500 truncate break-all">
                  Reporting: {results.dmarc.rua}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Issue Review Guide Section */}
        {issues.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 sm:p-12 text-center">
            <ShieldCheck size={48} className="mx-auto mb-4 text-emerald-700" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              No deliverability issues detected
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-600 leading-relaxed">
              Your domain <span className="font-semibold text-gray-900 break-all">{domain}</span> has active MX, valid SPF, verifiable DKIM, and protective DMARC policies in place.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/history"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                View Audit History
              </Link>
              <Link
                to="/"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Scan Another Domain
              </Link>
            </div>
          </div>
        ) : reviewComplete ? (
          /* Verification Complete Stage */
          <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-6 sm:p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 size={34} className="text-emerald-700" />
            </div>

            <h2 className="mb-2 text-xl sm:text-2xl font-bold text-gray-900">
              You've reviewed all recommended fixes!
            </h2>

            <p className="mb-6 text-sm leading-relaxed text-gray-600">
              You went through {issues.length} {issues.length === 1 ? "recommendation" : "recommendations"} for <span className="break-all font-semibold text-gray-900">{domain}</span>.
              Once your DNS changes have propagated, verify your updated configuration.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <ArrowLeft size={16} />
                Back to Fixes
              </button>

              <button
                type="button"
                onClick={handleReverify}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 cursor-pointer"
              >
                <RotateCcw size={16} />
                Verify DNS Changes Now
              </button>
            </div>
          </div>
        ) : (
          /* Step-by-Step Fix Flow */
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,0.95fr)]">
            {/* Active Issue Card */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-[#FFDDD8] px-4 py-3.5 sm:px-6">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle size={17} className="shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wide">
                    Issue {currentIssue + 1} of {issues.length}: {activeIssue.guide?.severity}
                  </span>
                </div>

                <span className="rounded bg-red-100/80 px-2.5 py-1 text-[10px] font-black text-red-800">
                  IMPACT: {activeIssue.guide?.impact}
                </span>
              </div>

              <div className="p-5 sm:p-7">
                <h2 className="mb-3 text-lg sm:text-2xl font-bold text-[#071B36] break-words">
                  {activeIssue.guide?.title}
                </h2>

                <p className="mb-6 text-sm leading-relaxed text-gray-600 break-words">
                  {activeIssue.guide?.description}
                </p>

                {/* Instructions */}
                <div className="mb-3 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-emerald-700" />
                  <h3 className="text-sm font-bold text-gray-900">
                    Step-by-step remediation
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {activeIssue.guide?.steps?.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-lg border border-[#D5DEED] bg-[#EEF3FD] p-3 sm:p-3.5"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-600 bg-white text-[11px] font-bold text-emerald-700">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm leading-relaxed text-gray-800 break-words">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  {currentIssue > 0 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 text-sm font-semibold text-gray-600 hover:text-emerald-700 cursor-pointer"
                    >
                      <ArrowLeft size={16} />
                      Previous Issue
                    </button>
                  ) : (
                    <span className="hidden sm:block" />
                  )}

                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 cursor-pointer shadow-sm"
                  >
                    {currentIssue === issues.length - 1 ? "Complete Review" : "Next Issue"}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-5">
              <div className="rounded-2xl border border-[#D5DEED] bg-[#EEF3FD] p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Lightbulb size={19} className="text-emerald-700 shrink-0" />
                  <h3 className="text-sm font-bold text-emerald-900">
                    Why this matters
                  </h3>
                </div>

                <p className="text-xs sm:text-sm leading-relaxed text-gray-700">
                  {activeIssue.guide?.explanation}
                </p>

                <div className="mt-4 space-y-2.5">
                  {activeIssue.guide?.benefits?.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-700" />
                      <span className="text-xs text-gray-700 leading-snug">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex h-28 flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-[#064E3B] via-[#047857] to-[#022C22] text-white">
                  <Server size={30} strokeWidth={1.5} />
                  <span className="text-[10px] font-bold tracking-widest uppercase">
                    DNS RE-VERIFICATION
                  </span>
                </div>

                <div className="p-4">
                  <h4 className="text-sm font-bold text-gray-900">
                    Propagate & Verify
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    After updating your DNS provider records, return here and click <strong>Re-scan</strong> to confirm the fixes took effect.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* "Send to My Web Designer / Developer" Modal */}
      {showHandoverModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => setShowHandoverModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                  <Send size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#071B36]">
                    Send to My Web Designer / Developer
                  </h3>
                  <p className="text-xs text-gray-500">
                    Forward this ready-made note via WhatsApp, Slack, or Email
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHandoverModal(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs text-gray-600 mb-2 font-medium">
                Preview of developer handover message:
              </p>
              <div className="rounded-xl border border-gray-200 bg-[#F9FBFE] p-3.5 max-h-56 overflow-y-auto font-mono text-xs text-gray-800 whitespace-pre-wrap select-all leading-relaxed">
                {generateHandoverText()}
              </div>
            </div>

            {handoverCopied && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-900 animate-in fade-in">
                <CheckCheck size={16} className="shrink-0 text-emerald-700" />
                <span>Copied! Send this to your web manager via WhatsApp or Email.</span>
              </div>
            )}

            <div className="mt-5 flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCopyHandover}
                className="w-full sm:w-auto inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-800 cursor-pointer"
              >
                {handoverCopied ? <CheckCheck size={16} /> : <Copy size={16} />}
                <span>{handoverCopied ? "Copied to Clipboard!" : "Copy Developer Note"}</span>
              </button>

              <button
                type="button"
                onClick={handleEmailHandover}
                className="w-full sm:w-auto inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 transition hover:bg-gray-50 cursor-pointer"
              >
                <Mail size={16} />
                <span>Email to Developer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default ResultPage;
