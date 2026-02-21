---
id: "0032"
title: Dashboard page with auth guard and leads table
stage: green
date: 2026-02-20
surface: agent
model: claude-sonnet-4-6
feature: dashboard-page
branch: main
user: HomePC
command: implement dashboard page (TDD green phase)
labels: ["dashboard","auth-guard","leads-table","tdd","green","next.js"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/src/app/(dashboard)/dashboard/page.tsx
  - frontend/src/app/(dashboard)/dashboard/__tests__/page.test.tsx
tests:
  - src/app/(dashboard)/dashboard/__tests__/page.test.tsx
---

## Prompt

You are implementing the dashboard page for LeadForge-AI. This is a Next.js 14 + TypeScript project.

## Context

The project has:
- Auth via `localStorage.setItem("access_token", token)` set on login/register
- Dark aesthetic (`#0a0a0f` background from globals.css)
- Existing `(dashboard)/leads/page.tsx` stub (leave it untouched — different route)
- Logo pattern: `<span className="font-bold text-white">LeadForge</span><span className="font-bold text-indigo-500">AI</span>`
- Test runner: `npx vitest run <file>` from `/mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend`
- Working directory for git: `/mnt/c/Users/HomePC/Desktop/CODE/frontend`

## Task: Dashboard page

Files:
- Create: `frontend/src/app/(dashboard)/dashboard/page.tsx`
- Create: `frontend/src/app/(dashboard)/dashboard/__tests__/page.test.tsx`

Steps: write failing tests, verify FAIL, implement page, verify PASS (4 tests), run full suite (51 total), commit.

## Response snapshot

1. Created test file at `frontend/src/app/(dashboard)/dashboard/__tests__/page.test.tsx` with 4 tests:
   - redirects to /login when no token
   - renders Leads heading when authenticated
   - renders Name, Email, Added column headers
   - clears token and redirects on sign out

2. Confirmed FAIL state (Cannot find module '../page') before implementation.

3. Created page implementation at `frontend/src/app/(dashboard)/dashboard/page.tsx`:
   - "use client" directive
   - isChecking state guard preventing unauthenticated content flash
   - useEffect redirecting to /login when no token
   - handleSignOut clearing localStorage token then pushing to /login
   - Nav with LeadForge + AI logo pattern and Sign out button (type="button")
   - Leads h1 heading
   - Table with Name, Email, Added th[scope="col"] headers
   - Empty state row ("No leads yet.")

4. Full test suite: 15 test files, 51 tests passed (47 existing + 4 new).

5. Committed as `e7e38ac`: feat(frontend): add dashboard page with auth guard and leads table

## Outcome

- Impact: Dashboard route is now functional with auth protection; users without a token are redirected to /login immediately on mount; authenticated users see a leads table scaffold.
- Tests: 51 passed (51), 0 failed — 4 new tests added for dashboard page
- Files: 2 files created — page.tsx (74 lines), page.test.tsx (65 lines)
- Next prompts: wire leads API, add pagination, add "New Lead" CTA button
- Reflection: isChecking pattern is idiomatic for preventing hydration flash on auth-guarded client pages; next/link mock in tests is required for JSDOM compatibility

## Evaluation notes (flywheel)

- Failure modes observed: none — all 4 tests passed on first implementation attempt
- Graders run and results (PASS/FAIL): vitest run — PASS (51/51)
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): add API integration test for leads fetch once backend endpoint is available
