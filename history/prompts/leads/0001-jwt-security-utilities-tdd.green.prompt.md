---
id: 0001
title: JWT Security Utilities TDD
stage: green
date: 2026-02-20
surface: agent
model: claude-sonnet-4-6
feature: leads
branch: main
user: HomePC
command: implement Task 1 JWT security utilities
labels: ["jwt","security","tdd","fastapi","backend"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/app/core/security.py
  - backend/tests/unit/test_leads_security.py
tests:
  - backend/tests/unit/test_leads_security.py::test_decode_access_token_valid
  - backend/tests/unit/test_leads_security.py::test_decode_access_token_expired
  - backend/tests/unit/test_leads_security.py::test_decode_access_token_invalid
---

## Prompt

You are implementing Task 1: JWT security utilities for a FastAPI backend.

Files:
- Modify: backend/src/app/core/security.py
- Create: backend/tests/unit/test_leads_security.py

Steps: write failing tests, verify fail (ImportError on decode_access_token), implement decode_access_token + get_current_user in security.py, verify 3 tests pass, run full suite (expected 24 total), commit.

The existing security.py had hash_password, verify_password, create_access_token. Adding decode_access_token (sync, raises 401 HTTPException on expired/invalid/missing sub) and get_current_user (async FastAPI dependency extracting UUID from Bearer token header).

## Response snapshot

Implemented decode_access_token and get_current_user in backend/src/app/core/security.py.

- decode_access_token: decodes JWT, extracts sub as UUID, raises 401 HTTPException on JWTError or ValueError.
- get_current_user: async dependency reading Authorization header, strips "Bearer " prefix, delegates to decode_access_token.
- _credentials_exception: helper returning the 401 HTTPException to avoid linter unreachable-raise warnings.

Created backend/tests/unit/test_leads_security.py with 3 synchronous tests:
1. test_decode_access_token_valid — happy path, round-trips UUID through token.
2. test_decode_access_token_expired — uses negative timedelta, expects 401.
3. test_decode_access_token_invalid — passes malformed string, expects 401.

Verified: tests failed before implementation (ImportError), passed after (3/3). Full suite: 24/24 passed.

Committed as: feat(backend): add decode_access_token and get_current_user dependency (SHA: 2cf3fc9)

## Outcome

- Impact: JWT decode and FastAPI auth dependency are now available for all protected routes in the leads feature.
- Tests: 3 new tests PASS; full suite 24/24 green.
- Files: security.py extended (+32 lines), test_leads_security.py created (25 lines).
- Next prompts: Task 2 — Lead model + Alembic migration.
- Reflection: TDD red-green cycle executed cleanly; venv path required explicit .venv/bin/python invocation.

## Evaluation notes (flywheel)

- Failure modes observed: system python3 lacked sqlalchemy; resolved by using .venv/bin/python explicitly.
- Graders run and results (PASS/FAIL): pytest tests/unit/test_leads_security.py — PASS (3/3); pytest full suite — PASS (24/24).
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
