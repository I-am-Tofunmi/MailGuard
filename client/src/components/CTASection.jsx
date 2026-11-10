import { Link } from "react-router-dom";

function CTASection() {
  return (
    <section className="px-4 py-10 sm:px-8 overflow-hidden">
      <div className="mx-auto max-w-4xl rounded-2xl border border-gray-300 px-5 py-10 text-center sm:px-8 sm:py-12">
        <h2 className="text-2xl font-bold sm:text-4xl text-gray-900 break-words">Ready for "All Clear"?</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-gray-600 sm:text-lg">
          Stop guessing. Get the assisted clarity you need to keep your business communicating effectively.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/scan"
            className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 sm:w-48"
          >
            Start Your Free Audit
          </Link>
          <button
            type="button"
            className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-emerald-100 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-200 cursor-pointer sm:w-48"
          >
            Talk to an Expert
          </button>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
