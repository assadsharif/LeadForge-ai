---
id: "0010"
title: Tasks 3-4-5 NavbarClient Navbar Footer TDD
stage: green
date: 2026-02-20
surface: agent
model: claude-sonnet-4-6
feature: landing-page
branch: main
user: Asad Sharif
command: Implement Tasks 3, 4, and 5 for the LeadForge-AI landing page using TDD
labels: ["tdd","landing-page","navbar","footer","vitest","react","next.js"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/src/components/layout/NavbarClient.tsx
  - frontend/src/components/layout/__tests__/NavbarClient.test.tsx
  - frontend/src/components/layout/Navbar.tsx
  - frontend/src/components/layout/__tests__/Navbar.test.tsx
  - frontend/src/components/layout/Footer.tsx
  - frontend/src/components/layout/__tests__/Footer.test.tsx
tests:
  - src/components/layout/__tests__/NavbarClient.test.tsx (2 tests — PASS)
  - src/components/layout/__tests__/Navbar.test.tsx (3 tests — PASS)
  - src/components/layout/__tests__/Footer.test.tsx (3 tests — PASS)
---

## Prompt

Implement Tasks 3, 4, and 5 for the LeadForge-AI landing page using TDD. Working directory: /mnt/c/Users/HomePC/Desktop/CODE/frontend.

All frontend commands run from /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend.

## Task 3: NavbarClient

### Step 1: Create test file first
Create /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend/src/components/layout/__tests__/NavbarClient.test.tsx

### Step 2: Run test — expect FAIL

### Step 3: Create NavbarClient.tsx

### Step 4: Run test — expect PASS

### Step 5: Commit

---

## Task 4: Navbar

### Step 1: Create test file

### Step 2: Run test — expect FAIL

### Step 3: Create Navbar.tsx

### Step 4: Run test — expect PASS

### Step 5: Commit

---

## Task 5: Footer

### Step 1: Create test file

### Step 2: Run test — expect FAIL

### Step 3: Create Footer.tsx

### Step 4: Run test — expect PASS

### Step 5: Commit

---

After all 3 tasks, run the full test suite to confirm all pass.

Report: pass/fail counts and any test failures with error messages.

## Response snapshot

Implemented all three tasks following strict TDD (Red-Green-Commit cycle):

**Task 3 — NavbarClient:**
- Test file created first; RED confirmed (module not found).
- `NavbarClient.tsx` created: `"use client"` directive, scroll-aware `useEffect` toggling `scrolled` state, renders `<nav role="navigation">` wrapping children.
- GREEN: 2/2 tests pass. Committed as `feat(landing): add NavbarClient scroll-aware wrapper`.

**Task 4 — Navbar:**
- Test file created first; RED confirmed.
- `Navbar.tsx` created: server component composing `NavbarClient`, logo with `LeadForge` + `AI` spans, nav links list (`Features`, `Pricing`, `Docs`), CTA `Link` to `/register`.
- GREEN: 3/3 tests pass. Committed as `feat(landing): add Navbar component`.

**Task 5 — Footer:**
- Test file created first; RED confirmed.
- `Footer.tsx` created: `<footer role="contentinfo">`, logo, three link columns (`Product`, `Company`, `Legal`), copyright `© 2026 LeadForge AI. All rights reserved.`
- One test fix needed: `getByText(/LeadForge/i)` matched two elements (logo span + copyright line) — updated to `getAllByText(/LeadForge/i).length toBeGreaterThan(0)`.
- GREEN: 3/3 tests pass. Committed as `feat(landing): add Footer component`.

**Full suite result:** 3 test files, 8 tests — all PASS.

## Outcome

- Impact: Three layout components (NavbarClient, Navbar, Footer) fully implemented with tests; landing page shell is now navigable and has a complete header/footer structure.
- Tests: 8/8 passed across 3 test files.
- Files: 6 files created (3 implementation, 3 test).
- Next prompts: Task 6 (HeroSection), Task 7 (FeaturesSection), Task 8 (CTASection), then wiring the landing page layout.
- Reflection: Footer test needed a minor fix — `getByText` fails when the same regex matches multiple DOM nodes. Using `getAllByText` is the correct pattern when a text fragment intentionally appears more than once in a component.

## Evaluation notes (flywheel)

- Failure modes observed: Footer `getByText(/LeadForge/i)` matched both the logo span and the copyright line — resolved by switching to `getAllByText` with a `length > 0` assertion.
- Graders run and results (PASS/FAIL): vitest run — 8/8 PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Consider using `getByRole('img', {name: /LeadForge/i})` or an explicit `data-testid` on the logo for more precise logo assertions.
