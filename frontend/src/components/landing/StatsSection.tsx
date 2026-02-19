const STATS = [
  { value: "10,000+", label: "Leads captured" },
  { value: "3×", label: "Faster qualification" },
  { value: "94%", label: "Accuracy rate" },
] as const;

export function StatsSection() {
  return (
    <section className="border-y border-white/10 bg-white/[0.02] px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <dl className="grid grid-cols-1 gap-y-10 sm:grid-cols-3 sm:gap-x-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <dt className="text-sm text-slate-400">{label}</dt>
              <dd className="mt-4 text-4xl font-bold text-indigo-400">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
