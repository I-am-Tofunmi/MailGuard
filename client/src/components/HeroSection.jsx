import { ShieldCheck, CheckCheck, Timer, WandSparkles } from "lucide-react";

function HeroSection() {
  return (
    <section className="bg-gray-100 pb-16 pt-6 text-center">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-5 mt-8 sm:px-8">
        <p className="flex items-center gap-1 rounded-full bg-emerald-100 px-4 py-1 text-sm text-emerald-700">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          Privacy-First Email Auditing
        </p>

        <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl max-w-2xl">
          Why are your emails landing in spam?
        </h1>

        <div className="flex w-full max-w-xl flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="Enter your email domain (e.g., myshop.co.za)"
            className="w-full flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="button"
            className="shrink-0 rounded-2xl bg-emerald-700 px-5 py-3 font-bold text-white cursor-pointer hover:bg-emerald-800 transition"
          >
            Scan My Email Now
          </button>
        </div>

        <ul className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6 mt-2">
          <li className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            No technical knowledge required
          </li>
          <li className="flex items-center gap-2 text-sm text-gray-600">
            <Timer className="h-4 w-4 shrink-0 text-emerald-600" />
            Results in under 2 minutes
          </li>
          <li className="flex items-center gap-2 text-sm text-gray-600">
            <WandSparkles className="h-4 w-4 shrink-0 text-emerald-600" />
            Step-by-step fixes included
          </li>
        </ul>
      </div>
    </section>
  );
}

export default HeroSection;
