---
id: "0019"
title: Fix Ruff B904 decode_access_token from None
stage: general
date: 2026-02-21
surface: agent
model: claude-sonnet-4-6
feature: none
branch: main
user: HomePC
command: fix ruff B904 security.py line 52
labels: ["linter","ruff","security","bug-fix"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/app/core/security.py
tests:
  - tests/unit/test_leads_security.py::test_decode_access_token_expired
  - tests/unit/test_leads_security.py::test_decode_access_token_invalid
  - tests/unit/test_leads_security.py (3 total)
---

## Prompt

Fix a Ruff B904 linter violation in `/mnt/c/Users/HomePC/Desktop/CODE/frontend/backend/src/app/core/security.py`.

The issue is on line 52 inside `decode_access_token`:

**Current code:**
```python
    except (JWTError, ValueError):
        raise _credentials_exception()
```

**Required fix:**
```python
    except (JWTError, ValueError):
        raise _credentials_exception() from None
```

Ruff rule B904 requires that within an `except` clause, exceptions must be raised with `raise ... from err` or `raise ... from None`. Using `from None` here is semantically correct — it suppresses the chained exception context so JWT decode internals aren't propagated to callers who only see an opaque 401.

After making the fix:

1. Verify ruff passes:
```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  .venv/bin/python -m ruff check src/app/core/security.py
```
Expected: no output (clean).

2. Run the security tests to confirm nothing broke:
```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  .venv/bin/python -m pytest tests/unit/test_leads_security.py -v 2>&1 | tail -10
```
Expected: 3 tests PASS.

3. Commit the fix:
```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend && \
  git add backend/src/app/core/security.py && \
  git commit -m "fix(backend): add 'from None' to suppress exception chain in decode_access_token"
```

Report: the fix made, ruff output, test results, and commit SHA.

## Response snapshot

Applied single-line edit to `backend/src/app/core/security.py` line 52, changing `raise _credentials_exception()` to `raise _credentials_exception() from None`.

- Ruff check: `All checks passed!` (no output, clean).
- Tests: 3 passed in 0.60s (`test_decode_access_token_expired`, `test_decode_access_token_invalid`, plus one more).
- Commit SHA: `d33cc98` — `fix(backend): add 'from None' to suppress exception chain in decode_access_token`.

## Outcome

- Impact: Resolves Ruff B904 violation; suppresses JWT internal exception chain from callers, improving security opacity of 401 responses.
- Tests: 3 passed, 0 failed.
- Files: 1 file modified (backend/src/app/core/security.py).
- Next prompts: Continue with remaining task items (Task 2 onward).
- Reflection: Minimal, precise single-token change. No unrelated edits. Ruff and tests both green immediately.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): ruff PASS, pytest PASS
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): none needed
