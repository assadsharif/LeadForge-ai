---
id: "0011"
title: Fix review 3 — CORS middleware, IntegrityError 409, login schema
stage: green
date: 2026-02-22
surface: agent
model: claude-sonnet-4-6
feature: leads
branch: main
user: assadsharif
command: "fix the critical and moderate issues"
labels: ["fix","cors","integrity-error","login-schema","ruff","tests"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/app/main.py
  - backend/src/app/services/lead_service.py
  - backend/tests/unit/test_lead_service.py
  - backend/migrations/versions/0001_create_users_table.py
  - backend/migrations/versions/0003_lead_email_unique_per_user.py
  - frontend/src/lib/schemas/auth.ts
  - frontend/src/lib/__tests__/auth-schema.test.ts
  - frontend/src/app/(dashboard)/dashboard/__tests__/AddLeadModal.test.tsx
tests:
  - backend/tests/unit/test_lead_service.py::test_create_lead_integrity_error_raises_409
  - frontend/src/lib/__tests__/auth-schema.test.ts (updated login schema tests)
  - frontend/src/app/(dashboard)/dashboard/__tests__/AddLeadModal.test.tsx (added next/navigation mock)
---

## Prompt

fix the critical and moderate issues

(Third round of holistic code review fixes. Review found:
- 🔴 CORSMiddleware never added — CORS_ORIGINS config unused
- 🟡 Race condition on duplicate-email check → unhandled IntegrityError → 500
- 🟡 Login schema min(8) on password at login — should be min(1))

## Response snapshot

Applied all three critical/moderate fixes:

1. **main.py** — Added `CORSMiddleware` using `settings.CORS_ORIGINS`. Fixed `lifespan` return type to `AsyncGenerator[None, None]` and fixed stdlib import order (ruff auto-fix).

2. **lead_service.py** — Wrapped `repo_create_lead` call in `try/except IntegrityError` in `create_lead`. Race-condition concurrent duplicates that bypass the pre-check now surface as 409 instead of 500. Added corresponding unit test `test_create_lead_integrity_error_raises_409`.

3. **auth.ts** — Changed `loginSchema` password from `min(8, ...)` to `min(1, "Password is required")` so users with passwords shorter than 8 characters (valid per backend rules) can log in. Updated tests: replaced "rejects short password" with "rejects empty password" + added "accepts short password (validation is backend responsibility at login)".

4. **AddLeadModal.test.tsx** — Added `vi.mock("next/navigation", ...)` to fix 5 test failures caused by `useRouter` being called without the app router mounted in jsdom.

5. **Ruff auto-fix** — Sorted imports in `migrations/0001` and removed unused `import sqlalchemy as sa` from `migrations/0003`.

Results: ruff clean, ESLint clean, 48 backend tests pass, 62 frontend tests pass. Committed and pushed to origin/main.

## Outcome

- Impact: CORS now functional for browser clients; duplicate lead race condition returns 409 not 500; login unblocked for short-password users; all tests green
- Tests: 48 backend + 62 frontend = 110 total, all passing
- Files: 8 files modified
- Next prompts: further holistic review or new feature work
- Reflection: Adding useRouter to AddLeadModal required a corresponding test mock — a pattern to remember when adding Next.js hooks to components that have existing tests

## Evaluation notes (flywheel)

- Failure modes observed: Missing `vi.mock("next/navigation")` caused all AddLeadModal tests to crash with "invariant expected app router to be mounted"
- Graders run and results (PASS/FAIL): ruff PASS, ESLint PASS, pytest PASS, vitest PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Consider adding a shared test utility for mocking next/navigation to avoid repetition across test files
