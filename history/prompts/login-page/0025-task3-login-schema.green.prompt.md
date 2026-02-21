---
id: "0025"
title: Task 3 loginSchema and LoginFormData
stage: green
date: 2026-02-20
surface: agent
model: claude-sonnet-4-6
feature: login-page
branch: main
user: Asad Sharif
command: implement Task 3 loginSchema
labels: ["login","schema","zod","tdd","green"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/src/lib/schemas/auth.ts
  - frontend/src/lib/__tests__/auth-schema.test.ts
tests:
  - src/lib/__tests__/auth-schema.test.ts (8 tests — 5 registerSchema + 3 loginSchema)
---

## Prompt

You are implementing Task 3 of the login page plan for LeadForge-AI. This is a Next.js 14 + TypeScript project.

Task 3: loginSchema

Files:
- Modify: frontend/src/lib/schemas/auth.ts
- Modify: frontend/src/lib/__tests__/auth-schema.test.ts

Steps:
1. Add loginSchema tests (appended to auth-schema.test.ts, updating existing import to include loginSchema).
2. Run tests — verify FAIL (loginSchema not yet exported).
3. Add loginSchema and LoginFormData to auth.ts.
4. Run tests — verify PASS (8 tests total).
5. Commit with message "feat(frontend): add loginSchema and LoginFormData type".

## Response snapshot

- Updated import line in auth-schema.test.ts to `import { registerSchema, loginSchema } from "../schemas/auth"` (no duplicate import).
- Appended `describe("loginSchema", ...)` block with 3 tests to auth-schema.test.ts.
- Confirmed FAIL: 5 passed, 3 failed (loginSchema not found).
- Appended `loginSchema` and `LoginFormData` to auth.ts (reusing existing `z` import).
- Confirmed PASS: all 8 tests passed.
- Committed: SHA 0da0f36 — "feat(frontend): add loginSchema and LoginFormData type".

## Outcome

- Impact: loginSchema is now exported from auth.ts and validated by 3 new tests; LoginFormData type is available for the LoginForm component (Task 4).
- Tests: 8 passed (5 registerSchema + 3 loginSchema); 0 failed.
- Files: 2 modified — auth.ts (+8 lines), auth-schema.test.ts (+26 lines, 1 line modified for import).
- Next prompts: Task 4 — LoginForm component using LoginFormData.
- Reflection: Red-green cycle executed cleanly; no duplicate imports; smallest viable diff applied.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): vitest run PASS (8/8)
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
