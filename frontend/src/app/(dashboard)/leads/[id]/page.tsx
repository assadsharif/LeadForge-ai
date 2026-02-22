"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ApiRequestError, apiGet, apiPost } from "@/lib/api/client";

type LeadRead = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

type EnrichResponse = {
  summary: string;
  outreach_email: string;
};

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [lead, setLead] = useState<LeadRead | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [enrichment, setEnrichment] = useState<EnrichResponse | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichError, setEnrichError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    apiGet<LeadRead>(`/api/v1/leads/${params.id}`)
      .then((data) => setLead(data))
      .catch((err) => {
        if (err instanceof ApiRequestError && err.status === 401) {
          router.push("/login");
        } else {
          setError(err instanceof Error ? err.message : "Failed to load lead.");
        }
      })
      .finally(() => setIsLoading(false));
  }, [params.id, router]);

  async function handleEnrich() {
    setIsEnriching(true);
    setEnrichError(null);
    try {
      const data = await apiPost<Record<string, never>, EnrichResponse>(
        `/api/v1/leads/${params.id}/enrich`,
        {},
      );
      setEnrichment(data);
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 401) {
        router.push("/login");
      } else {
        setEnrichError(
          err instanceof Error ? err.message : "Enrichment failed.",
        );
      }
    } finally {
      setIsEnriching(false);
    }
  }

  async function handleCopy() {
    if (!enrichment) return;
    await navigator.clipboard.writeText(enrichment.outreach_email);
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
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
          <Link
            href="/dashboard"
            className="text-sm text-slate-400 transition-colors hover:text-white"
          >
            ← Back to dashboard
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {isLoading && (
          <p className="text-slate-500">Loading…</p>
        )}

        {error !== null && (
          <div
            role="alert"
            className="rounded-lg bg-red-900/20 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </div>
        )}

        {lead !== null && (
          <>
            {/* Lead card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h1 className="text-2xl font-bold text-white">{lead.name}</h1>
              <p className="mt-1 text-slate-300">{lead.email}</p>
              <p className="mt-1 text-sm text-slate-500">
                Added {new Date(lead.created_at).toLocaleDateString()}
              </p>

              <button
                type="button"
                onClick={() => void handleEnrich()}
                disabled={isEnriching}
                className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isEnriching ? "Enriching…" : "Enrich with AI"}
              </button>

              {enrichError !== null && (
                <div
                  role="alert"
                  className="mt-4 rounded-lg bg-red-900/20 px-4 py-3 text-sm text-red-400"
                >
                  {enrichError}
                </div>
              )}
            </div>

            {/* Enrichment result card */}
            {enrichment !== null && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-lg font-semibold text-white">
                  AI Enrichment
                </h2>

                <div className="mt-4">
                  <h3 className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Summary
                  </h3>
                  <p className="mt-2 text-sm text-slate-300">
                    {enrichment.summary}
                  </p>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Outreach Email
                    </h3>
                    <button
                      type="button"
                      onClick={() => void handleCopy()}
                      className="text-xs text-indigo-400 transition-colors hover:text-indigo-300"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-black/30 p-4 text-sm text-slate-300">
                    {enrichment.outreach_email}
                  </pre>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
