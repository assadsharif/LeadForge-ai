"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      router.push("/login");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  function handleSignOut() {
    localStorage.removeItem("access_token");
    router.push("/login");
  }

  if (isChecking) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Nav */}
      <nav className="border-b border-white/10 bg-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-lg font-bold text-white">LeadForge</span>
            <span className="text-lg font-bold text-indigo-500">AI</span>
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-sm text-slate-400 transition-colors hover:text-white"
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-bold text-white">Leads</h1>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-400"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-400"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-400"
                >
                  Added
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={3}
                  className="py-16 text-center text-slate-500"
                >
                  No leads yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
