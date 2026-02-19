---
id: "0014"
title: Fix PricingToggle radiogroup and wire billing toggle
stage: green
date: 2026-02-20
surface: agent
model: claude-sonnet-4-6
feature: landing-page
branch: main
user: HomePC
command: fix PricingToggle radiogroup accessibility and wire billing toggle to price display
labels: ["fix","accessibility","pricing","refactor","client-component"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/src/components/landing/PricingToggle.tsx
  - frontend/src/components/landing/PricingClient.tsx
  - frontend/src/components/landing/PricingSection.tsx
tests:
  - src/components/landing/__tests__/PricingToggle.test.tsx
---

## Prompt

Fix two issues in the PricingToggle and PricingSection for LeadForge-AI.

Fix 1: PricingToggle.tsx — move "Save 20%" badge outside radiogroup, remove redundant aria-label.
The "Save 20%" span should be rendered OUTSIDE the role="radiogroup" div. Also remove the
`aria-label={option}` from the `<input>` since the wrapping `<label>` already provides the
accessible name.

Fix 2: PricingSection — wire up billing toggle to price display.
The current PricingSection renders PricingToggle but doesn't connect its onChange, so the annual
price ($39) is never shown. Solution: Create a new client component PricingClient.tsx that owns
billing state and renders both toggle + tier grid. The outer PricingSection shell stays a server
component with just the section/heading markup.

## Response snapshot

Applied all three changes:

1. PricingToggle.tsx: Wrapped the entire return in an outer `div.inline-flex.flex-col` so the
   `role="radiogroup"` div contains only the radio labels. Moved the "Save 20%" conditional span
   below the radiogroup div. Removed `aria-label={option}` from each `<input>` element.

2. PricingClient.tsx (new): Client component marked `"use client"` that owns `cycle` state via
   `useState<BillingCycle>("monthly")`. Renders `<PricingToggle onChange={setCycle} />` and the
   full tier grid, computing `displayPrice` from `cycle` at render time.

3. PricingSection.tsx: Stripped all tier data, state, and toggle markup. Now a lean server
   component that renders only the section/heading markup and delegates to `<PricingClient />`.

All 24 tests passed (9 test files). Committed as ed22dec.

## Outcome

- Impact: Billing toggle is now correctly wired — switching to annual shows $39 for Pro. The
  "Save 20%" badge no longer violates the radiogroup semantics. Redundant aria-label removed.
- Tests: 24 passed (9 files) — no regressions.
- Files: 3 modified/created (PricingToggle.tsx, PricingClient.tsx, PricingSection.tsx).
- Next prompts: Add PricingClient/PricingSection integration tests; verify annual price renders.
- Reflection: Extracting the client boundary into PricingClient is the correct RSC pattern and
  keeps PricingSection stateless/server-renderable.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): vitest run — PASS (24/24)
- Prompt variant (if applicable): null
- Next experiment: add a PricingClient integration test that asserts displayPrice changes on toggle
