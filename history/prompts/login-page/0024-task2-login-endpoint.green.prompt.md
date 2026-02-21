---
id: "0024"
title: Task 2 Login Endpoint Implementation
stage: green
date: 2026-02-20
surface: agent
model: claude-sonnet-4-6
feature: login-page
branch: main
user: asad
command: implement Task 2 login endpoint
labels: ["login","fastapi","endpoint","integration-test","tdd"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/app/api/v1/endpoints/auth.py
  - backend/tests/integration/test_auth_login.py
tests:
  - tests/integration/test_auth_login.py::test_login_success
  - tests/integration/test_auth_login.py::test_login_wrong_password
  - tests/integration/test_auth_login.py::test_login_unknown_email
  - tests/integration/test_auth_login.py::test_login_validation_error
---

## Prompt

You are implementing Task 2 of the login page plan for LeadForge-AI. This is a FastAPI + Next.js project.

## Context

Already done in Task 1:
- `backend/src/app/schemas/auth.py` now has `LoginRequest` and `LoginResponse = RegisterResponse`
- `backend/src/app/core/security.py` has `verify_password`, `hash_password`, `create_access_token`
- `backend/src/app/repositories/user_repository.py` has `get_user_by_email`, `create_user`
- `backend/tests/integration/test_auth_register.py` exists — follow its patterns

Current `backend/src/app/api/v1/endpoints/auth.py` top of file includes existing register endpoint.

Task 2: Login endpoint — create failing tests first (TDD red→green), then implement POST /auth/login endpoint returning 200 with access_token on success, 401 for unknown email or wrong password (same message to prevent enumeration), 422 for validation errors.

## Response snapshot

Implemented Task 2 in full TDD red→green cycle:

1. Wrote `backend/tests/integration/test_auth_login.py` with 4 tests covering success, wrong password, unknown email, and validation error.
2. Confirmed tests failed with 404/assertion errors (route not yet registered).
3. Extended existing import lines in `auth.py`:
   - Added `verify_password` to the security import line.
   - Added `LoginRequest, LoginResponse` to the schemas import line.
4. Added `POST /login` handler after register handler: looks up user by email, returns 401 with identical message for both unknown email and wrong password (prevents enumeration), returns `LoginResponse` with token and user on success.
5. Confirmed 4/4 login tests pass, full suite 21/21 green.
6. Committed as `0b676ee feat(backend): add POST /auth/login endpoint`.

## Outcome

- Impact: POST /api/v1/auth/login endpoint live; 401 with same detail for both unknown email and wrong password prevents user enumeration.
- Tests: 21 passed, 0 failed (full backend suite). 4 new integration tests for login.
- Files: auth.py (2 import lines extended, 1 new handler added), test_auth_login.py (created, 4 tests).
- Next prompts: Task 3 (loginSchema frontend Zod validation), Task 4 (LoginForm component), Task 5 (login page shell), Task 6 (final verification and push).
- Reflection: TDD flow confirmed — tests failed on missing route (404), then all passed after implementation. Self-review checklist satisfied: verify_password on existing import line, LoginRequest/LoginResponse on existing import line, noqa B008 on Depends(get_db), identical 401 detail for both failure branches.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): pytest full suite PASS (21/21)
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): none
