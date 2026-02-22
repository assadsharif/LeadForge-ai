"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ApiRequestError, apiPost } from "@/lib/api/client";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export function AddLeadModal({ onClose, onSuccess }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await apiPost<{ name: string; email: string }, unknown>(
        "/api/v1/leads",
        { name, email },
      );
      onSuccess();
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 401) {
        router.push("/login");
      } else {
        setError(
          err instanceof ApiRequestError ? err.detail : "Failed to add lead.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-lead-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111118] p-6">
        <h2
          id="add-lead-title"
          className="text-lg font-semibold text-white"
        >
          Add lead
        </h2>

        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
          {error !== null && (
            <div
              role="alert"
              className="rounded-lg bg-red-900/20 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="lead-name"
              className="mb-1 block text-sm font-medium text-slate-300"
            >
              Name
            </label>
            <input
              id="lead-name"
              type="text"
              required
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="lead-email"
              className="mb-1 block text-sm font-medium text-slate-300"
            >
              Email
            </label>
            <input
              id="lead-email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 transition-colors hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              Add lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
