"use client";

import { useState } from "react";

export type BillingCycle = "monthly" | "annual";

interface PricingToggleProps {
  onChange?: (cycle: BillingCycle) => void;
}

export function PricingToggle({ onChange }: PricingToggleProps) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  function handleChange(value: BillingCycle) {
    setCycle(value);
    onChange?.(value);
  }

  return (
    <div
      role="radiogroup"
      aria-label="Billing cycle"
      className="inline-flex items-center gap-4 rounded-full border border-white/10 bg-white/5 p-1"
    >
      {(["monthly", "annual"] as const).map((option) => (
        <label
          key={option}
          className={[
            "cursor-pointer rounded-full px-5 py-2 text-sm font-medium capitalize transition-all",
            cycle === option
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:text-white",
          ].join(" ")}
        >
          <input
            type="radio"
            name="billing"
            value={option}
            checked={cycle === option}
            onChange={() => handleChange(option)}
            className="sr-only"
            aria-label={option}
          />
          {option}
        </label>
      ))}
      {cycle === "annual" && (
        <span className="mr-2 text-xs font-semibold text-emerald-400">
          Save 20%
        </span>
      )}
    </div>
  );
}
