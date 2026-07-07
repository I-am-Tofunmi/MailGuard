function StatsBanner() {
    return <article className="bg-emerald-700 text-white flex justify-around items-center py-6 px-4 gap-5">
        <div className="flex flex-col items-center">
            <h3 className="text-3xl font-bold">5,300+</h3>    
            <p className="text-sm tracking-widest text-emerald-200">EMAILS DIAGNOSED</p>
        </div>
        <div className="flex flex-col items-center">
            <h2 className="text-3xl font-bold">92%</h2>
            <p className="text-sm tracking-widest text-emerald-200">FIXED AT LEAST ONE ISSUE</p>
        </div>
        <div className="flex flex-col items-center">
            <h2 className="text-3xl font-bold">All Clear</h2>
            <p className="text-sm tracking-widest text-emerald-200">USER STATUS GLOBAL</p>
        </div>
    </article>
}

export default StatsBanner;