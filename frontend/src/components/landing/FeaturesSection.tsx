import { Sparkles, Zap, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Enrichment",
    description:
      "Automatically enrich every lead with company data, intent signals, and fit score — the moment they submit.",
  },
  {
    icon: Zap,
    title: "Smart Capture",
    description:
      "Embeddable forms that qualify in real time before a lead even submits. Less noise, more signal.",
  },
  {
    icon: ArrowRight,
    title: "Pipeline Ready",
    description:
      "Leads arrive pre-scored and prioritized, direct to your CRM. Your team closes, not qualifies.",
  },
] as const;

export function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
          Everything you need to convert faster
        </h2>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/20">
                <Icon className="h-5 w-5 text-indigo-400" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm text-slate-400">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
