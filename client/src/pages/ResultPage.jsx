import { useState, useEffect } from "react";
import { useLocation, useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  Check,
  CheckCircle2,
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
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getScanById } from "../services/api";

const issueGuides = {
  mx: {
    title: "Your domain is missing MX records.",
    severity: "Mail Delivery Warning",
    impact: "HIGH",
    description:
      "No Mail Exchange (MX) records were detected. Receiving servers will not be able to deliver incoming emails to your domain.",
    provider: "Your DNS Provider",
    steps: [
      "Open your DNS management console with your domain registrar or cloud DNS provider.",
      "Add the MX records provided by your email host (e.g. Google Workspace, Microsoft 365, Zoho).",
      "Verify that the MX record priority is correctly configured (e.g. priority 10).",
    ],
    explanation:
      "MX (Mail Exchange) records instruct the internet where to send emails addressed to your domain.",
    benefits: [
      "Enables inbound mail delivery",
      "Prevents email bounces and delivery failures",
      "Ensures compliant mail server discovery",
    ],
  },
  spf: {
    title: "Your SPF configuration needs attention.",
    severity: "Email Authentication Warning",
    impact: "HIGH",
    description:
      "Multiple SPF records, permissive qualifiers (+all), or missing records can cause emails to fail sender authorization checks at Gmail and Yahoo.",
    provider: "Your DNS Provider",
    steps: [
      "Log in to your DNS provider and open the DNS management section for your domain.",
      "Find all TXT records beginning with v=spf1.",
      "Combine all authorized sending mechanisms into a single valid SPF record ending with -all or ~all. Remove duplicate records.",
    ],
    explanation:
      "SPF (Sender Policy Framework) lists the authorized IP addresses and mail servers allowed to send emails from your domain.",
    benefits: [
      "Prevents unauthorized sender spoofing",
      "Improves inbox placement rates",
      "Complies with Google and Yahoo sender guidelines",
    ],
  },
  dkim: {
    title: "Your DKIM configuration needs attention.",
    severity: "Cryptographic Security Warning",
    impact: "HIGH",
    description:
      "No active DKIM signatures were discovered on standard selectors. Receiving mail servers may not be able to verify that signed message contents were not modified in transit.",
    provider: "Your Email Provider",
    steps: [
      "Open the administration console of your email service provider.",
      "Generate a new DKIM key or look up your active selector name.",
      "Publish the provided TXT record at <selector>._domainkey.yourdomain.com in your DNS settings.",
    ],
    explanation:
      "DKIM attaches a cryptographic signature to each outgoing email, proving message integrity and domain authenticity.",
    benefits: [
      "Protects against in-transit email tampering",
      "Builds sender domain reputation",
      "Significantly boosts deliverability",
    ],
  },
  dmarc: {
    title: "Your DMARC policy needs attention.",
    severity: "Domain Protection Warning",
    impact: "MEDIUM",
    description:
      "Your domain lacks a protective DMARC enforcement policy (p=reject or p=quarantine). Unauthenticated emails may still be delivered or reported in monitoring mode (p=none).",
    provider: "Your DNS Provider",
    steps: [
      "Open your domain's DNS management dashboard.",
      "Check or create a TXT record at _dmarc.yourdomain.com.",
      "Set an enforced policy such as v=DMARC1; p=quarantine; or p=reject; with an email address for aggregate reports (rua=mailto:...).",
    ],
    explanation:
      "DMARC instructs receiving mail servers how to treat emails that fail SPF or DKIM alignment checks.",
    benefits: [
      "Blocks phishing and domain impersonation attacks",
      "Provides automated reports on unauthorized sending attempts",
      "Mandated by major mailbox providers for bulk senders",
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
      title: "MX Records",
      status: "failed",
      description: results.mx?.message || "No MX records found.",
      guide: issueGuides.mx,
    });
  }

  // Check SPF
  if (!results.spf?.hasSpf || results.spf?.rfcViolation || results.spf?.status !== "pass") {
    list.push({
      id: "spf",
      title: "SPF Record",
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
      title: "DKIM",
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
      title: "DMARC Policy",
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
    navigate(`/scan?domain=${encodeURIComponent(domain)}`, {
      state: { domain },
    });
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
              <p className="mt-1 text-xs sm:text-sm text-gray-700 leading-snug">
                {issues.length === 0
                  ? "Outstanding! All core authentication protocols are aligned and configured properly."
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

        {/* Diagnostic Protocol Grid (MX, SPF, DMARC, DKIM) */}
        {results && (
          <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* MX Records */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    MX Records
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      results.mx?.hasMx
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {results.mx?.hasMx ? "Active" : "Missing"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-600 leading-relaxed break-words">
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
            <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    SPF Record
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
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
                <p className="mt-2 text-xs text-gray-600 leading-relaxed break-words">
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
            <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    DKIM Keys
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
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
                <p className="mt-2 text-xs text-gray-600 leading-relaxed break-words">
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
            <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    DMARC Policy
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
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
                <p className="mt-2 text-xs text-gray-600 leading-relaxed break-words">
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

      <Footer />
    </div>
  );
}

export default ResultPage;
