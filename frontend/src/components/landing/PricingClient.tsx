"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { PricingToggle, type BillingCycle } from "./PricingToggle";

interface PricingTier {
  name: string;
  price: string;
  annualPrice: string;
  description: string;
  features: readonly string[];
  cta: string;
  ctaHref: string;
  highlighted: boolean;
}

const TIERS: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    annualPrice: "$0",
    description: "For individuals getting started",
    features: ["5 leads/month", "Basic AI capture", "Email support"],
    cta: "Get started",
    ctaHref: "/register",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$49",
    annualPrice: "$39",
    description: "For growing teams",
    features: [
      "Unlimited leads",
      "AI qualify + score",
      "CRM export",
      "Priority support",
      "Analytics dashboard",
    ],
    cta: "Start free trial",
    ctaHref: "/register?plan=pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    annualPrice: "Custom",
    description: "For large organizations",
    features: [
      "Everything in Pro",
      "SLA guarantee",
      "API access",
      "Dedicated CSM",
      "SSO / SAML",
    ],
    cta: "Contact sales",
    ctaHref: "/contact",
    highlighted: false,
  },
];

export function PricingClient() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  return (
    <>
      <div className="mt-8 flex justify-center">
        <PricingToggle onChange={setCycle} />
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-3">
        {TIERS.map((tier) => {
          const displayPrice =
            cycle === "annual" ? tier.annualPrice : tier.price;
          return (
            <div
              key={tier.name}
              className={[
                "rounded-2xl border p-8",
                tier.highlighted
                  ? "border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500"
                  : "border-white/10 bg-white/5",
              ].join(" ")}
            >
              <p className="text-lg font-semibold text-white">{tier.name}</p>
              <p className="mt-1 text-sm text-slate-400">{tier.description}</p>
              <p className="mt-4 text-4xl font-bold text-white">
                {displayPrice}
                {displayPrice !== "Custom" && (
                  <span className="text-lg font-normal text-slate-400">
                    /mo
                  </span>
                )}
              </p>
              <ul className="mt-8 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check
                      className="h-4 w-4 flex-shrink-0 text-indigo-400"
                      aria-hidden="true"
                    />
                    <span className="text-sm text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={tier.ctaHref}
                className={[
                  "mt-8 block rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors",
                  tier.highlighted
                    ? "bg-indigo-600 text-white hover:bg-indigo-500"
                    : "border border-white/20 text-white hover:bg-white/5",
                ].join(" ")}
              >
                {tier.cta}
              </Link>
            </div>
          );
        })}
      </div>
    </>
  );
}
