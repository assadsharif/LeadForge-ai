---
id: "0013"
title: Task 3 Auth Pydantic schemas
stage: green
date: 2026-02-20
surface: agent
model: claude-sonnet-4-6
feature: register-page
branch: main
user: asad
command: implement Task 3 auth Pydantic schemas TDD
labels: ["tdd","pydantic","schemas","auth","backend","register-page"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/app/schemas/auth.py
  - backend/tests/unit/test_auth_schemas.py
tests:
  - tests/unit/test_auth_schemas.py::test_register_request_valid
  - tests/unit/test_auth_schemas.py::test_register_request_invalid_email
  - tests/unit/test_auth_schemas.py::test_register_request_short_password
---

## Prompt

You are implementing Task 3 of the LeadForge-AI register page. TDD strictly.

**Context:**
- Git root: /mnt/c/Users/HomePC/Desktop/CODE/frontend
- Backend: /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend (FastAPI, uv)
- Run commands: /home/asad/.local/bin/uv run <cmd> from backend dir
- pytest pythonpath = ["src"] is already set in pyproject.toml
- passlib and python-jose are already installed

**Task 3: Auth Pydantic schemas**

Step 1: Write failing tests.
Create backend/tests/unit/test_auth_schemas.py with three tests:
- test_register_request_valid
- test_register_request_invalid_email
- test_register_request_short_password

Step 2: Run to verify FAIL.

Step 3: Create backend/src/app/schemas/auth.py with RegisterRequest, UserResponse, RegisterResponse.

Step 4: Run to verify PASS — expected: 3 tests PASSED.

Step 5: Commit with message "feat(backend): add auth Pydantic schemas".

Report test output and commit hash.

## Response snapshot

Implemented Task 3 following strict TDD:

1. Wrote failing tests at backend/tests/unit/test_auth_schemas.py — confirmed ModuleNotFoundError (RED).
2. Created backend/src/app/schemas/auth.py with RegisterRequest (EmailStr, password min-length validator, full_name min-length validator), UserResponse, and RegisterResponse.
3. Re-ran tests — all 3 PASSED in 1.14s (GREEN).
4. Committed as feat(backend): add auth Pydantic schemas — hash cac589d.

Test output:
```
tests/unit/test_auth_schemas.py::test_register_request_valid PASSED      [ 33%]
tests/unit/test_auth_schemas.py::test_register_request_invalid_email PASSED [ 66%]
tests/unit/test_auth_schemas.py::test_register_request_short_password PASSED [100%]

3 passed in 1.14s
```

## Outcome

- Impact: Auth Pydantic schemas now enforce email validity and minimum password length (8 chars) at the boundary layer; downstream endpoints and the user repository can rely on these contracts.
- Tests: 3 passed, 0 failed.
- Files: 2 created — backend/src/app/schemas/auth.py, backend/tests/unit/test_auth_schemas.py.
- Next prompts: Task 4 (security utilities: hash_password, create_access_token).
- Reflection: TDD cycle completed cleanly; RED confirmed by ImportError, GREEN confirmed by all 3 passing.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): pytest — PASS (3/3)
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): add test for full_name < 2 chars validation
