# Landing Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the LeadForge-AI marketing landing page — a fully static, server-rendered
conversion page with dark tech aesthetic, 7 sections, and a "Get started free" CTA.

**Architecture:** All sections are Next.js Server Components. The two interactive pieces
(navbar scroll behavior, pricing toggle) are extracted into minimal `"use client"` wrapper
components. No new runtime dependencies except `lucide-react` for icons.

**Tech Stack:** Next.js 14 App Router · TypeScript strict · Tailwind CSS · Lucide React ·
Vitest + React Testing Library + jsdom (tests)

**Design doc:** `docs/plans/2026-02-19-landing-page-design.md`

---

## Phase 0: Setup

### Task 1: Install missing dependencies

**Files:**
- Modify: `frontend/package.json`

**Step 1: Install runtime and dev deps**

```bash
cd frontend
npm install lucide-react
npm install --save-dev @vitejs/plugin-react @testing-library/jest-dom jsdom vite
```

Expected: exit 0, `node_modules/lucide-react` exists.

**Step 2: Add test script to package.json**

In `frontend/package.json`, update `"scripts"`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

**Step 3: Create `frontend/vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**Step 4: Create `frontend/src/test/setup.ts`**

```typescript
import "@testing-library/jest-dom";
```

**Step 5: Verify Vitest runs**

```bash
cd frontend && npx vitest run
```

Expected: "No test files found" (0 tests, exit 0).

**Step 6: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/vitest.config.ts frontend/src/test/setup.ts
git commit -m "chore(frontend): configure vitest + install lucide-react"
```

---

### Task 2: Extend Tailwind config with custom colors

**Files:**
- Modify: `frontend/tailwind.config.ts`

**Step 1: Update tailwind.config.ts**

Replace the file contents with:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#0a0a0f",
          "bg-card": "rgba(255,255,255,0.05)",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
```

**Step 2: Update `frontend/src/app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg-primary: #0a0a0f;
  }

  body {
    background-color: var(--bg-primary);
    color: white;
  }
}

/* Dot-grid overlay pattern */
.dot-grid {
  background-image: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.06) 1px,
    transparent 1px
  );
  background-size: 32px 32px;
}
```

**Step 3: Commit**

```bash
git add frontend/tailwind.config.ts frontend/src/app/globals.css
git commit -m "chore(frontend): extend tailwind config and add dot-grid CSS"
```

---

## Phase 1: Layout Components

### Task 3: NavbarClient (scroll-aware behavior)

**Files:**
- Create: `frontend/src/components/layout/NavbarClient.tsx`
- Create: `frontend/src/components/layout/__tests__/NavbarClient.test.tsx`

**Step 1: Write the failing test**

Create `frontend/src/components/layout/__tests__/NavbarClient.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import { NavbarClient } from "../NavbarClient";

