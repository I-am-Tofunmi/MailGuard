import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  CheckCheck,
  Timer,
  WandSparkles,
  AlertCircle,
  Play,
  X,
} from "lucide-react";
import { sanitizeDomain, isPublicWebmailDomain } from "../utils/domainUtils";
import WebmailWarningModal from "./WebmailWarningModal";

function HeroSection() {
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isWebmailModalOpen, setIsWebmailModalOpen] = useState(false);
  const [blockedDomain, setBlockedDomain] = useState("");
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const handleOpenDemo = () => {
    setIsDemoOpen(true);
  };

  const handleCloseDemo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsDemoOpen(false);
  };

  const handleTryCustomDomain = () => {
    try {
      sessionStorage.removeItem("mailguard_scan_result");
      localStorage.removeItem("mailguard_cached_domain");
    } catch {
      // ignore storage errors
    }
    setDomain("");
    setError("");
    setBlockedDomain("");
    setIsWebmailModalOpen(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isDemoOpen) {
        handleCloseDemo();
      }
    };

    if (isDemoOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isDemoOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const sanitized = sanitizeDomain(domain);

    if (!sanitized) {
      setError("Please enter your business domain or email address to scan.");
      inputRef.current?.focus();
      return;
    }

    // Intercept public free webmail providers (gmail.com, yahoo.com, etc.)
    if (isPublicWebmailDomain(sanitized)) {
      // Clear any cached/stored scan results
      try {
        sessionStorage.removeItem("mailguard_scan_result");
        localStorage.removeItem("mailguard_cached_domain");
      } catch {
        // ignore storage errors
      }
      setBlockedDomain(sanitized);
      setIsWebmailModalOpen(true);
      return;
    }

    setError("");
    navigate(`/scan?domain=${encodeURIComponent(sanitized)}`, {
      state: { domain: sanitized },
    });
  };

  return (
    <section className="bg-gray-100 pb-16 pt-6 text-center overflow-hidden">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 mt-6 sm:px-8 sm:mt-8">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs sm:text-sm font-medium text-emerald-800">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700" />
          <span>Stop your business proposals and invoices from going to spam</span>
        </p>

        <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl max-w-2xl break-words">
          Why are your business emails landing in spam?
        </h1>

        <p className="text-sm sm:text-base text-gray-600 max-w-xl leading-relaxed">
          Check your email health in 60 seconds — no tech background needed. Find out if customers are missing your invoices, proposals, and daily business emails.
        </p>

        {/* Semantic Scan Form */}
        <div className="w-full max-w-xl">
          <form onSubmit={handleSubmit} noValidate className="w-full">
            <div className="relative text-left">
              <input
                ref={inputRef}
                type="text"
                value={domain}
                onChange={(e) => {
                  setDomain(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Enter your domain or email (e.g. myshop.co.za or company.ng)"
                aria-label="Enter business domain or email to scan"
                className={`w-full min-h-[48px] rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 sm:text-base transition ${
                  error
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-100"
                }`}
              />
              {error && (
                <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div className="mt-3.5 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="submit"
                className="flex min-h-[48px] w-full sm:w-auto shrink-0 items-center justify-center rounded-xl bg-emerald-700 px-6 py-3 text-sm sm:text-base font-bold text-white shadow-sm transition hover:bg-emerald-800 active:scale-[0.99] cursor-pointer"
              >
                Audit My Domain Free
              </button>

              <button
                type="button"
                onClick={handleOpenDemo}
                className="flex min-h-[48px] w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm sm:text-base font-semibold text-gray-700 shadow-xs transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800 active:scale-[0.99] cursor-pointer"
              >
                <Play size={16} className="fill-emerald-700 text-emerald-700 shrink-0" />
                <span>Watch 60-Sec Demo</span>
              </button>
            </div>
          </form>
        </div>

        {/* Feature Bullets */}
        <ul className="flex flex-col items-start sm:items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6 mt-3 text-left">
          <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <CheckCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>No technical knowledge required</span>
          </li>
          <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <Timer className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Results in under 60 seconds</span>
          </li>
          <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <WandSparkles className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Step-by-step guides for Whogohost, Truehost, Namecheap, Google Workspace, and Microsoft 365</span>
          </li>
        </ul>
      </div>

      {/* 60-Sec Demo Video Modal */}
      {isDemoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          onClick={handleCloseDemo}
          role="dialog"
          aria-modal="true"
          aria-label="MailGuard 60-Second Demo Video"
        >
          <div
            className="relative w-full max-w-3xl rounded-2xl bg-black p-1 sm:p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Explicit ✕ Close Button */}
            <button
              type="button"
              onClick={handleCloseDemo}
              aria-label="Close demo video"
              className="absolute -top-11 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/25 hover:scale-105 cursor-pointer focus:outline-none"
            >
              <X size={20} />
            </button>

            {/* Native Video Player */}
            <div className="overflow-hidden rounded-xl bg-black">
              <video
                ref={videoRef}
                src="/demo.mp4"
                controls
                autoPlay
                playsInline
                className="w-full h-auto rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      )}
      {/* Educational Webmail Warning Modal */}
      <WebmailWarningModal
        isOpen={isWebmailModalOpen}
        onClose={() => setIsWebmailModalOpen(false)}
        onTryCustomDomain={handleTryCustomDomain}
        detectedDomain={blockedDomain}
      />
    </section>
  );
}

export default HeroSection;
