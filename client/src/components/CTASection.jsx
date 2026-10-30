function CTASection() {
  return (
    <section className="px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl rounded-2xl border border-gray-300 px-6 py-12 text-center sm:px-8">
        <h2 className="text-3xl font-bold sm:text-4xl">Ready for "All Clear"?</h2>
        <p className="mx-auto mt-3 max-w-lg text-base text-gray-600 sm:text-lg">
          Stop guessing. Get the assisted clarity you need to keep your business communicating effectively.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            className="w-full rounded-lg bg-emerald-700 py-3 text-sm font-semibold text-emerald-100 cursor-pointer hover:bg-emerald-800 transition sm:w-48"
          >
            Start Your Free Audit
          </button>
          <button
            type="button"
            className="w-full rounded-lg bg-emerald-200 py-3 text-sm font-semibold text-emerald-700 cursor-pointer hover:bg-emerald-300 transition sm:w-48"
          >
            Talk to an Expert
          </button>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
