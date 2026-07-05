import { AtSign, FileChartColumnIncreasing, Sparkles } from "lucide-react";
function HowItWorksSection() {
    return (
        <section className="text-center justify-center bg-white pt-16 pb-16">
            <h2 className="font-bold text-3xl">Clarity in Three Simple Acts</h2>
            <p className="text-gray-400">We strip away the complexity of email servers.</p>
            <div className="flex flex-row gap-6 mt-4 justify-center pt-6 max-w-6xl mx-auto px-6">
                <div className="text-left border border-gray-200 rounded-2xl p-6 bg-gray-100 cursor-pointer flex-1 hover:border-emerald-400 hover:shadow-md transition-all duration-300">
                    <div className="bg-emerald-100 rounded-lg p-2 w-fit mb-3">
                    <AtSign className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h4 className="font-bold">Enter email</h4>
                    <p>Provide your business domain or send a test message to our secure diagnostic inbox.</p>
                </div>
                <div className="text-left border border-gray-200 rounded-2xl p-6 cursor-pointer bg-gray-100 flex-1 hover:border-emerald-400 hover:shadow-md transition-all duration-300">
                    <div className="bg-emerald-100 rounded-lg p-2 w-fit mb-3">
                    <FileChartColumnIncreasing className="w-6 h-6 text-emerald-600" /> 
                    </div>
                    <h4 className="font-bold">We Scan</h4>
                    <p>Our engine checks SPF, DKIM, DMARC, and blacklists across 100 + global provider databases</p>
                </div>
                <div className="text-left border border-gray-200 rounded-2xl p-6 cursor-pointer bg-gray-100 flex-1 hover:border-emerald-400 hover:shadow-md transition-all duration-300">
                    <div className="bg-emerald-100 rounded-lg p-2 w-fit mb-3">
                    <Sparkles className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h4 className="font-bold">Fix with guidance</h4>
                    <p>Receive a plan-English report with exact copy-paste steps to reach the inbox every time.</p>
                </div>
            </div>
        </section>
    )
    
}

export default HowItWorksSection