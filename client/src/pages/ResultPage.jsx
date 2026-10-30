
import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Check,
  CheckCircle2,
  AlertTriangle,
  Info,
  Copy,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  ShieldCheck,
  Shield,
  Server,
  RotateCcw,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const issueGuides = {
  spf: {
    title: "Your SPF records are conflicting.",
    severity: "Email Authentication Warning",
    impact: "HIGH",
    description:
      "Multiple SPF records can cause email authentication to fail. Receiving mail servers may struggle to determine which services are authorized to send emails for your domain.",
    provider: "Cloudflare",
    steps: [
      "Log in to your DNS provider and open the DNS management section for your domain.",
      "Find all TXT records beginning with v=spf1.",
      "Combine the authorized sending services into one valid SPF record. Remove the duplicate SPF records after confirming the combined record is correct.",
    ],
    explanation:
      "SPF (Sender Policy Framework) identifies which mail servers are allowed to send emails on behalf of your domain. A domain should have only one SPF TXT record.",
    benefits: [
      "Improves email authentication",
      "Reduces sender spoofing",
      "Helps receiving servers validate your mail",
    ],
  },
  dkim: {
    title: "Your DKIM configuration needs attention.",
    severity: "Email Security Warning",
    impact: "HIGH",
    description:
      "Your email signing configuration may be missing or invalid. Without valid DKIM authentication, receiving providers cannot reliably verify the cryptographic signature of your messages.",
    provider: "Your DNS Provider",
    steps: [
      "Open the administration dashboard of your email provider.",
      "Find the DKIM configuration and generate or retrieve the required DNS record.",
      "Publish the exact DKIM record supplied by your email provider in your domain's DNS settings.",
    ],
    explanation:
      "DKIM adds a cryptographic signature to outgoing email, allowing receiving servers to verify that signed message content has not been modified.",
    benefits: [
      "Supports message authenticity",
      "Helps protect against tampering",
      "Strengthens domain reputation signals",
    ],
  },
  dmarc: {
    title: "Your DMARC policy needs attention.",
    severity: "Domain Protection Warning",
    impact: "MEDIUM",
    description:
      "Your domain's DMARC configuration may be missing or incorrect, making it harder to control how receiving servers handle messages that fail authentication.",
    provider: "Your DNS Provider",
    steps: [
      "Open your domain's DNS management dashboard.",
      "Check for an existing TXT record at _dmarc.yourdomain.com.",
      "Configure a valid DMARC policy appropriate for your domain and email authentication setup.",
    ],
    explanation:
      "DMARC builds on SPF and DKIM to provide domain alignment checks, reporting, and policies for handling authentication failures.",
    benefits: [
      "Improves domain impersonation protection",
      "Supports authentication reporting",
      "Helps enforce email security policies",
    ],
  },
};

