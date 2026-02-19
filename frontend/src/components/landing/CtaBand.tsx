import Link from "next/link";

export function CtaBand() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-r from-indigo-900/60 to-violet-900/60 border border-indigo-500/30 px-12 py-16 text-center backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Start capturing smarter leads today
        </h2>
        <p className="mt-4 text-slate-300">
          Join 10,000+ teams already using LeadForge AI
        </p>
        <Link
          href="/register"
          className="mt-8 inline-block rounded-lg bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-indigo-500 transition-colors"
        >
          Get started free
        </Link>
      </div>
    </section>
  );
}
