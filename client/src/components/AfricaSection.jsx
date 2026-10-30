import { ShoppingBag, Shirt, Truck, ShieldCheck } from "lucide-react";

function AfricaSection() {
  return (
    <section className="px-5 py-12 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-12">
          {/* Text content */}
          <div className="flex-1">
            <p className="mb-4 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
              INDUSTRY FOCUS
            </p>
            <h3 className="text-3xl font-bold leading-snug sm:text-4xl">
              Built for the Backbone of Africa
            </h3>
            <p className="mt-3 text-gray-600">
              Whether you're running a boutique fashion house in Lagos, an e-commerce giant in Nairobi,
              or a logistics fleet in Cape Town — your emails are your lifeline.
            </p>

            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0 rounded-full bg-emerald-100 p-2">
                  <ShoppingBag className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-base font-bold">Online Stores</h4>
                  <p className="text-sm text-gray-500">
                    Ensuring order confirmations and receipts never hit the "Promotions" or "Spam" folders.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="shrink-0 rounded-full bg-emerald-100 p-2">
                  <Shirt className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-base font-bold">Fashion &amp; Creative</h4>
                  <p className="text-sm text-gray-500">
                    Protecting your brand image by ensuring high-resolution lookbooks arrive in the primary inbox.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="shrink-0 rounded-full bg-emerald-100 p-2">
                  <Truck className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-base font-bold">Logistics &amp; Supply</h4>
                  <p className="text-sm text-gray-500">
                    Critical tracking updates and delivery notifications that customers need to see instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative panel */}
          <div className="flex min-h-[260px] flex-1 flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-6 lg:h-80">
            <ShieldCheck className="mb-4 h-16 w-16 text-emerald-600" />
            <h3 className="text-center text-xl font-semibold text-emerald-700 sm:text-2xl">
              Your Deliverability, Guaranteed
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AfricaSection;
