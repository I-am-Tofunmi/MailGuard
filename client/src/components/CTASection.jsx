function CTASection() {
    return (
        <section className="py-10 px-12">
            <div className="border border-gray-300 rounded-2xl py-12 px-8 text-center flex flex-col items-center gap-4 max-w-4xl mx-auto">
                <h2 className="text-4xl font-bold">Ready for "All Clear"?</h2>
                <p className="text-lg max-w-lg">Stop guessing. Get the assisted clarity you need to keep your business communicating effectively.</p>
                <div className="flex justify-center gap-4">
                    <button className="bg-emerald-700 text-emerald-200 rounded-lg py-2 w-48 cursor-pointer">Start Your Free Audit</button>
                    <button className="bg-emerald-200 text-emerald-700 rounded-lg py-2 w-48 cursor-pointer">Talk to an Expert</button>
                </div>
            </div>
        </section>
    )
}

export default CTASection;