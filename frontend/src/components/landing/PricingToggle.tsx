"use client";

import type { ReactNode } from "react";

export type BillingCycle = "monthly" | "annual";

interface PricingToggleProps {
  value: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
}

export function PricingToggle({ value, onChange }: PricingToggleProps) {
  return (
    <div className="inline-flex flex-col items-center gap-2">
      <fieldset className="m-0 border-0 p-0">
        <legend className="sr-only">Billing cycle</legend>
        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
          {(["monthly", "annual"] as const).map((option) => (
            <label
              key={option}
              className={[
                "cursor-pointer rounded-full px-5 py-2 text-sm font-medium capitalize transition-all",
                value === option
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white",
              ].join(" ")}
            >
              <input
                type="radio"
                name="billing"
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
                className="sr-only"
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>
      {value === "annual" && (
        <span className="text-xs font-semibold text-emerald-400">
          Save 20%
        </span>
      )}
    </div>
  );
}
