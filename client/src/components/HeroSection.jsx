import { ShieldCheck, CheckCheck, Timer, WandSparkles } from "lucide-react";
function HeroSection() {
    return <section className="text-center justify-center bg-gray-50 pt-6 pb-16">
        <div className="justify-center items-center flex flex-col gap-6 mt-8">
            <p className="bg-emerald-100 text-emerald-700 text-sm rounded-full px-4 py-1 flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> Privacy-First Email Auditing</p>
            <h1 className="text-5xl font-bold text-gray-900 max-w-2xl leading-tight">Why are your emails landing in spam?</h1>
            <div className="flex gap-2 w-full max-w-xl">
            <input type="text" placeholder="Enter your email domain (e.g., myshop.co.za)" className="flex gap-2 w-full max-w-2xl flex-1 border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <button type="button" className="bg-emerald-700 text-white px-4 py-2 rounded-2xl font-bold cursor-pointer">Scan My Email Now</button>
            </div>
            <ul className="list-none flex flex-row gap-6 mt-4 justify-center">
                <li className="flex items-center gap-2 text-gray-600 text-sm"><CheckCheck className="w-4 h-4 text-emerald-600" /> No technical Knowledge required</li>
                <li className="flex items-center gap-2 text-gray-600 text-sm"><Timer className="w-4 h-4 text-emerald-600" /> Results in under 2 minutes</li>
                <li className="flex items-center gap-2 text-gray-600 text-sm"><WandSparkles className="w-4 h-4 text-emerald-600" /> Step-by-step fixes included</li>
            </ul>
        </div>
    </section>
}

export default HeroSection
