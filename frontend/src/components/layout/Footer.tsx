const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Changelog", href: "/changelog" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Security", href: "/security" },
  ],
} as const;

export function Footer() {
  return (
    <footer
      className="border-t border-white/10 bg-black/40 px-6 py-16"
    >
      <div className="mx-auto max-w-7xl grid grid-cols-2 gap-12 md:grid-cols-4">
        <div>
          <p className="font-bold text-lg">
            <span className="text-white">LeadForge</span>
            <span className="text-indigo-500">AI</span>
          </p>
          <p className="mt-2 text-sm text-slate-400">
            AI-powered lead capture and qualification.
          </p>
        </div>

        {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
          <div key={heading}>
            <h3 className="text-sm font-semibold text-white">{heading}</h3>
            <ul className="mt-4 space-y-2">
              {links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-16 max-w-7xl border-t border-white/10 pt-8 text-sm text-slate-500">
        © 2026 LeadForge AI. All rights reserved.
      </div>
    </footer>
  );
}
