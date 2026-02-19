---
id: "0013"
title: Tasks 9 10 11 PricingToggle PricingSection CtaBand
stage: green
date: 2026-02-20
surface: agent
model: claude-sonnet-4-6
feature: landing-page
branch: main
user: HomePC
command: "Implement Tasks 9, 10, and 11 for the LeadForge-AI landing page using TDD"
labels: ["tdd","landing-page","pricing","cta","vitest","react"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/src/components/landing/PricingToggle.tsx
  - frontend/src/components/landing/__tests__/PricingToggle.test.tsx
  - frontend/src/components/landing/PricingSection.tsx
  - frontend/src/components/landing/__tests__/PricingSection.test.tsx
  - frontend/src/components/landing/CtaBand.tsx
  - frontend/src/components/landing/__tests__/CtaBand.test.tsx
tests:
  - src/components/landing/__tests__/PricingToggle.test.tsx (3 tests)
  - src/components/landing/__tests__/PricingSection.test.tsx (4 tests)
  - src/components/landing/__tests__/CtaBand.test.tsx (2 tests)
---

## Prompt

Implement Tasks 9, 10, and 11 for the LeadForge-AI landing page using TDD. Working directory: /mnt/c/Users/HomePC/Desktop/CODE/frontend.

Task 9: PricingToggle — radio toggle between monthly/annual billing cycles, shows "Save 20%" when annual is selected. Client component with useState.

Task 10: PricingSection — renders 3 pricing tiers (Free, Pro, Enterprise) with per-tier CTAs, anchored at #pricing, embeds PricingToggle.

Task 11: CtaBand — full-width CTA band with headline "Start capturing smarter leads today" and a /register link "Get started free".

Each task follows Red → Green → Commit TDD cycle.

## Response snapshot

Implemented all three components following strict TDD:

**Task 9 — PricingToggle (3 tests, PASS):**
- Red: test file written, component missing → transform error confirmed
- Green: PricingToggle.tsx created with useState, radio inputs (sr-only), conditional "Save 20%" span
- Committed: feat(landing): add PricingToggle client component

**Task 10 — PricingSection (4 tests, PASS):**
- Red: test file written, component missing → transform error confirmed
- Green: PricingSection.tsx created with TIERS constant, section#pricing anchor, embedded PricingToggle, three Link CTAs
- Committed: feat(landing): add PricingSection with 3 tiers

**Task 11 — CtaBand (2 tests, PASS):**
- Red: test file written, component missing → transform error confirmed
- Green: CtaBand.tsx created with h2 heading and /register Link
- Committed: feat(landing): add CtaBand

**Full suite: 9 test files, 24 tests — all PASS.**

## Outcome

- Impact: Landing page now has pricing toggle interactivity, a full 3-tier pricing section, and a closing CTA band. All 3 components are tested and committed.
- Tests: 24/24 passing across 9 test files (3 new files added this session: 9 new tests total)
- Files: 6 files created (3 components + 3 test files)
- Next prompts: Task 12+ (integrate components into landing page layout, wire PricingToggle state to PricingSection prices)
- Reflection: Red phase confirmed by Vite transform errors (missing module), not assertion failures — consistent with prior tasks in this session.

## Evaluation notes (flywheel)

- Failure modes observed: none — all three Red phases confirmed correctly, all Green phases passed on first implementation
- Graders run and results (PASS/FAIL): vitest run — PASS (3+4+2 tests); full suite — PASS (24 tests)
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): wire PricingToggle onChange into PricingSection to dynamically swap displayed prices
