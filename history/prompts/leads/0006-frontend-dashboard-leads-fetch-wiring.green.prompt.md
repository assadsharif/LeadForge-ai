---
id: "0006"
title: frontend dashboard leads fetch wiring
stage: green
date: 2026-02-21
surface: agent
model: claude-sonnet-4-6
feature: leads
branch: main
user: Asad Sharif
command: /sp.implement
labels: ["frontend","dashboard","apiGet","TDD","leads","vitest"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/src/lib/api/client.ts
  - frontend/src/app/(dashboard)/dashboard/page.tsx
  - frontend/src/app/(dashboard)/dashboard/__tests__/page.test.tsx
tests:
  - src/app/(dashboard)/dashboard/__tests__/page.test.tsx (8 tests — all pass)
---

## Prompt

You are implementing Task 5 of the Leads API feature for LeadForge-AI. Tasks 1-4 (backend) are already complete with 30/30 tests passing. Your job is the frontend wiring.

Context:
- Project root: /mnt/c/Users/HomePC/Desktop/CODE/frontend
- Frontend dir: /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend

The dashboard page currently has a static "No leads yet." state with no API call. You will:
1. Add apiGet<T> to frontend/src/lib/api/client.ts
2. Update frontend/src/app/(dashboard)/dashboard/page.tsx to fetch leads
3. Update frontend/src/app/(dashboard)/dashboard/__tests__/page.test.tsx with 4 new tests

[Full step-by-step spec provided with exact file contents and TDD workflow instructions]

## Response snapshot

Implemented Task 5 in full TDD red-green-refactor order:

RED phase: Wrote 4 new failing tests covering loading state, lead rendering, non-401 error banner, and 401 redirect/token-clear. Root cause of initial failure: vi.mock hoisting made the locally-defined ApiRequestError class unavailable at factory time. Fixed by using vi.hoisted() to create both mockApiGet and ApiRequestError before the factory runs.

GREEN phase:
- Added apiGet<TResponse>(path, token) to client.ts — GET with Bearer auth, same error-handling shape as apiPost.
- Rewrote dashboard page.tsx with: Lead type, isLoading/error/leads state, fetchLeads wrapped in useCallback (stable ref prevents infinite loop), second useEffect triggered after auth check, role="alert" error banner, Loading... row during fetch, 401 path clears token and redirects.

All 8 dashboard tests pass. Login and client test suites confirmed no regressions in isolation.

Committed as: feat(frontend): wire dashboard to GET /api/v1/leads with loading/error states (18e818d)

## Outcome

- Impact: Dashboard now fetches real leads from GET /api/v1/leads with JWT Bearer auth; shows loading state, renders rows, surfaces error alerts, and handles 401 by signing out automatically.
- Tests: 8/8 dashboard tests pass (4 pre-existing + 4 new); login (5/5) and NavbarClient (2/2) confirmed green in isolation.
- Files: 3 files modified — client.ts (+23 lines), page.tsx (+79 lines net), page.test.tsx (+78 lines net).
- Next prompts: integration / e2e test with real backend; add lead creation UI (Task 6 if planned); deploy.
- Reflection: vi.hoisted() is the correct pattern for making mock-factory-internal classes available to test body; the original spec's example used a class defined outside the factory which would fail under vitest hoisting — worth noting for future test authors.

## Evaluation notes (flywheel)

- Failure modes observed: vi.mock hoisting prevents module-scope class declarations from being referenced inside the factory — must use vi.hoisted() instead.
- Graders run and results (PASS/FAIL): vitest dashboard suite — PASS (8/8); vitest LoginForm — PASS (5/5); vitest NavbarClient — PASS (2/2).
- Prompt variant (if applicable): sdd-implement agent, green stage, explicit TDD workflow.
- Next experiment: run full suite in a single vitest worker (--pool=forks or --maxWorkers=1) to eliminate WSL2 environment-contention flakiness on combined runs.
