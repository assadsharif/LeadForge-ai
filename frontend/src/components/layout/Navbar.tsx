import Link from "next/link";
import { NavbarClient } from "./NavbarClient";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "/docs" },
] as const;

export function Navbar() {
  return (
    <NavbarClient>
      <div className="mx-auto max-w-7xl px-6 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-1 font-bold text-lg">
          <span className="text-white">LeadForge</span>
          <span className="text-indigo-500">AI</span>
        </Link>

        <ul className="hidden md:flex items-center gap-8" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/register"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          Get started free
        </Link>
      </div>
    </NavbarClient>
  );
}
