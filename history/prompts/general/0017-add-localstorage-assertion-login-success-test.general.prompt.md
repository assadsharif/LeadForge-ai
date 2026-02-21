---
id: "0017"
title: Add localStorage assertion to LoginForm success test
stage: general
date: 2026-02-20
surface: agent
model: claude-sonnet-4-6
feature: none
branch: main
user: HomePC
command: inline edit + vitest run + git commit --amend
labels: ["testing","auth","localStorage","vitest"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/src/components/auth/__tests__/LoginForm.test.tsx
tests:
  - src/components/auth/__tests__/LoginForm.test.tsx (5 tests, all passed)
---

## Prompt

Add a missing localStorage assertion to the success test in `frontend/src/components/auth/__tests__/LoginForm.test.tsx`.

The success test verifies redirect but doesn't assert the token was stored. Add the localStorage check.

Steps:
1. Read `frontend/src/components/auth/__tests__/LoginForm.test.tsx`
2. In the test "submits to API, stores token, and redirects on success", after the `await waitFor(...)` block that checks `mockPush`, add:
```typescript
expect(localStorage.getItem("access_token")).toBe("test-jwt");
```
3. Run tests to confirm still passing:
```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && \
  npx vitest run src/components/auth/__tests__/LoginForm.test.tsx 2>&1 | tail -10
```
4. Amend the last commit:
```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend && \
  git add frontend/src/components/auth/__tests__/LoginForm.test.tsx && \
  git commit --amend --no-edit
```

Report: test results, commit SHA.

## Response snapshot

Added `expect(localStorage.getItem("access_token")).toBe("test-jwt");` immediately after the `waitFor` block in the "submits to API, stores token, and redirects on success" test. All 5 tests passed. Amended commit SHA: `0317339171f72b4d08f2590fc87f64934d704c03`.

## Outcome

- Impact: The success test now fully covers the token-storage side-effect, preventing regressions where the redirect works but localStorage write is silently dropped.
- Tests: 5 passed (1 test file) — LoginForm > submits to API, stores token, and redirects on success now asserts both redirect and token storage.
- Files: frontend/src/components/auth/__tests__/LoginForm.test.tsx (1 line added)
- Next prompts: Task 5 (Login page shell) and Task 6 (Final verification and push) remain pending.
- Reflection: Minimal diff; single assertion added in the correct location.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): vitest run — PASS (5/5)
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): consider adding a `localStorage.clear()` in the `beforeEach` block to ensure test isolation for the localStorage assertion.
