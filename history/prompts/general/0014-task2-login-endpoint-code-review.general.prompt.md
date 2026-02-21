---
id: "0014"
title: Task 2 Login Endpoint Code Review
stage: general
date: 2026-02-20
surface: agent
model: claude-sonnet-4-6
feature: none
branch: main
user: HomePC
command: code quality review (POST /auth/login, commit 0b676ee)
labels: ["code-review","auth","ruff","quality"]
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

You are a code quality reviewer. Review the Task 2 implementation (POST /auth/login endpoint) for code quality.

## Commit to review
Commit SHA: 0b676ee ("feat(backend): add POST /auth/login endpoint")

## Files to review
1. `backend/src/app/api/v1/endpoints/auth.py` — the entire file (imports + register handler + new login handler)
2. `backend/tests/integration/test_auth_login.py` — all 4 tests

## Quality checks

**Import hygiene:**
- [ ] No duplicate import statements
- [ ] No unused imports (e.g., `hash_password` is used by register but NOT by login — is it still used?)
- [ ] Import order follows ruff I001 (stdlib, third-party, local — sorted within each group)

**Endpoint implementation:**
- [ ] `# noqa: B008` on `Depends(get_db)` line in login handler
- [ ] Return type annotation present (`-> LoginResponse`)
- [ ] No `hash_password` accidentally left unreferenced (it's used in register, should still be there)
- [ ] `verify_password` is imported and used correctly
- [ ] No hardcoded strings other than the 401 detail message

**Tests:**
- [ ] No unused imports in test file
- [ ] Import order follows ruff I001
- [ ] Tests are independent (no shared mutable state between tests)
- [ ] Mocks are scoped correctly (inside `with` blocks, not leaking)
- [ ] `_mock_user()` helper returns a fresh object each call (it's a function, not module-level)

**Ruff:**
```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  /home/asad/.local/bin/uv run ruff check src/app/api/v1/endpoints/auth.py tests/integration/test_auth_login.py 2>&1
```

Report: Approved OR Issues found (with severity).

## Response snapshot

Verdict: CONDITIONAL APPROVE — 2 ruff violations in auth.py, 0 violations in the test file.

Ruff output:
- I001 (auto-fixable): Import block un-sorted/un-formatted at auth.py:1 — the schemas import on line 7 must be parenthesised and split across multiple lines to comply with the 100-char line limit.
- E501: Line too long (105 > 100) at auth.py:7 — same root cause as I001; both resolved by a single `ruff --fix` pass.

All checklist items pass except the two ruff violations (same line, same fix):
- hash_password: still used in register() on line 28 — not orphaned.
- verify_password: imported and called correctly with short-circuit guard (user is None or not verify_password(...)).
- noqa: B008 present on Depends(get_db) in login() at line 46.
- Return type -> LoginResponse present at line 47.
- No hardcoded secrets; 401 detail is intentionally generic to prevent enumeration.
- Test file: 0 ruff violations; _mock_user() is a function returning a fresh object; all mocks are scoped inside with blocks; tests are fully independent.

Required action before merge: run `ruff check --fix src/app/api/v1/endpoints/auth.py` and commit the result.

## Outcome

- Impact: Two low-severity auto-fixable ruff violations identified in auth.py (I001 + E501 on line 7); test file is fully clean; no logic or security issues found.
- Tests: All 4 tests reviewed and approved — correct mock scoping, independent, no shared state.
- Files: auth.py (2 violations), test_auth_login.py (0 violations).
- Next prompts: Apply ruff --fix, commit formatting change, proceed to Task 3.
- Reflection: The violations share a single root cause (overlong import line 7) and require one mechanical fix with no logic impact.

## Evaluation notes (flywheel)

- Failure modes observed: none — straightforward linting review with clear ruff output.
- Graders run and results (PASS/FAIL): ruff check — FAIL (2 violations in auth.py), PASS (test file).
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): add ruff check as a pre-commit hook or CI step to catch E501/I001 before review stage.
