---
id: "0012"
title: Fix ruff import order and test rename
stage: general
date: 2026-02-20
surface: agent
model: claude-sonnet-4-6
feature: none
branch: main
user: HomePC
command: "fix code quality issues in backend/tests/unit/test_login_schemas.py"
labels: ["ruff","linting","test-quality","import-order","refactor"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/tests/unit/test_login_schemas.py
tests:
  - tests/unit/test_login_schemas.py::test_login_request_valid
  - tests/unit/test_login_schemas.py::test_login_request_invalid_email
  - tests/unit/test_login_schemas.py::test_login_request_empty_password
---

## Prompt

Fix two code quality issues in `backend/tests/unit/test_login_schemas.py`:

**Issue 1 (Important):** Import order violates ruff `I001`. Fix by reordering:
```python
import pytest

from pydantic import ValidationError

from app.schemas.auth import LoginRequest
```

**Issue 2 (Minor):** Rename `test_login_request_missing_password` → `test_login_request_empty_password` since the test passes `password=""` (empty string), not an absent field.

Steps:
1. Read the file `/mnt/c/Users/HomePC/Desktop/CODE/frontend/backend/tests/unit/test_login_schemas.py`
2. Apply both fixes
3. Run ruff to confirm clean
4. Run tests to confirm still passing
5. Amend the commit (it's the last commit)

Report: ruff output, test results, commit SHA.

## Response snapshot

Read the file, applied both fixes, then discovered ruff's actual canonical ordering requires `import pytest` and `from pydantic import ValidationError` in the same block (no blank line between stdlib/third-party), then a blank line before local imports. Used `ruff check --fix` to auto-apply the canonical order, then verified manually. Applied test rename independently via Write tool.

**Final file state:**
```python
import pytest
from pydantic import ValidationError

from app.schemas.auth import LoginRequest


def test_login_request_valid() -> None: ...
def test_login_request_invalid_email() -> None: ...
def test_login_request_empty_password() -> None: ...
```

**Ruff output:** `All checks passed!`
**Test output:** `3 passed, 1 warning in 0.63s`
**Commit SHA:** `ad4ba81` — `feat(backend): add LoginRequest schema and LoginResponse alias`

## Outcome

- Impact: Test file now passes ruff I001 import-sort check; test name accurately reflects behavior (empty string vs missing field).
- Tests: 3 passed, 1 warning (unrelated passlib deprecation in Python 3.12).
- Files: backend/tests/unit/test_login_schemas.py (modified; 1 file in amended commit).
- Next prompts: Continue with Task 2 (Login endpoint) or Task 3 (loginSchema).
- Reflection: Ruff's isort grouping treats `import pytest` and `from pydantic import ValidationError` as the same section (third-party), so they share a block. Blank-line separation between third-party groups is not I001-compliant. `--fix` auto-resolved the canonical form.

## Evaluation notes (flywheel)

- Failure modes observed: Initial manual reorder added a blank line between `import pytest` and `from pydantic import ValidationError`, which ruff still rejected. Required `--fix` to determine the canonical layout.
- Graders run and results (PASS/FAIL): ruff I001 — PASS; pytest 3/3 — PASS
- Prompt variant (if applicable): null
- Next experiment: Pre-run `ruff check --diff` before manual edits to preview expected layout.