describe("NavbarClient", () => {
  it("renders children", () => {
    render(<NavbarClient><div>nav content</div></NavbarClient>);
    expect(screen.getByText("nav content")).toBeInTheDocument();
  });

  it("has role navigation", () => {
    render(<NavbarClient><span>nav</span></NavbarClient>);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd frontend && npx vitest run src/components/layout/__tests__/NavbarClient.test.tsx
```

Expected: FAIL — "Cannot find module '../NavbarClient'"

**Step 3: Implement NavbarClient**

Create `frontend/src/components/layout/NavbarClient.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";

interface NavbarClientProps {
  children: React.ReactNode;
}

export function NavbarClient({ children }: NavbarClientProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={[
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-black/80 backdrop-blur-md border-b border-white/10"
          : "bg-transparent",
      ].join(" ")}
    >
      {children}
    </nav>
  );
}
```

**Step 4: Run test to verify it passes**

```bash
cd frontend && npx vitest run src/components/layout/__tests__/NavbarClient.test.tsx
```

Expected: PASS (2 tests)

**Step 5: Commit**

```bash
git add frontend/src/components/layout/NavbarClient.tsx \
        frontend/src/components/layout/__tests__/NavbarClient.test.tsx
git commit -m "feat(landing): add NavbarClient scroll-aware wrapper"
```

---

### Task 4: Navbar

**Files:**
- Create: `frontend/src/components/layout/Navbar.tsx`
- Create: `frontend/src/components/layout/__tests__/Navbar.test.tsx`

**Step 1: Write the failing test**

Create `frontend/src/components/layout/__tests__/Navbar.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import { Navbar } from "../Navbar";

describe("Navbar", () => {
  it("renders logo text", () => {
    render(<Navbar />);
    expect(screen.getByText(/LeadForge/i)).toBeInTheDocument();
  });

  it("renders get started link pointing to /register", () => {
    render(<Navbar />);
    const cta = screen.getByRole("link", { name: /get started free/i });
    expect(cta).toHaveAttribute("href", "/register");
  });

  it("renders features nav link", () => {
    render(<Navbar />);
    expect(screen.getByRole("link", { name: /features/i })).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd frontend && npx vitest run src/components/layout/__tests__/Navbar.test.tsx
```

Expected: FAIL

**Step 3: Implement Navbar**

Create `frontend/src/components/layout/Navbar.tsx`:

```typescript
import Link from "next/link";
import { NavbarClient } from "./NavbarClient";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#" },
] as const;

export function Navbar() {
  return (
    <NavbarClient>
      <div className="mx-auto max-w-7xl px-6 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-1 font-bold text-lg">
          <span className="text-white">LeadForge</span>
          <span className="text-indigo-500">AI</span>
        </Link>

        <ul className="hidden md:flex items-center gap-8" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/register"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          Get started free
        </Link>
      </div>
    </NavbarClient>
  );
}
```

**Step 4: Run test to verify it passes**

```bash
cd frontend && npx vitest run src/components/layout/__tests__/Navbar.test.tsx
```

Expected: PASS (3 tests)

**Step 5: Commit**

```bash
git add frontend/src/components/layout/Navbar.tsx \
        frontend/src/components/layout/__tests__/Navbar.test.tsx
git commit -m "feat(landing): add Navbar component"
```

---

### Task 5: Footer

**Files:**
- Create: `frontend/src/components/layout/Footer.tsx`
- Create: `frontend/src/components/layout/__tests__/Footer.test.tsx`

**Step 1: Write the failing test**

```typescript
import { render, screen } from "@testing-library/react";
import { Footer } from "../Footer";

describe("Footer", () => {
  it("renders logo", () => {
    render(<Footer />);
    expect(screen.getByText(/LeadForge/i)).toBeInTheDocument();
  });

  it("renders contentinfo landmark", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("renders copyright year", () => {
    render(<Footer />);
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });
});
```

**Step 2: Run and confirm fail**

```bash
cd frontend && npx vitest run src/components/layout/__tests__/Footer.test.tsx
```

**Step 3: Implement Footer**

Create `frontend/src/components/layout/Footer.tsx`:

```typescript
const FOOTER_LINKS = {
  Product: ["Features", "Pricing", "Changelog"],
  Company: ["About", "Blog", "Careers"],
  Legal: ["Privacy", "Terms", "Security"],
} as const;

export function Footer() {
  return (
    <footer
      role="contentinfo"
      className="border-t border-white/10 bg-black/40 px-6 py-16"
    >
      <div className="mx-auto max-w-7xl grid grid-cols-2 gap-12 md:grid-cols-4">
        <div>
          <p className="font-bold text-lg">
            <span className="text-white">LeadForge</span>
            <span className="text-indigo-500">AI</span>
          </p>
          <p className="mt-2 text-sm text-slate-400">
            AI-powered lead capture and qualification.
          </p>
        </div>

        {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
          <div key={heading}>
            <p className="text-sm font-semibold text-white">{heading}</p>
            <ul className="mt-4 space-y-2">
              {links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-16 max-w-7xl border-t border-white/10 pt-8 text-sm text-slate-500">
        © 2026 LeadForge AI. All rights reserved.
      </div>
    </footer>
  );
}
```

**Step 4: Run and confirm pass**

```bash
cd frontend && npx vitest run src/components/layout/__tests__/Footer.test.tsx
```

**Step 5: Commit**

```bash
git add frontend/src/components/layout/Footer.tsx \
        frontend/src/components/layout/__tests__/Footer.test.tsx
git commit -m "feat(landing): add Footer component"
```

---

## Phase 2: Landing Sections

### Task 6: HeroSection

**Files:**
- Create: `frontend/src/components/landing/HeroSection.tsx`
- Create: `frontend/src/components/landing/__tests__/HeroSection.test.tsx`

**Step 1: Write the failing test**

```typescript
import { render, screen } from "@testing-library/react";
import { HeroSection } from "../HeroSection";

describe("HeroSection", () => {
  it("renders main headline", () => {
    render(<HeroSection />);
    expect(
      screen.getByRole("heading", { level: 1 })
    ).toHaveTextContent(/capture and qualify leads/i);
  });

  it("renders get started CTA linking to /register", () => {
    render(<HeroSection />);
    const cta = screen.getByRole("link", { name: /get started free/i });
    expect(cta).toHaveAttribute("href", "/register");
  });

  it("renders trust badge", () => {
    render(<HeroSection />);
    expect(screen.getByText(/no credit card required/i)).toBeInTheDocument();
  });
});
```

**Step 2: Run and confirm fail**

```bash
cd frontend && npx vitest run src/components/landing/__tests__/HeroSection.test.tsx
```

**Step 3: Implement HeroSection**

Create `frontend/src/components/landing/HeroSection.tsx`:

```typescript
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-24 text-center dot-grid overflow-hidden">
      {/* Radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-[600px] w-[600px] rounded-full bg-gradient-radial from-indigo-900/40 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl">
        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
          Capture and qualify leads{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            at AI speed
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          LeadForge AI turns every form submission into a qualified opportunity.
          Enriched, scored, and pipeline-ready before your team even opens the
          CRM.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="rounded-lg bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-indigo-500 transition-colors"
          >
            Get started free
          </Link>
          <a
            href="#features"
            className="rounded-lg border border-white/20 px-8 py-3 text-base font-semibold text-white hover:bg-white/5 transition-colors"
          >
            See how it works
          </a>
        </div>

        <p className="mt-6 text-sm text-slate-500">
          No credit card required · Setup in 5 minutes
        </p>
      </div>
    </section>
  );
}
```

**Step 4: Run and confirm pass**

```bash
cd frontend && npx vitest run src/components/landing/__tests__/HeroSection.test.tsx
```

**Step 5: Commit**

```bash
git add frontend/src/components/landing/HeroSection.tsx \
        frontend/src/components/landing/__tests__/HeroSection.test.tsx
git commit -m "feat(landing): add HeroSection"
```

---

### Task 7: FeaturesSection

**Files:**
- Create: `frontend/src/components/landing/FeaturesSection.tsx`
- Create: `frontend/src/components/landing/__tests__/FeaturesSection.test.tsx`

**Step 1: Write the failing test**

```typescript
import { render, screen } from "@testing-library/react";
import { FeaturesSection } from "../FeaturesSection";

describe("FeaturesSection", () => {
  it("renders section heading", () => {
    render(<FeaturesSection />);
    expect(
      screen.getByRole("heading", { name: /everything you need/i })
    ).toBeInTheDocument();
  });

  it("renders all 3 feature cards", () => {
    render(<FeaturesSection />);
    expect(screen.getByText(/AI Enrichment/i)).toBeInTheDocument();
    expect(screen.getByText(/Smart Capture/i)).toBeInTheDocument();
    expect(screen.getByText(/Pipeline Ready/i)).toBeInTheDocument();
  });

  it("has features anchor id", () => {
    const { container } = render(<FeaturesSection />);
    expect(container.querySelector("#features")).not.toBeNull();
  });
});
```

**Step 2: Run and confirm fail**

```bash
cd frontend && npx vitest run src/components/landing/__tests__/FeaturesSection.test.tsx
```

**Step 3: Implement FeaturesSection**

Create `frontend/src/components/landing/FeaturesSection.tsx`:

```typescript
import { Sparkles, Zap, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Enrichment",
    description:
      "Automatically enrich every lead with company data, intent signals, and fit score — the moment they submit.",
  },
  {
    icon: Zap,
    title: "Smart Capture",
    description:
      "Embeddable forms that qualify in real time before a lead even submits. Less noise, more signal.",
  },
  {
    icon: ArrowRight,
    title: "Pipeline Ready",
    description:
      "Leads arrive pre-scored and prioritized, direct to your CRM. Your team closes, not qualifies.",
  },
] as const;

export function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
          Everything you need to convert faster
        </h2>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/20">
                <Icon className="h-5 w-5 text-indigo-400" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm text-slate-400">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Step 4: Run and confirm pass**

```bash
cd frontend && npx vitest run src/components/landing/__tests__/FeaturesSection.test.tsx
```

**Step 5: Commit**

```bash
git add frontend/src/components/landing/FeaturesSection.tsx \
        frontend/src/components/landing/__tests__/FeaturesSection.test.tsx
git commit -m "feat(landing): add FeaturesSection"
```

---

### Task 8: StatsSection

**Files:**
- Create: `frontend/src/components/landing/StatsSection.tsx`
- Create: `frontend/src/components/landing/__tests__/StatsSection.test.tsx`

**Step 1: Write the failing test**

```typescript
import { render, screen } from "@testing-library/react";
import { StatsSection } from "../StatsSection";

describe("StatsSection", () => {
  it("renders all 3 stats", () => {
    render(<StatsSection />);
    expect(screen.getByText(/10,000\+/)).toBeInTheDocument();
    expect(screen.getByText(/3×/)).toBeInTheDocument();
    expect(screen.getByText(/94%/)).toBeInTheDocument();
  });
});
```

**Step 2: Run and confirm fail**

```bash
cd frontend && npx vitest run src/components/landing/__tests__/StatsSection.test.tsx
```

**Step 3: Implement StatsSection**

Create `frontend/src/components/landing/StatsSection.tsx`:

```typescript
const STATS = [
  { value: "10,000+", label: "Leads captured" },
  { value: "3×", label: "Faster qualification" },
  { value: "94%", label: "Accuracy rate" },
] as const;

export function StatsSection() {
  return (
    <section className="border-y border-white/10 bg-white/[0.02] px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <dl className="grid grid-cols-1 gap-y-10 sm:grid-cols-3 sm:gap-x-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <dt className="text-4xl font-bold text-indigo-400">{value}</dt>
              <dd className="mt-2 text-sm text-slate-400">{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
```

**Step 4: Run and confirm pass**

```bash
cd frontend && npx vitest run src/components/landing/__tests__/StatsSection.test.tsx
```

**Step 5: Commit**

```bash
git add frontend/src/components/landing/StatsSection.tsx \
        frontend/src/components/landing/__tests__/StatsSection.test.tsx
git commit -m "feat(landing): add StatsSection"
```

---

### Task 9: PricingToggle (client component)

**Files:**
- Create: `frontend/src/components/landing/PricingToggle.tsx`
- Create: `frontend/src/components/landing/__tests__/PricingToggle.test.tsx`

**Step 1: Write the failing test**

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PricingToggle } from "../PricingToggle";

describe("PricingToggle", () => {
  it("renders monthly and annual options", () => {
    render(<PricingToggle />);
    expect(screen.getByRole("radio", { name: /monthly/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /annual/i })).toBeInTheDocument();
  });

  it("defaults to monthly", () => {
    render(<PricingToggle />);
    expect(screen.getByRole("radio", { name: /monthly/i })).toBeChecked();
  });

  it("switches to annual when clicked", async () => {
    render(<PricingToggle />);
    await userEvent.click(screen.getByRole("radio", { name: /annual/i }));
    expect(screen.getByRole("radio", { name: /annual/i })).toBeChecked();
    expect(screen.getByText(/save 20%/i)).toBeInTheDocument();
  });
});
```

**Step 2: Run and confirm fail**

```bash
cd frontend && npx vitest run src/components/landing/__tests__/PricingToggle.test.tsx
```

**Step 3: Implement PricingToggle**

Create `frontend/src/components/landing/PricingToggle.tsx`:

```typescript
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
```

**Step 4: Run and confirm pass**

```bash
cd frontend && npx vitest run src/components/landing/__tests__/PricingToggle.test.tsx
```

**Step 5: Commit**

```bash
git add frontend/src/components/landing/PricingToggle.tsx \
        frontend/src/components/landing/__tests__/PricingToggle.test.tsx
git commit -m "feat(landing): add PricingToggle client component"
```

---

### Task 10: PricingSection

**Files:**
- Create: `frontend/src/components/landing/PricingSection.tsx`
- Create: `frontend/src/components/landing/__tests__/PricingSection.test.tsx`

**Step 1: Write the failing test**

```typescript
import { render, screen } from "@testing-library/react";
import { PricingSection } from "../PricingSection";

describe("PricingSection", () => {
  it("renders section heading", () => {
    render(<PricingSection />);
    expect(
      screen.getByRole("heading", { name: /simple, transparent pricing/i })
    ).toBeInTheDocument();
  });

  it("renders all 3 tier names", () => {
    render(<PricingSection />);
    expect(screen.getByText(/^Free$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Pro$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Enterprise$/i)).toBeInTheDocument();
  });

  it("renders CTA for each tier", () => {
    render(<PricingSection />);
    expect(
      screen.getByRole("link", { name: /get started/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /start free trial/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /contact sales/i })
    ).toBeInTheDocument();
  });

  it("has pricing anchor id", () => {
    const { container } = render(<PricingSection />);
    expect(container.querySelector("#pricing")).not.toBeNull();
  });
});
```

**Step 2: Run and confirm fail**

```bash
cd frontend && npx vitest run src/components/landing/__tests__/PricingSection.test.tsx
```

**Step 3: Implement PricingSection**

Create `frontend/src/components/landing/PricingSection.tsx`:

```typescript
import Link from "next/link";
import { Check } from "lucide-react";
import { PricingToggle } from "./PricingToggle";

interface PricingTier {
  name: string;
  price: string;
  annualPrice: string;
  description: string;
  features: string[];
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

export function PricingSection() {
  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-slate-400">
            Start free. Upgrade when you need more.
          </p>
          <div className="mt-8 flex justify-center">
            <PricingToggle />
          </div>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {TIERS.map((tier) => (
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
                {tier.price}
                {tier.price !== "Custom" && (
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
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Step 4: Run and confirm pass**

```bash
cd frontend && npx vitest run src/components/landing/__tests__/PricingSection.test.tsx
```

**Step 5: Commit**

```bash
git add frontend/src/components/landing/PricingSection.tsx \
        frontend/src/components/landing/__tests__/PricingSection.test.tsx
git commit -m "feat(landing): add PricingSection with 3 tiers"
```

---

### Task 11: CtaBand

**Files:**
- Create: `frontend/src/components/landing/CtaBand.tsx`
- Create: `frontend/src/components/landing/__tests__/CtaBand.test.tsx`

**Step 1: Write the failing test**

```typescript
import { render, screen } from "@testing-library/react";
import { CtaBand } from "../CtaBand";

describe("CtaBand", () => {
  it("renders CTA headline", () => {
    render(<CtaBand />);
    expect(
      screen.getByRole("heading", { name: /start capturing smarter leads/i })
    ).toBeInTheDocument();
  });

  it("renders CTA link to /register", () => {
    render(<CtaBand />);
    const cta = screen.getByRole("link", { name: /get started free/i });
    expect(cta).toHaveAttribute("href", "/register");
  });
});
```

**Step 2: Run and confirm fail**

```bash
cd frontend && npx vitest run src/components/landing/__tests__/CtaBand.test.tsx
```

**Step 3: Implement CtaBand**

Create `frontend/src/components/landing/CtaBand.tsx`:

```typescript
import Link from "next/link";

export function CtaBand() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-r from-indigo-900/60 to-violet-900/60 border border-indigo-500/30 px-12 py-16 text-center backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Start capturing smarter leads today
        </h2>
        <p className="mt-4 text-slate-300">
          Join 10,000+ teams already using LeadForge AI
        </p>
        <Link
          href="/register"
          className="mt-8 inline-block rounded-lg bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-indigo-500 transition-colors"
        >
          Get started free
        </Link>
      </div>
    </section>
  );
}
```

**Step 4: Run and confirm pass**

```bash
cd frontend && npx vitest run src/components/landing/__tests__/CtaBand.test.tsx
```

**Step 5: Commit**

```bash
git add frontend/src/components/landing/CtaBand.tsx \
        frontend/src/components/landing/__tests__/CtaBand.test.tsx
git commit -m "feat(landing): add CtaBand"
```

---

## Phase 3: Assembly

### Task 12: Assemble page.tsx

**Files:**
- Modify: `frontend/src/app/page.tsx`

**Step 1: Update page.tsx**

Replace the contents of `frontend/src/app/page.tsx`:

```typescript
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { CtaBand } from "@/components/landing/CtaBand";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <PricingSection />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
```

**Step 2: Run full test suite**

```bash
cd frontend && npx vitest run
```

Expected: all tests pass.

**Step 3: Run type-check**

```bash
cd frontend && npm run type-check
```

Expected: no errors.

**Step 4: Commit**

```bash
git add frontend/src/app/page.tsx
git commit -m "feat(landing): assemble landing page from section components"
```

---

### Task 13: Final verification and push

**Step 1: Run full test suite one final time**

```bash
cd frontend && npx vitest run
```

Expected: all tests pass, no failures.

**Step 2: Run lint**

```bash
cd frontend && npm run lint
```

Fix any issues before proceeding.

**Step 3: Run type-check**

```bash
cd frontend && npm run type-check
```

Expected: exit 0.

**Step 4: Push to remote**

```bash
git push origin main
```

---

## Component File Map

```
frontend/src/
├── test/
│   └── setup.ts
├── app/
│   └── page.tsx                              ← updated
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                        ← new
│   │   ├── NavbarClient.tsx                  ← new
│   │   ├── Footer.tsx                        ← new
│   │   └── __tests__/
│   │       ├── Navbar.test.tsx               ← new
│   │       ├── NavbarClient.test.tsx         ← new
│   │       └── Footer.test.tsx               ← new
│   └── landing/
│       ├── HeroSection.tsx                   ← new
│       ├── FeaturesSection.tsx               ← new
│       ├── StatsSection.tsx                  ← new
│       ├── PricingToggle.tsx                 ← new
│       ├── PricingSection.tsx                ← new
│       ├── CtaBand.tsx                       ← new
│       └── __tests__/
│           ├── HeroSection.test.tsx          ← new
│           ├── FeaturesSection.test.tsx      ← new
│           ├── StatsSection.test.tsx         ← new
│           ├── PricingToggle.test.tsx        ← new
│           ├── PricingSection.test.tsx       ← new
│           └── CtaBand.test.tsx             ← new
└── vitest.config.ts                          ← new
```
