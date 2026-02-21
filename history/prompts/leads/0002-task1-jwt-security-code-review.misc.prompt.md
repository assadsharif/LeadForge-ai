---
id: 0002
title: Task 1 JWT Security Code Review
stage: misc
date: 2026-02-21
surface: agent
model: claude-sonnet-4-6
feature: leads
branch: main
user: HomePC
command: Review the code quality of Task 1: JWT security utilities
labels: ["code-review","jwt","security","ruff","b904","fastapi","backend"]
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

Review the code quality of Task 1: JWT security utilities.

WHAT_WAS_IMPLEMENTED:
- Added `decode_access_token(token: str) -> uuid.UUID` to security.py — decodes HS256 JWT, extracts sub UUID, raises HTTPException 401 for expired/invalid/missing-sub
- Added `get_current_user(authorization: str | None = Header(default=None)) -> uuid.UUID` async FastAPI dependency — validates Bearer header, delegates to decode_access_token
- Added `_credentials_exception()` private helper returning the standard 401 HTTPException
- Created backend/tests/unit/test_leads_security.py with 3 synchronous unit tests

PLAN_OR_REQUIREMENTS: Task 1 from docs/plans/2026-02-20-leads-api-implementation.md

BASE_SHA: 0bf36ef
HEAD_SHA: 2cf3fc9

DESCRIPTION: JWT decode + FastAPI dependency for protecting the GET /api/v1/leads endpoint. All existing security functions (hash_password, verify_password, create_access_token) preserved unchanged.

Files changed:
- backend/src/app/core/security.py
- backend/tests/unit/test_leads_security.py

## Response snapshot

Verdict: Functionally correct and production-quality. Full plan alignment with zero deviations. One Important linter issue introduced.

Plan alignment: all 7 planned requirements implemented exactly. Diff is strictly additive — no existing lines modified.

Tests: 3/3 PASS. Full suite 24/24 PASS (matches plan prediction of 24). No regressions.

Issues found:

IMPORTANT — Ruff B904 violation at backend/src/app/core/security.py line 52:
  `raise _credentials_exception()` inside `except (JWTError, ValueError):` block
  must be `raise _credentials_exception() from None`.
  Confirmed introduced by this commit (BASE SHA passed ruff B904 cleanly).
  Will block Task 6 final ruff check (`ruff check src/` is called with exit-0 expectation).

Fix: change line 52 to `raise _credentials_exception() from None`.
The `from None` form is semantically correct — the original exception should be suppressed to avoid leaking JWT internals.

SUGGESTION — get_current_user has no unit test (missing-header and non-Bearer-prefix paths).
Acceptable per plan (only 3 tests specified; integration tests in Task 4 cover these paths).

Code quality strengths: _credentials_exception() as a function (not a constant) is correct pattern for FastAPI dependency inspection; Header(default=None) correctly prevents 422 on missing auth header; except (JWTError, ValueError) covers both failure modes; sub is None guard before uuid.UUID() prevents TypeError; type annotations complete.

Mypy: 23 errors across src/ are all pre-existing (missing stubs for jose/passlib, import-untyped). Zero new mypy errors introduced.

## Outcome

- Impact: One Important ruff B904 violation must be fixed before Task 6 final verification step.
- Tests: 3/3 new tests PASS; full suite 24/24 green; no regressions.
- Files: security.py reviewed at HEAD SHA 2cf3fc9; test_leads_security.py reviewed.
- Next prompts: Fix B904 in security.py (one-word change), then proceed to Task 2 — Lead model + Alembic migration.
- Reflection: Implementation quality is high; single linter gap is a one-word fix that is easy to resolve before the final verification task.

## Evaluation notes (flywheel)

- Failure modes observed: B904 from `raise` inside `except` without explicit chaining — common omission when raising a new exception from a caught one.
- Graders run and results (PASS/FAIL): pytest tests/unit/test_leads_security.py PASS (3/3); pytest full suite PASS (24/24); ruff check src/ FAIL (1 error B904 in security.py); mypy src/ pre-existing failures only.
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Apply `from None` fix and re-run ruff to confirm clean exit.
