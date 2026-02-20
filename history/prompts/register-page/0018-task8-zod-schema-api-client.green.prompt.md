---
id: "0018"
title: Task 8 Zod Schema and API Client
stage: green
date: 2026-02-20
surface: agent
model: claude-sonnet-4-6
feature: register-page
branch: main
user: HomePC
command: Task 8 implementation (Zod schema + API client)
labels: ["zod","schema","api-client","tdd","frontend","register"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/src/lib/__tests__/auth-schema.test.ts
  - frontend/src/lib/schemas/auth.ts
  - frontend/src/lib/api/client.ts
  - frontend/frontend/.env.local
tests:
  - src/lib/__tests__/auth-schema.test.ts (5 tests, all PASSED)
---

## Prompt

You are implementing Task 8 of the LeadForge-AI register page. TDD strictly.

Task 8: Zod schema + API client

Step 1: Check for existing stub files.
Step 2: Create the test file at frontend/src/lib/__tests__/auth-schema.test.ts.
Step 3: Run to verify FAIL (RED).
Step 4: Implement frontend/src/lib/schemas/auth.ts with registerSchema using z.object + .refine for password match.
Step 5: Run to verify PASS (GREEN) — 5 tests.
Step 6: Implement frontend/src/lib/api/client.ts with ApiRequestError class and typed apiPost<TBody, TResponse> function.
Step 7: Check if frontend/.env.local exists; if not create it with NEXT_PUBLIC_API_URL=http://localhost:8000.
Step 8: Commit frontend/src/lib/schemas/auth.ts, frontend/src/lib/api/client.ts, and the test file. Do NOT commit .env.local.

## Response snapshot

- Checked stubs: schemas/index.ts existed (empty export), api/client.ts existed (empty stub comment).
- Created test file at frontend/src/lib/__tests__/auth-schema.test.ts (5 test cases).
- RED confirmed: test run failed with transform error (module not found).
- Created frontend/src/lib/schemas/auth.ts with registerSchema (fullName min 2, email, password min 8, confirmPassword + refine for match).
- GREEN confirmed: 5/5 tests passed in 18ms.
- Replaced frontend/src/lib/api/client.ts stub with typed implementation: ApiRequestError class, apiPost<TBody, TResponse> generic function, FastAPI-compatible error detail parsing (string or array).
- Created frontend/frontend/.env.local with NEXT_PUBLIC_API_URL=http://localhost:8000.
- Committed 3 files (auth.ts, client.ts, test file). .env.local excluded.
- Commit hash: 6d6bde0

## Outcome

- Impact: Zod registerSchema and typed API client are now in place for use by the RegisterForm component (Task 9).
- Tests: 5/5 passed — accepts valid data, rejects short name, rejects invalid email, rejects short password, rejects mismatched passwords.
- Files: 3 committed (auth.ts schema, api client, test); .env.local created locally only.
- Next prompts: Task 9 — RegisterForm component wiring up registerSchema and apiPost.
- Reflection: Clean TDD cycle. RED confirmed before implementation. All 5 edge cases covered by schema.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): vitest — 5/5 PASS
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Add apiGet helper to client.ts when needed for authenticated routes
