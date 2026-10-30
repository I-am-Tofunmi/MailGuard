
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  LoaderCircle,
  Info,
  Sparkles,
  ShieldCheck,
  MailCheck,
  Globe,
  RotateCcw,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const initialChecks = [
  {
    id: "domain",
    title: "Domain found",
    description: "Checking domain...",
    status: "pending",
  },
  {
    id: "mx",
    title: "MX Records",
    description: "Checking mail routing...",
    status: "pending",
  },
  {
    id: "spf",
    title: "SPF Record",
    description: "Checking sender authorization...",
    status: "pending",
  },
  {
    id: "dkim",
    title: "DKIM",
    description: "Checking cryptographic signatures...",
    status: "pending",
  },
  {
    id: "dmarc",
    title: "DMARC",
    description: "Checking domain protection...",
    status: "pending",
  },
  {
    id: "blacklist",
    title: "Blacklist Reputation",
    description: "Checking reputation databases...",
    status: "pending",
  },
];

const demoResults = [
  {
    status: "passed",
    description: "Domain successfully resolved",
  },
  {
    status: "passed",
    description: "Mail routing is active",
  },
  {
    status: "failed",
    description: "Multiple SPF records detected",
  },
  {
    status: "passed",
    description: "Cryptographic signature valid",
  },
  {
    status: "passed",
    description: "DMARC policy found",
  },
  {
    status: "passed",
    description: "No issues in demo checks",
  },
];

const SCAN_DURATION = 12000;

function ScanPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const domain = location.state?.domain || "example.com";

  const [progress, setProgress] = useState(0);
  const [checks, setChecks] = useState(initialChecks);
  const [scanComplete, setScanComplete] = useState(false);

  useEffect(() => {
    const intervalDuration = 100;
    const totalSteps = SCAN_DURATION / intervalDuration;

    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep += 1;

      const nextProgress = Math.min(
        Math.round((currentStep / totalSteps) * 100),
        100
      );

      setProgress(nextProgress);

      const activeIndex = Math.min(
        Math.floor((nextProgress / 100) * initialChecks.length),
        initialChecks.length
      );

      setChecks(
        initialChecks.map((check, index) => {
          if (index < activeIndex) {
            return {
              ...check,
              ...demoResults[index],
            };
          }

          if (
            index === activeIndex &&
            activeIndex < initialChecks.length
          ) {
            return {
              ...check,
              status: "checking",
              description: "Checking...",
            };
          }

          return check;
        })
      );

      if (nextProgress >= 100) {
        clearInterval(interval);
        setScanComplete(true);
      }
    }, intervalDuration);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!scanComplete) return;

    const timeout = setTimeout(() => {
      navigate("/results", {
        replace: true,
        state: {
          domain,
          isDemo: true,
          checks: initialChecks.map((check, index) => ({
            ...check,
            ...demoResults[index],
          })),
        },
      });
    }, 1500);

    return () => clearTimeout(timeout);
  }, [scanComplete, navigate, domain]);

  const getStatusStyles = (status) => {
    switch (status) {
      case "passed":
        return "border-gray-200 bg-white";

      case "failed":
        return "border-red-200 bg-[#FFDEDC]";

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
            <CheckCircle2
              size={20}
              className="text-emerald-700"
              fill="#A7F3D0"
            />
          </div>
        );

      case "failed":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
            <XCircle
              size={20}
              className="text-red-600"
            />
          </div>
        );

      case "checking":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50">
            <LoaderCircle
              size={20}
              className="animate-spin text-emerald-700"
            />
          </div>
        );

      default:
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
            <LoaderCircle
              size={19}
              className="text-gray-400"
            />
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F9FE]">
      <Navbar />

      <main className="flex flex-1 flex-col items-center px-5 pb-16 pt-10 sm:px-8">

        {/* Scan Heading */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-[#071B36] sm:text-3xl">
            {scanComplete
              ? "Scan Complete!"
              : "Scanning your email setup..."}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {scanComplete
              ? "Preparing your diagnostic report..."
              : "Checking your domain's email authentication configuration."}
          </p>

          <p className="mt-2 text-xs font-medium text-emerald-700 break-all">
            {domain}
          </p>
        </div>

        {/* Main Scan Content */}
        <div className="w-full max-w-[650px]">

          {/* Progress Bar */}
          <div
            className="mb-10"
            role="progressbar"
            aria-label="Email scan progress"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-[11px] w-full overflow-hidden rounded-full bg-[#DFE8F3]">
              <div
                className="h-full rounded-full bg-[#006747] transition-all duration-100 ease-linear"
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

                <div className="min-w-0">
                  <h3
                    className={`text-sm font-semibold ${
                      check.status === "failed"
                        ? "text-red-700"
                        : "text-[#071B36]"
                    }`}
                  >
                    {check.title}
                    {check.status === "failed" && " - issue detected"}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-gray-600">
                    {check.description}
                  </p>
                </div>
              </div>
            ))}

            {/* Inbox Rate */}
            <div className="flex min-h-[78px] items-center gap-3 rounded-xl border border-gray-100 bg-[#EEF3FA] p-4 opacity-70">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                <MailCheck size={19} className="text-gray-500" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500">
                  Estimating Gmail inbox rate
                </h3>
                <p className="mt-1 text-xs text-gray-400">
                  Requires delivery measurement data
                </p>
              </div>
            </div>

            {/* Why This Matters */}
            <div className="flex min-h-[78px] flex-col items-center justify-center gap-1 rounded-xl border border-emerald-100 bg-[#D2FAEC] p-4 text-center">
              <Info size={19} className="text-emerald-800" />
              <h3 className="text-sm font-semibold text-emerald-900">
                Why this scan matters
              </h3>
              <p className="text-[11px] text-emerald-800">
                Understand how email providers evaluate your domain.
              </p>
            </div>

          </div>

          {/* Initial Finding */}
          <div className="mt-10 rounded-xl border border-gray-200 bg-white p-5 sm:p-6">

            <div className="flex items-start gap-3">
              <Sparkles
                size={23}
                className="mt-0.5 shrink-0 text-emerald-700"
              />

              <div>
                <h3 className="mb-2 text-base font-semibold text-[#071B36]">
                  {progress < 50
                    ? "Analyzing your domain"
                    : "Initial Finding"}
                </h3>

                <p className="text-sm leading-6 text-gray-600">
                  {progress < 50
                    ? "MailGuard is reviewing your domain configuration and email authentication records."
                    : "Demo finding: multiple SPF records can cause authentication failures. MailGuard will explain how to resolve this in your report."}
                </p>
              </div>
            </div>

          </div>

          {/* Demo Notice */}
          <p className="mt-5 text-center text-xs text-gray-400">
            Demo scan: diagnostic results are simulated and do not
            represent actual checks of this domain.
          </p>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ScanPage;
