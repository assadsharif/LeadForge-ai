"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth";
import { apiPost, ApiRequestError } from "@/lib/api/client";

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: { id: string; email: string; full_name: string; created_at: string };
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

const errorClass = "mt-1 text-sm text-red-400";

const labelClass = "mb-1 block text-sm font-medium text-slate-300";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setServerError(null);
    try {
      await apiPost<
        { email: string; password: string },
        LoginResponse
      >("/api/v1/auth/login", {
        email: data.email,
        password: data.password,
      });
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setServerError(err.detail);
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {serverError && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={!!errors.email}
          aria-describedby="email-error"
          className={inputClass}
          {...register("email")}
        />
        <p
          id="email-error"
          className={errorClass}
          aria-live="polite"
          aria-atomic="true"
        >
          {errors.email?.message ?? ""}
        </p>
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          aria-invalid={!!errors.password}
          aria-describedby="password-error"
          className={inputClass}
          {...register("password")}
        />
        <p
          id="password-error"
          className={errorClass}
          aria-live="polite"
          aria-atomic="true"
        >
          {errors.password?.message ?? ""}
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Sign in
      </button>
    </form>
  );
}
