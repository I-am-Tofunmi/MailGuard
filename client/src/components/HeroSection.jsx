import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, CheckCheck, Timer, WandSparkles, AlertCircle } from "lucide-react";

function HeroSection() {
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = domain.trim();

    if (!trimmed) {
      setError("Please enter your domain or email address to scan.");
      inputRef.current?.focus();
      return;
    }

    setError("");
    navigate(`/scan?domain=${encodeURIComponent(trimmed)}`, {
      state: { domain: trimmed },
    });
  };

  return (
    <section className="bg-gray-100 pb-16 pt-6 text-center overflow-hidden">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 mt-6 sm:px-8 sm:mt-8">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs sm:text-sm font-medium text-emerald-800">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700" />
          <span>Privacy-First Email Auditing</span>
        </p>

        <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl max-w-2xl break-words">
          Why are your emails landing in spam?
        </h1>

        <p className="text-sm sm:text-base text-gray-600 max-w-xl">
          Audit your MX, SPF, DKIM, and DMARC DNS records in seconds. Identify delivery blockers before your emails bounce.
        </p>

        {/* Semantic Scan Form */}
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-xl flex-col gap-3 sm:flex-row"
          noValidate
        >
          <div className="relative flex-1 text-left">
            <input
              ref={inputRef}
              type="text"
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
                if (error) setError("");
              }}
              placeholder="Enter your email or domain (e.g. myshop.com)"
              aria-label="Enter email or domain name to scan"
              className={`w-full min-h-[48px] rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 sm:text-base transition ${
                error
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-100"
              }`}
            />
            {error && (
              <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600 sm:absolute sm:-bottom-6 sm:left-1">
                <AlertCircle size={13} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="flex min-h-[48px] w-full sm:w-auto shrink-0 items-center justify-center rounded-xl bg-emerald-700 px-6 py-3 text-sm sm:text-base font-bold text-white shadow-sm transition hover:bg-emerald-800 active:scale-[0.99] cursor-pointer"
          >
            Scan My Email Now
          </button>
        </form>

        {/* Feature Bullets */}
        <ul className="flex flex-col items-start sm:items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6 mt-3 text-left">
          <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <CheckCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>No technical knowledge required</span>
          </li>
          <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <Timer className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Results in under 2 minutes</span>
          </li>
          <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <WandSparkles className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Step-by-step fixes included</span>
          </li>
        </ul>
      </div>
    </section>
  );
}

export default HeroSection;
