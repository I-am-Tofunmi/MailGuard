function StatsBanner() {
  return (
    <article className="bg-emerald-700 px-5 py-8 text-white sm:px-8">
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 text-center sm:grid-cols-3 sm:gap-4">
        <div className="flex flex-col items-center">
          <h3 className="text-3xl font-bold">5,300+</h3>
          <p className="mt-1 text-sm tracking-widest text-emerald-200">EMAILS DIAGNOSED</p>
        </div>
        <div className="flex flex-col items-center">
          <h3 className="text-3xl font-bold">92%</h3>
          <p className="mt-1 text-sm tracking-widest text-emerald-200">FIXED AT LEAST ONE ISSUE</p>
        </div>
        <div className="flex flex-col items-center">
          <h3 className="text-3xl font-bold">All Clear</h3>
          <p className="mt-1 text-sm tracking-widest text-emerald-200">USER STATUS GLOBAL</p>
        </div>
      </div>
    </article>
  );
}

export default StatsBanner;
