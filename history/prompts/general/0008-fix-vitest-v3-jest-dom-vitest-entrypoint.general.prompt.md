---
id: "0008"
title: Fix Vitest v3 and jest-dom/vitest entrypoint
stage: general
date: 2026-02-20
surface: agent
model: claude-sonnet-4-6
feature: none
branch: main
user: HomePC
command: fix vitest setup issues
labels: ["vitest","testing","jest-dom","vite","upgrade"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/src/test/setup.ts
  - frontend/package.json
  - frontend/package-lock.json
tests:
  - npx vitest run --passWithNoTests (exit 0, v3.2.4)
---

## Prompt

Fix two issues in the Vitest setup for /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend:

## Issue 1: Wrong jest-dom import
In /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend/src/test/setup.ts, change:
```
import "@testing-library/jest-dom";
```
to:
```
import "@testing-library/jest-dom/vitest";
```

## Issue 2: Vite 7 incompatible with Vitest 2
Upgrade Vitest to v3 (which supports Vite 6/7):
```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && npm install --save-dev vitest@^3
```

After both fixes, verify tests still run:
```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && npx vitest run --passWithNoTests
```

Expected: exit 0.

Then commit the fixes:
```bash
git add frontend/package.json frontend/package-lock.json frontend/src/test/setup.ts && git commit -m "fix(frontend): upgrade vitest to v3, use jest-dom/vitest entrypoint"
```

Report success or errors.

## Response snapshot

Both issues fixed and committed:

1. `frontend/src/test/setup.ts`: changed `import "@testing-library/jest-dom"` to `import "@testing-library/jest-dom/vitest"` to use the Vitest-specific entrypoint that registers matchers via `expect.extend`.
2. Upgraded Vitest from v2 to v3.2.4 via `npm install --save-dev vitest@^3`, resolving Vite 7 incompatibility.
3. `npx vitest run --passWithNoTests` returned exit code 0 with Vitest v3.2.4.
4. Committed as `4968400` on branch `main` with message: `fix(frontend): upgrade vitest to v3, use jest-dom/vitest entrypoint`.

## Outcome

- Impact: Vitest test runner is now compatible with Vite 7 and uses the correct jest-dom matcher registration path for Vitest environments.
- Tests: npx vitest run --passWithNoTests exited 0 (no test files found, correct baseline).
- Files: setup.ts import fixed; package.json and package-lock.json updated with vitest@3.2.4.
- Next prompts: Add actual test files to validate the jest-dom matchers work end-to-end.
- Reflection: Straightforward upgrade; no breaking changes encountered in v2 to v3 migration for this configuration.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): vitest run --passWithNoTests PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): add a smoke test that uses a jest-dom matcher (e.g., toBeInTheDocument) to confirm the entrypoint is wired correctly
