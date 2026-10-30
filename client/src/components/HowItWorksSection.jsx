import { AtSign, FileChartColumnIncreasing, Sparkles } from "lucide-react";

function HowItWorksSection() {
  return (
    <section className="bg-white pb-16 pt-16 text-center">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <h2 className="text-2xl font-bold sm:text-3xl">Clarity in Three Simple Acts</h2>
        <p className="mt-2 text-gray-400">We strip away the complexity of email servers.</p>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="cursor-pointer rounded-2xl border border-gray-200 bg-gray-100 p-6 text-left transition-all duration-300 hover:border-emerald-400 hover:shadow-md">
            <div className="mb-3 w-fit rounded-lg bg-emerald-100 p-2">
              <AtSign className="h-6 w-6 text-emerald-600" />
            </div>
            <h4 className="font-bold">Enter email</h4>
            <p className="mt-1 text-sm text-gray-600">Provide your business domain or send a test message to our secure diagnostic inbox.</p>
          </div>

          <div className="cursor-pointer rounded-2xl border border-gray-200 bg-gray-100 p-6 text-left transition-all duration-300 hover:border-emerald-400 hover:shadow-md">
            <div className="mb-3 w-fit rounded-lg bg-emerald-100 p-2">
              <FileChartColumnIncreasing className="h-6 w-6 text-emerald-600" />
            </div>
            <h4 className="font-bold">We Scan</h4>
            <p className="mt-1 text-sm text-gray-600">Our engine checks SPF, DKIM, DMARC, and blacklists across 100+ global provider databases.</p>
          </div>

          <div className="cursor-pointer rounded-2xl border border-gray-200 bg-gray-100 p-6 text-left transition-all duration-300 hover:border-emerald-400 hover:shadow-md">
            <div className="mb-3 w-fit rounded-lg bg-emerald-100 p-2">
              <Sparkles className="h-6 w-6 text-emerald-600" />
            </div>
            <h4 className="font-bold">Fix with guidance</h4>
            <p className="mt-1 text-sm text-gray-600">Receive a plain-English report with exact copy-paste steps to reach the inbox every time.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
