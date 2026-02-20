import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create your account — LeadForge AI",
  description: "Sign up for LeadForge AI and start capturing smarter leads.",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center justify-center gap-1">
          <span className="text-xl font-bold text-white">LeadForge</span>
          <span className="text-xl font-bold text-indigo-500">AI</span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <h1 className="mb-6 text-center text-xl font-bold text-white">
            Create your account
          </h1>
          <RegisterForm />
        </div>

        {/* Footer link */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
