---
id: "0011"
title: Controlled PricingToggle Code Review Fixes
stage: green
date: 2026-02-20
surface: agent
model: claude-sonnet-4-6
feature: landing-page
branch: main
user: assadsharif
command: "fix 5 code review issues in the LeadForge-AI landing page"
labels: ["refactor","accessibility","controlled-component","aria","semantic-html","routing"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/src/components/landing/PricingToggle.tsx
  - frontend/src/components/landing/PricingClient.tsx
  - frontend/src/components/layout/Footer.tsx
  - frontend/src/components/layout/Navbar.tsx
  - frontend/src/components/landing/__tests__/PricingToggle.test.tsx
tests:
  - src/components/landing/__tests__/PricingToggle.test.tsx (3 tests — all pass)
  - src/components/layout/__tests__/Footer.test.tsx (3 tests — all pass)
  - src/components/layout/__tests__/Navbar.test.tsx (all pass)
  - Full suite: 24/24 tests pass
---

## Prompt

Fix 5 code review issues in the LeadForge-AI landing page. Working directory: /mnt/c/Users/HomePC/Desktop/CODE/frontend.

## Fix 1: PricingToggle — make it a fully controlled component (no internal state)

Read the current /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend/src/components/landing/PricingToggle.tsx then replace it with a controlled version accepting `value: BillingCycle` and `onChange: (cycle: BillingCycle) => void` props, using a `<fieldset>`/`<legend>` pattern for accessibility.

## Fix 2: PricingClient — own the state, pass value+onChange to PricingToggle, add aria-live

Replace PricingClient.tsx so it holds `useState<BillingCycle>("monthly")` and passes `value={cycle} onChange={setCycle}` to PricingToggle. Add `aria-live="polite" aria-atomic="true"` to each price paragraph.

## Fix 3: Footer — use h3 for section headings, use real route paths

Change `<p className="text-sm font-semibold text-white">{heading}</p>` to `<h3 ...>`. Restructure FOOTER_LINKS to include real hrefs: /features, /pricing, /changelog, /about, /blog, /careers, /privacy, /terms, /security.

## Fix 4: Navbar — use /docs for the Docs link

Change `{ label: "Docs", href: "#" }` to `{ label: "Docs", href: "/docs" }`.

After all edits, run vitest and type-check, then commit and push.

## Response snapshot

All four files were rewritten as specified. The existing PricingToggle tests called `render(<PricingToggle />)` with no props — incompatible with the new controlled API. The test file was also updated to use a `ControlledWrapper` that holds local state, exactly replicating what the old uncontrolled component did internally. This maintains full test intent while matching the new API contract.

Results:
- Tests: 9 test files, 24/24 pass
- Type-check: tsc --noEmit exits cleanly (0 errors)
- Commit: 52c4184 on main — "fix(landing): controlled PricingToggle, aria-live prices, semantic footer headings, real link paths"
- Push: success to origin/main (remote bypassed branch-protection rules)

## Outcome

- Impact: Improved accessibility (fieldset/legend radio group, aria-live price updates, semantic h3 headings), corrected stub hrefs to real routes, and properly separated controlled state from presentational component.
- Tests: 24/24 pass; PricingToggle test file updated to use ControlledWrapper pattern.
- Files: 5 files changed (4 component files + 1 test file); 67 insertions, 52 deletions.
- Next prompts: Consider adding PricingClient integration tests that verify price display changes on toggle click.
- Reflection: The controlled-component refactor required updating the existing tests — a predictable consequence of eliminating internal state. Using a ControlledWrapper in tests is the idiomatic pattern for testing controlled React components.

## Evaluation notes (flywheel)

- Failure modes observed: Initial test run failed (2/24) because tests called `<PricingToggle />` with no props after the component became fully controlled — `onChange` was undefined, causing a runtime TypeError on radio click. Fixed by updating tests to use ControlledWrapper.
- Graders run and results (PASS/FAIL): vitest run — PASS (24/24); tsc --noEmit — PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Add aria-label to the fieldset div or role="group" for broader screen-reader compatibility verification.
