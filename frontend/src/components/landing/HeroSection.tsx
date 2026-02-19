import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-24 text-center dot-grid overflow-hidden">
      {/* Radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-[600px] w-[600px] rounded-full bg-gradient-radial from-indigo-900/40 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl">
        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
          Capture and qualify leads{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            at AI speed
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          LeadForge AI turns every form submission into a qualified opportunity.
          Enriched, scored, and pipeline-ready before your team even opens the
          CRM.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="rounded-lg bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-indigo-500 transition-colors"
          >
            Get started free
          </Link>
          <a
            href="#features"
            className="rounded-lg border border-white/20 px-8 py-3 text-base font-semibold text-white hover:bg-white/5 transition-colors"
          >
            See how it works
          </a>
        </div>

        <p className="mt-6 text-sm text-slate-500">
          No credit card required · Setup in 5 minutes
        </p>
      </div>
    </section>
  );
}
