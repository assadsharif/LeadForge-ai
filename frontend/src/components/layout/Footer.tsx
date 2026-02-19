const FOOTER_LINKS = {
  Product: ["Features", "Pricing", "Changelog"],
  Company: ["About", "Blog", "Careers"],
  Legal: ["Privacy", "Terms", "Security"],
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
            <p className="text-sm font-semibold text-white">{heading}</p>
            <ul className="mt-4 space-y-2">
              {links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link}
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
