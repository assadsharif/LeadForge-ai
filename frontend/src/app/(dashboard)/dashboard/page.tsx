"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ApiRequestError, apiGet } from "@/lib/api/client";

type Lead = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      router.push("/login");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  const fetchLeads = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiGet<Lead[]>("/api/v1/leads", token);
      setLeads(data);
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 401) {
        localStorage.removeItem("access_token");
        router.push("/login");
      } else {
        setError(err instanceof Error ? err.message : "Failed to load leads.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!isChecking) {
      void fetchLeads();
    }
  }, [isChecking, fetchLeads]);

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

        {error !== null && (
          <div
            role="alert"
            className="mt-4 rounded-lg bg-red-900/20 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </div>
        )}

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
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="py-16 text-center text-slate-500">
                    Loading…
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-16 text-center text-slate-500">
                    No leads yet.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-white/5">
                    <td className="px-6 py-4 text-white">{lead.name}</td>
                    <td className="px-6 py-4 text-slate-300">{lead.email}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
