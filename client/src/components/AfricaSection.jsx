import { ShoppingBag, Shirt, Truck, ShieldCheck } from "lucide-react";
function AfricaSection() {
    return <section className="py-16 px-12">
        <div className="flex gap-12 items-center">
            <div className="flex-1">
                <p className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full mb-4">INDUSTRY FOCUS</p>
                <h3 className="text-4xl">Built for the Backbone of Africa</h3>
                <p>Whether you're running a boutique fashion house in Lagos, an e-commerce giant in Nairobi, a logistics fleet in Cape Town, your emails are your lifeline.</p>
                <div className="flex items-start gap-3 mt-4">
                    <div className="bg-emerald-100 rounded-full p-2 flex-shrink-0">
                        <ShoppingBag className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold">Online Stores</h3>
                        <p className="text-gray-500 text-sm">Ensuring order confirmations and receipts never hit the "Promotions" or "Spam" folders.</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 mt-4">
                    <div className="bg-emerald-100 rounded-full p-2 flex-shrink-0">
                        <Shirt className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold">Fashion & Creative</h3>
                        <p className="text-gray-500 text-sm">Protecting your brand imgage by ensuring high-resolution lookbooks arrive in the primary inbox.</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 mt-4">
                    <div className="bg-emerald-100 rounded-full p-2 flex-shrink-0">
                        <Truck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold">Logistics & Supply</h3>
                        <p className="text-gray-500 text-sm">Critical tracking updates and delivery notifications that customers need to see instantly.</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-6 h-96 flex flex-col justify-center items-center">
                <ShieldCheck className="w-16 h-16 text-emerald-600 mb-4" />
                <h3 className="text-2xl text-emerald-700">Your Deliverability, Guaranteed</h3>
            </div>
        </div>

    </section>
}

export default AfricaSection;