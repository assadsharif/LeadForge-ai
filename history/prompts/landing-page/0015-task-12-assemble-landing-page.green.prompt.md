---
id: "0015"
title: Task 12 Assemble Landing Page
stage: green
date: 2026-02-20
surface: agent
model: claude-sonnet-4-6
feature: landing-page
branch: main
user: Asad Sharif
command: "Implement Task 12 for the LeadForge-AI landing page"
labels: ["landing-page","assembly","page.tsx","green"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/src/app/page.tsx
tests:
  - src/components/landing/__tests__/HeroSection.test.tsx (3 tests)
  - src/components/landing/__tests__/CtaBand.test.tsx (2 tests)
  - src/components/layout/__tests__/NavbarClient.test.tsx (2 tests)
  - src/components/layout/__tests__/Footer.test.tsx (3 tests)
  - src/components/landing/__tests__/StatsSection.test.tsx (1 test)
---

## Prompt

Implement Task 12 for the LeadForge-AI landing page. Working directory: /mnt/c/Users/HomePC/Desktop/CODE/frontend.

## Step 1: Replace page.tsx
Replace /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend/src/app/page.tsx with:

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

## Step 2: Run full test suite
Expected: all tests pass.

## Step 3: Run type-check
Expected: exit 0, no errors.

## Step 4: Commit

## Response snapshot

Replaced `frontend/src/app/page.tsx` with the full landing page assembly, importing and rendering Navbar, HeroSection, FeaturesSection, StatsSection, PricingSection, CtaBand, and Footer in the correct structural order.

Test results: 9 test files passed, 24 tests passed.

Type-check: No errors in `src/app/page.tsx`. Pre-existing vitest globals typing issues in test files (not caused by this change — present before this task).

Commit: b95c755 — "feat(landing): assemble landing page from section components" (1 file changed, 19 insertions, 3 deletions).

## Outcome

- Impact: Landing page root now renders all section components in correct document order — Navbar, HeroSection, FeaturesSection, StatsSection, PricingSection, CtaBand, Footer.
- Tests: 9 files / 24 tests — all passed.
- Files: frontend/src/app/page.tsx replaced (stub → full assembly).
- Next prompts: Integration/E2E smoke test of the full page; verify visual layout in browser.
- Reflection: Straightforward assembly task. Pre-existing type-check warnings in test files are unrelated to this change and were present before Task 12.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): vitest run — PASS (24/24)
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Add page-level integration test rendering HomePage and asserting all landmark regions are present.