function ResultPage() {
  const location = useLocation();

  const domain = location.state?.domain || "example.com";
  const isDemo = location.state?.isDemo === true;
  const scanChecks = location.state?.checks || [];

  const issues = scanChecks
    .filter(
      (check) =>
        check.status === "failed" ||
        check.status === "warning"
    )
    .map((check) => ({
      ...check,
      guide: issueGuides[check.id],
    }))
    .filter((issue) => issue.guide);

  const [currentIssue, setCurrentIssue] = useState(0);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeIssue = issues[currentIssue];

  const handleCopy = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Unable to copy:", error);
    }
  };

  const handleNext = () => {
    if (currentIssue < issues.length - 1) {
      setCurrentIssue((previous) => previous + 1);
      setCopied(false);
    } else {
      setReviewComplete(true);
    }
  };

  const handleBack = () => {
    if (reviewComplete) {
      setReviewComplete(false);
    } else if (currentIssue > 0) {
      setCurrentIssue((previous) => previous - 1);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F9FE]">
      <Navbar />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 py-8 sm:px-8 lg:px-12">

        {/* Progress Tracker */}
        <div className="mb-9 rounded-lg bg-[#EEF3FD] px-3 py-6 sm:px-8">
          <div className="flex items-start">

            <div className="flex flex-col items-center text-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-white">
                <Check size={17} />
              </div>
              <span className="mt-2 text-[10px] font-medium sm:text-xs">
                Scan Complete
              </span>
            </div>

            <div className="mt-4 h-[2px] flex-1 bg-emerald-600" />

            <div className="flex flex-col items-center text-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
                {reviewComplete ? (
                  <Check size={17} />
                ) : (
                  currentIssue + 1
                )}
              </div>
              <span className="mt-2 text-[10px] font-bold sm:text-xs">
                {reviewComplete
                  ? "Fixes Reviewed"
                  : `Fix ${currentIssue + 1} of ${issues.length}`}
              </span>
            </div>

            <div
              className={`mt-4 h-[2px] flex-1 ${
                reviewComplete ? "bg-emerald-600" : "bg-gray-300"
              }`}
            />

            <div className="flex flex-col items-center text-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  reviewComplete
                    ? "bg-emerald-700 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
              <span className="mt-2 text-[10px] text-gray-500 sm:text-xs">
                Verify
              </span>
            </div>

            <div className="mt-4 h-[2px] flex-1 bg-gray-300" />

            <div className="flex flex-col items-center text-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                <Shield size={16} />
              </div>
              <span className="mt-2 text-[10px] text-gray-500 sm:text-xs">
                Protected
              </span>
            </div>

          </div>
        </div>

        {/* Demo Notice */}
        {isDemo && (
          <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            Demo results: these findings are simulated and have not been
            verified against the DNS records for <span className="break-all font-medium">{domain}</span>.
          </div>
        )}

        {/* No Scan Data */}
        {scanChecks.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
            <Info size={34} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900">
              No scan results available
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Run a scan first to view your domain's diagnostic report.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-lg bg-emerald-700 px-6 py-3 text-sm font-semibold text-white"
            >
              Start a Scan
            </Link>
          </div>
        ) : issues.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
            <ShieldCheck
              size={40}
              className="mx-auto mb-4 text-emerald-700"
            />
            <h2 className="text-xl font-bold text-gray-900">
              No supported issues detected
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              No actionable issues were identified by the available
              checks for <span className="break-all font-medium">{domain}</span>. This does not guarantee inbox placement.
            </p>
          </div>
        ) : reviewComplete ? (

          /* Verification Stage */
          <div className="mx-auto max-w-xl rounded-xl border border-gray-200 bg-white p-8 text-center">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2
                size={34}
                className="text-emerald-700"
              />
            </div>

            <h2 className="mb-3 text-2xl font-bold text-gray-900">
              You've reviewed all the fixes!
            </h2>

            <p className="mb-6 text-sm leading-6 text-gray-600">
              You've reviewed {issues.length} recommended
              {issues.length === 1 ? " fix" : " fixes"} for <span className="break-all font-medium">{domain}</span>.
              Your DNS records still need to be checked again to
              confirm that the issues have been resolved.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700"
              >
                <ArrowLeft size={16} />
                Review Fixes
              </button>

              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-lg bg-gray-200 px-5 py-3 text-sm font-semibold text-gray-500"
              >
                Verify DNS (Coming Soon)
              </button>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              Automatic DNS verification will be enabled when the
              backend scanning service is connected.
            </p>
          </div>

        ) : (

          <>
            {/* Summary Card */}
            <div className="mb-7 flex flex-col gap-4 rounded-xl border border-emerald-300 bg-[#A0F3D0] p-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white">
                  <Info size={20} />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-[#071B36] sm:text-base">
                    We found {issues.length}{" "}
                    {issues.length === 1 ? "issue" : "issues"} with
                    your email setup.
                  </h2>

                  <p className="mt-1 text-xs text-gray-700 sm:text-sm">
                    These issues may affect your email authentication
                    and deliverability.
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-white/40 px-5 py-3 text-center sm:text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                  Scan Status
                </p>
                <p className="mt-1 text-lg font-bold text-emerald-900">
                  Needs Review
                </p>
              </div>

            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,0.95fr)]">

              {/* Issue Card */}
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

                {/* Warning Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-[#FFDDD8] px-5 py-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle size={17} />
                    <span className="text-xs font-semibold">
                      Issue {currentIssue + 1}:{" "}
                      {activeIssue.guide.severity}
                    </span>
                  </div>

                  <span className="rounded bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700">
                    IMPACT: {activeIssue.guide.impact}
                  </span>
                </div>

                <div className="p-5 sm:p-7">

                  <h1 className="mb-3 text-xl font-bold text-[#071B36] sm:text-2xl">
                    {activeIssue.guide.title}
                  </h1>

                  <p className="mb-8 text-sm leading-7 text-gray-600">
                    {activeIssue.guide.description}
                  </p>

                  {/* Fix Instructions */}
                  <div className="mb-4 flex items-center gap-2">
                    <AlertTriangle
                      size={17}
                      className="text-emerald-700"
                    />
                    <h3 className="text-sm font-semibold text-gray-900">
                      How to fix this
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {activeIssue.guide.steps.map((step, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 rounded-md border border-[#D5DEED] bg-[#EEF3FD] p-3"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-600 bg-white text-[11px] text-emerald-700">
                          {index + 1}
                        </span>

                        <p className="text-xs leading-5 text-gray-800 sm:text-sm">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="mt-9 flex flex-wrap items-center justify-between gap-3">

                    {currentIssue > 0 ? (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-emerald-700"
                      >
                        <ArrowLeft size={16} />
                        Previous
                      </button>
                    ) : (
                      <span />
                    )}

                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex items-center justify-center gap-2 rounded-full bg-[#047857] px-7 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                    >
                      I've done this
                      <ArrowRight size={17} />
                    </button>

                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <aside className="space-y-5">

                {/* Explanation */}
                <div className="rounded-xl border border-[#D5DEED] bg-[#EEF3FD] p-5">

                  <div className="mb-4 flex items-center gap-2">
                    <Lightbulb
                      size={19}
                      className="text-emerald-700"
                    />
                    <h3 className="text-sm font-bold text-emerald-900">
                      Why this matters
                    </h3>
                  </div>

                  <p className="text-sm leading-6 text-gray-700">
                    {activeIssue.guide.explanation}
                  </p>

                  <div className="mt-5 space-y-3">
                    {activeIssue.guide.benefits.map(
                      (benefit, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle2
                            size={16}
                            className="shrink-0 text-emerald-700"
                          />
                          <span className="text-xs text-gray-700">
                            {benefit}
                          </span>
                        </div>
                      )
                    )}
                  </div>

                </div>

                {/* Help Card */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

                  <div className="flex h-36 flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#064E3B] via-[#047857] to-[#022C22] text-white">
                    <Server size={37} strokeWidth={1.4} />
                    <span className="text-[11px] font-medium tracking-widest">
                      EMAIL SECURITY
                    </span>
                  </div>

                  <div className="p-4">
                    <h4 className="mb-2 text-sm font-bold text-gray-900">
                      Need professional help?
                    </h4>

                    <p className="text-xs leading-5 text-gray-600">
                      Get assistance configuring your domain's
                      email authentication records.
                    </p>
                  </div>

                </div>

              </aside>

            </div>
          </>
        )}

      </main>

      <Footer />
    </div>
  );
}

export default ResultPage;
