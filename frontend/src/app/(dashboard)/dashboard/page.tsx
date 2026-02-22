"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ApiRequestError, apiGet, apiPost } from "@/lib/api/client";
import { AddLeadModal } from "./AddLeadModal";

type Lead = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiGet<Lead[]>("/api/v1/leads");
      setLeads(data);
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 401) {
        router.push("/login");
      } else {
        setError(err instanceof Error ? err.message : "Failed to load leads.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  async function handleSignOut() {
    await apiPost("/api/v1/auth/logout", {}).catch(() => null);
    router.push("/login");
  }

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
            onClick={() => void handleSignOut()}
            className="text-sm text-slate-400 transition-colors hover:text-white"
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Add lead
          </button>
        </div>

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
                    <td className="px-6 py-4">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="text-white hover:text-indigo-300 transition-colors"
                      >
                        {lead.name}
                      </Link>
                    </td>
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

      {isModalOpen && (
        <AddLeadModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            void fetchLeads();
          }}
        />
      )}
    </div>
  );
}
