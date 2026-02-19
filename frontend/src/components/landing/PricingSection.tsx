import { PricingClient } from "./PricingClient";

export function PricingSection() {
  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-slate-400">
            Start free. Upgrade when you need more.
          </p>
        </div>
        <PricingClient />
      </div>
    </section>
  );
}
