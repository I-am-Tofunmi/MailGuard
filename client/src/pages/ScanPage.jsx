import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  LoaderCircle,
  Info,
  Sparkles,
  MailCheck,
  RotateCcw,
  Globe,
  ArrowRight,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { runAudit } from "../services/api";
import { sanitizeDomain, isWebmailDomain } from "../utils/domainUtils";
import WebmailWarningModal from "../components/WebmailWarningModal";

const defaultChecks = [
  {
    id: "domain",
    title: "Domain Verification",
    description: "Confirming your business domain is online and valid...",
    status: "checking",
  },
  {
    id: "mx",
    title: "Receiving Messages (MX)",
    description: "Checking if your email address is set up to receive messages...",
    status: "pending",
  },
  {
    id: "spf",
    title: "Sender Protection (SPF)",
    description: "Checking if scammers can impersonate your brand...",
    status: "pending",
  },
  {
    id: "dkim",
    title: "Message Authenticity (DKIM)",
    description: "Verifying cryptographic proof that your emails are authentic...",
    status: "pending",
  },
  {
    id: "dmarc",
    title: "Delivery & Security Rules (DMARC)",
    description: "Verifying your email protection and deliverability rules...",
    status: "pending",
  },
];

function ScanPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Synchronous validation on mount
  const queryDomain = new URLSearchParams(location.search).get("domain") || "";
  const rawInitial = location.state?.domain || queryDomain || "";
  const sanitizedInitial = sanitizeDomain(rawInitial);
  const isInitialWebmail = isWebmailDomain(sanitizedInitial);

  const [isWebmailBlocked, setIsWebmailBlocked] = useState(isInitialWebmail);
  const [domain, setDomain] = useState(isInitialWebmail ? "" : sanitizedInitial);
  const [manualInput, setManualInput] = useState("");
  const [manualError, setManualError] = useState("");
  const [isWebmailModalOpen, setIsWebmailModalOpen] = useState(isInitialWebmail);
  const [blockedDomain, setBlockedDomain] = useState(isInitialWebmail ? sanitizedInitial : "");

  const [progress, setProgress] = useState(15);
  const [checks, setChecks] = useState(defaultChecks);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const completedResultRef = useRef(null);
  const progressTimerRef = useRef(null);

  const executeAudit = useCallback(
    async (domainToScan) => {
      const sanitized = sanitizeDomain(domainToScan);

      // Return early / abort immediately before dispatching runAudit() if empty or webmail
      if (!sanitized || isWebmailDomain(sanitized)) {
        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
        }
        setIsWebmailBlocked(true);
        setBlockedDomain(sanitized || "webmail");
        setIsWebmailModalOpen(true);
        setIsScanning(false);
        setDomain("");
        return;
      }

      setIsWebmailBlocked(false);
      setIsScanning(true);
      setErrorMessage(null);
      setScanComplete(false);
      setProgress(15);
      setChecks(defaultChecks);

      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      progressTimerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev < 88) {
            return prev + Math.floor(Math.random() * 8 + 3);
          }
          return prev;
        });
      }, 240);

      try {
        const auditResponse = await runAudit(sanitized);

        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
        }
        setProgress(100);

        const rawResults = auditResponse.results || {
          mx: auditResponse.mx,
          spf: auditResponse.spf,
          dmarc: auditResponse.dmarc,
          dkim: auditResponse.dkim,
        };

        const updatedChecks = [
          {
            id: "domain",
            title: "Domain Verified",
            description: `Domain confirmed: ${auditResponse.domain}`,
            status: "passed",
          },
          {
            id: "mx",
            title: "Receiving Messages (MX)",
            description: rawResults.mx?.hasMx
              ? "Your business email is set up to receive incoming messages"
              : "Emails sent to your business cannot be delivered (missing MX)",
            status: rawResults.mx?.hasMx ? "passed" : "failed",
          },
          {
            id: "spf",
            title: "Sender Protection (SPF)",
            description:
              rawResults.spf?.status === "pass"
                ? "Your authorized sending servers are protected from impersonation"
                : rawResults.spf?.rfcViolation
                ? "Conflicting duplicate SPF records detected — causes delivery failure"
                : "Scammers can send fake emails impersonating your company domain",
            status:
              rawResults.spf?.status === "pass"
                ? "passed"
                : rawResults.spf?.status === "warning"
                ? "warning"
                : "failed",
          },
          {
            id: "dkim",
            title: "Message Authenticity (DKIM)",
            description:
              rawResults.dkim?.status === "pass"
                ? "Cryptographic signature verification is active on your messages"
                : "Verify DKIM keys with your email provider (e.g. Google Workspace, cPanel, M365)",
            status:
              rawResults.dkim?.status === "pass"
                ? "passed"
                : rawResults.dkim?.status === "indeterminate"
                ? "warning"
                : "failed",
          },
          {
            id: "dmarc",
            title: "Delivery & Security Rules (DMARC)",
            description:
              rawResults.dmarc?.status === "pass"
                ? "Active security rules instruct Gmail and Yahoo to protect your business"
                : rawResults.dmarc?.policy === "none"
                ? "DMARC is in monitoring mode and not actively blocking forged emails"
                : "Missing DMARC policy — forged messages may land in customer inboxes or get flagged",
            status:
              rawResults.dmarc?.status === "pass"
                ? "passed"
                : rawResults.dmarc?.status === "warning"
                ? "warning"
                : "failed",
          },
        ];

        setChecks(updatedChecks);
        completedResultRef.current = auditResponse;
        setScanComplete(true);
      } catch (err) {
        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
        }
        console.error("DNS audit failed:", err);
        setErrorMessage(
          err.message || "Unable to check this domain right now. Please verify the domain name or check your connection."
        );
        setIsScanning(false);
      }
    },
    []
  );

  // Synchronous validation on mount: check URL or state domain immediately
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const domainFromQuery = searchParams.get("domain") || "";
    const raw = location.state?.domain || domainFromQuery || "";
    const clean = sanitizeDomain(raw);

    if (!clean) {
      setIsScanning(false);
      setIsWebmailBlocked(false);
      return;
    }

    // Immediately block and abort if webmail provider
    if (isWebmailDomain(clean)) {
      setIsWebmailBlocked(true);
      setBlockedDomain(clean);
      setIsWebmailModalOpen(true);
      setIsScanning(false);
      setDomain("");
      return; // Return early / abort before dispatching runAudit()
    }

    // Valid business domain
    setIsWebmailBlocked(false);
    setIsWebmailModalOpen(false);
    setDomain(clean);
    executeAudit(clean);
  }, [location.search, location.state, executeAudit]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  // Navigate upon successful scan completion
  useEffect(() => {
    if (!scanComplete || !completedResultRef.current) return;

    const res = completedResultRef.current;
    const targetDomain = res.domain || domain;

    // Strict guard: NEVER navigate to results if webmail domain!
    if (isWebmailDomain(targetDomain)) {
      setIsWebmailBlocked(true);
      setBlockedDomain(sanitizeDomain(targetDomain) || "gmail.com");
      setIsScanning(false);
      setScanComplete(false);
      completedResultRef.current = null;
      return;
    }

    const timer = setTimeout(() => {
      if (res.id) {
        navigate(`/results/${res.id}`, {
          replace: true,
          state: { result: res, domain: targetDomain },
        });
      } else {
        navigate("/results", {
          replace: true,
          state: { result: res, domain: targetDomain },
        });
      }
    }, 1100);

    return () => clearTimeout(timer);
  }, [scanComplete, navigate, domain]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const sanitized = sanitizeDomain(manualInput);

    if (!sanitized) {
      setManualError("Please enter your business domain or email address.");
      return;
    }

    // Intercept free public webmail
    if (isWebmailDomain(sanitized)) {
      setIsWebmailBlocked(true);
      setBlockedDomain(sanitized);
      setIsWebmailModalOpen(true);
      setIsScanning(false);
      setDomain("");
      return; // Return early / abort
    }

    setManualError("");
    setIsWebmailBlocked(false);
    setDomain(sanitized);
    executeAudit(sanitized);
  };

  const handleTryCustomDomain = () => {
    setIsWebmailModalOpen(false);
    setIsWebmailBlocked(false);
    setBlockedDomain("");
    setManualInput("");
    setManualError("");
    setDomain("");
    setIsScanning(false);
    setScanComplete(false);
    setErrorMessage(null);
    completedResultRef.current = null;

    // Navigate cleanly back to home (/) without leftover query params or results
    navigate("/", { replace: true });
  };

  const handleModalClose = () => {
    setIsWebmailModalOpen(false);
    if (isWebmailBlocked) {
      setDomain("");
      setIsScanning(false);
    }
  };

  const handleRetryScan = () => {
    const clean = sanitizeDomain(domain);
    // Prevent re-scan execution if domain is missing or webmail
    if (!clean || isWebmailDomain(clean)) {
      setIsWebmailBlocked(true);
      setBlockedDomain(clean || "webmail");
      setIsWebmailModalOpen(true);
      return;
    }
    executeAudit(clean);
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "passed":
        return "border-emerald-200 bg-white";
      case "failed":
        return "border-red-200 bg-[#FFDEDC]";
      case "warning":
        return "border-amber-200 bg-amber-50";
      case "checking":
        return "border-emerald-200 bg-white";
      default:
        return "border-gray-100 bg-[#F0F4FC]";
    }
  };

  const renderStatusIcon = (status) => {
    switch (status) {
      case "passed":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 size={20} className="text-emerald-700" fill="#A7F3D0" />
          </div>
        );
      case "failed":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
            <XCircle size={20} className="text-red-600" />
          </div>
        );
      case "warning":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle size={20} className="text-amber-700" />
          </div>
        );
      case "checking":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50">
            <LoaderCircle size={20} className="animate-spin text-emerald-700" />
          </div>
        );
      default:
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
            <LoaderCircle size={19} className="text-gray-400" />
          </div>
        );
    }
  };

  if (isWebmailBlocked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <WebmailWarningModal
          isOpen={true}
          detectedDomain={blockedDomain || "gmail.com"}
          onClose={() => navigate("/", { replace: true })}
          onTryCustomDomain={() => navigate("/", { replace: true })}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F9FE]">
      <Navbar />

      <main className="flex flex-1 flex-col items-center px-4 pb-16 pt-8 sm:px-8 sm:pt-10">
        {/* If no domain provided yet: Direct Domain Entry Form */}
        {!domain && !isScanning ? (
          <div className="w-full max-w-[620px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 text-center mt-4">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <Globe size={26} className="text-emerald-700" />
            </div>

            <h1 className="text-2xl font-bold text-[#071B36]">
              Check Your Business Email Health
            </h1>
            <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
              Enter your website domain (e.g. myshop.co.za or company.ng) to see if your invoices, quotes, and emails are reaching customers or landing in spam.
            </p>

            <form onSubmit={handleManualSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row text-left">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => {
                    setManualInput(e.target.value);
                    if (manualError) setManualError("");
                  }}
                  placeholder="e.g. myshop.co.za or yourcompany.com"
                  aria-label="Enter business domain name"
                  className={`min-h-[48px] w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 sm:text-base ${
                    manualError
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-100"
                  }`}
                />
                {manualError && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {manualError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm sm:text-base font-bold text-white transition hover:bg-emerald-800 cursor-pointer"
              >
                Audit My Domain Now
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        ) : (
          /* Live Scanning State */
          <>
            <div className="mb-8 text-center max-w-xl">
              <h1 className="text-2xl font-bold tracking-tight text-[#071B36] sm:text-3xl break-words">
                {scanComplete
                  ? "Scan Complete!"
                  : errorMessage
                  ? "Audit Interrupted"
                  : "Checking your email health..."}
              </h1>

              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                {scanComplete
                  ? "Preparing your plain-English health report and step-by-step fix guide..."
                  : errorMessage
                  ? "Unable to complete DNS audit for this domain."
                  : "Checking if your business quotes, proposals, and invoices are reaching inboxes without landing in spam."}
              </p>

              <p className="mt-2 text-xs font-semibold text-emerald-700 break-all">
                {domain}
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-8 w-full max-w-[650px] rounded-xl border border-red-200 bg-red-50 p-5 text-center">
                <AlertTriangle size={28} className="mx-auto mb-2 text-red-600" />
                <p className="text-sm font-semibold text-red-800 break-words">{errorMessage}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    disabled={!domain || isWebmailDomain(domain)}
                    onClick={handleRetryScan}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    Retry Scan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDomain("");
                      setErrorMessage(null);
                      setIsScanning(false);
                      setIsWebmailBlocked(false);
                    }}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    Check Another Domain
                  </button>
                </div>
              </div>
            )}

            {/* Scan Progress & Checklist */}
            {!errorMessage && (
              <div className="w-full max-w-[650px]">
                {/* Progress Bar */}
                <div
                  className="mb-8 sm:mb-10"
                  role="progressbar"
                  aria-label="Email scan progress"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className="h-[11px] w-full overflow-hidden rounded-full bg-[#DFE8F3]">
                    <div
                      className="h-full rounded-full bg-[#006747] transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <p className="mt-2 text-right text-xs font-medium text-gray-500">
                    {progress}%
                  </p>
                </div>

                {/* Scan Status Cards */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {checks.map((check) => (
                    <div
                      key={check.id}
                      className={`flex min-h-[78px] items-center gap-3 rounded-xl border p-4 transition-colors duration-300 ${getStatusStyles(
                        check.status
                      )}`}
                    >
                      {renderStatusIcon(check.status)}

                      <div className="min-w-0 flex-1">
                        <h3
                          className={`text-sm font-semibold ${
                            check.status === "failed"
                              ? "text-red-700"
                              : check.status === "warning"
                              ? "text-amber-800"
                              : "text-[#071B36]"
                          }`}
                        >
                          {check.title}
                          {check.status === "failed" && " - action needed"}
                          {check.status === "warning" && " - attention needed"}
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-gray-600 line-clamp-2 break-words">
                          {check.description}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Gmail Inbox Rate estimation */}
                  <div className="flex min-h-[78px] items-center gap-3 rounded-xl border border-gray-100 bg-[#EEF3FA] p-4 opacity-75">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <MailCheck size={19} className="text-gray-500" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-600 truncate">
                        Inbox Placement Confidence
                      </h3>
                      <p className="mt-1 text-xs text-gray-400">
                        Based on Gmail, Yahoo, & Outlook rules
                      </p>
                    </div>
                  </div>

                  {/* Why this matters */}
                  <div className="flex min-h-[78px] flex-col items-center justify-center gap-1 rounded-xl border border-emerald-100 bg-[#D2FAEC] p-4 text-center">
                    <Info size={19} className="text-emerald-800 shrink-0" />
                    <h3 className="text-sm font-semibold text-emerald-900">
                      Why this scan matters
                    </h3>
                    <p className="text-[11px] text-emerald-800">
                      Prevents missed sales, unpaid invoices, and spoofing.
                    </p>
                  </div>
                </div>

                {/* Live Finding Information Card */}
                <div className="mt-8 sm:mt-10 rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <Sparkles size={22} className="mt-0.5 shrink-0 text-emerald-700" />

                    <div>
                      <h3 className="mb-1 text-base font-semibold text-[#071B36]">
                        {progress < 100
                          ? "Checking live domain records"
                          : "Audit Complete"}
                      </h3>

                      <p className="text-xs sm:text-sm leading-6 text-gray-600">
                        {progress < 100
                          ? "MailGuard is directly checking your domain settings against Google, Yahoo, and Microsoft deliverability standards."
                          : "All checks completed. Redirecting to your plain-English report and step-by-step fix guide..."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Educational Webmail Warning Modal */}
      <WebmailWarningModal
        isOpen={isWebmailModalOpen}
        onClose={handleModalClose}
        onTryCustomDomain={handleTryCustomDomain}
        detectedDomain={blockedDomain}
      />

      <Footer />
    </div>
  );
}

export default ScanPage;
