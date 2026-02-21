---
id: "0016"
title: Fix errorClass text-xs to text-sm in auth forms
stage: green
date: 2026-02-20
surface: agent
model: claude-sonnet-4-6
feature: auth
branch: main
user: HomePC
command: inline fix
labels: ["auth","styling","spec-fix","LoginForm","RegisterForm"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/src/components/auth/LoginForm.tsx
  - frontend/src/components/auth/RegisterForm.tsx
tests:
  - frontend/src/components/auth/__tests__/LoginForm.test.tsx
---

## Prompt

Fix one spec issue in `frontend/src/components/auth/LoginForm.tsx`:

The `errorClass` constant uses `text-xs` but the spec requires `text-sm`.

Read `frontend/src/components/auth/LoginForm.tsx`, then change line:
```typescript
const errorClass = "mt-1 text-xs text-red-400";
```
to:
```typescript
const errorClass = "mt-1 text-sm text-red-400";
```

Also check what RegisterForm.tsx uses for the same constant — they should match.

Then run tests to confirm still passing:
```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && \
  npx vitest run src/components/auth/__tests__/LoginForm.test.tsx 2>&1 | tail -10
```

Then amend the last commit:
```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend && \
  git add frontend/src/components/auth/LoginForm.tsx && \
  git commit --amend --no-edit
```

Report: what RegisterForm uses, test results, commit SHA.

## Response snapshot

- RegisterForm.tsx also had `text-xs` (not `text-sm`) — updated in the same edit pass to keep both forms in sync.
- LoginForm.tsx line 20: changed `text-xs` to `text-sm`.
- RegisterForm.tsx line 20: changed `text-xs` to `text-sm`.
- All 5 LoginForm tests passed (5/5).
- Both files staged and amend committed; new SHA: 04ddcee29b468e0e7441d5205e6ac3da427c5ef7.

## Outcome

- Impact: Visual consistency — error messages under form fields now render at `text-sm` (14 px) instead of `text-xs` (12 px), matching the spec requirement. Applied to both LoginForm and RegisterForm.
- Tests: 5/5 passed — LoginForm.test.tsx green.
- Files: LoginForm.tsx and RegisterForm.tsx (errorClass constant, line 20 each).
- Next prompts: May want to run RegisterForm tests if they exist; confirm no visual regression in Storybook/E2E.
- Reflection: RegisterForm had the same drift; fixing both in one pass prevents future inconsistency.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): vitest PASS (5/5)
- Prompt variant (if applicable): null
- Next experiment: add a lint rule or snapshot test that asserts errorClass value to prevent future drift
