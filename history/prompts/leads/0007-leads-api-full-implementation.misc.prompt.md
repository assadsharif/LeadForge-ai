---
id: "0007"
title: Leads API Full Implementation
stage: misc
date: 2026-02-20
surface: agent
model: claude-sonnet-4-6
feature: leads
branch: main
user: assadsharif
command: "1. Subagent-Driven (this session)"
labels: ["leads","jwt","fastapi","next.js","react","tdd","vitest","sqlalchemy"]
links:
  spec: docs/plans/2026-02-20-leads-api-design.md
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/app/core/security.py
  - backend/src/app/models/lead.py
  - backend/migrations/versions/0002_create_leads_table.py
  - backend/src/app/repositories/lead_repository.py
  - backend/src/app/services/lead_service.py
  - backend/src/app/api/v1/endpoints/leads.py
  - backend/tests/unit/test_leads_security.py
  - backend/tests/unit/test_lead_service.py
  - backend/tests/integration/test_leads.py
  - frontend/src/lib/api/client.ts
  - frontend/src/app/(dashboard)/dashboard/page.tsx
  - frontend/src/app/(dashboard)/dashboard/__tests__/page.test.tsx
tests:
  - backend/tests/unit/test_leads_security.py (3 tests)
  - backend/tests/unit/test_lead_service.py (2 tests)
  - backend/tests/integration/test_leads.py (4 tests)
  - frontend/src/app/(dashboard)/dashboard/__tests__/page.test.tsx (8 tests — 4 existing + 4 new)
---

## Prompt

now wire up the leads API

(continued from previous session — brainstorming and design already complete; user chose Subagent-Driven execution for 6-task plan)

## Response snapshot

Executed 6-task Subagent-Driven Development plan across two sessions:

- Task 1: JWT security — `decode_access_token` + `get_current_user` dependency; fix: added `from None` for Ruff B904
- Task 2: Lead model + Alembic migration — `user_id` FK, `ondelete=CASCADE`, `nullable=False` on `created_at`, `text("now()")` fix
- Task 3: Lead repository + service — `get_leads_by_user_id`, `list_leads`; fix: added mock capture + assertion in empty test
- Task 4: GET /api/v1/leads endpoint — dependency override pattern; route `""` not `"/"` (avoids 307); fix: added `user_id` call assertion
- Task 5: Frontend `apiGet` + dashboard fetch — `vi.hoisted()` for mock class, `useCallback` + `void` pattern; fix: extracted shared `throwApiError` helper to DRY error handling
- Task 6: Final verification — all checks green, pushed to origin/main

## Outcome

- Impact: Full GET /api/v1/leads implementation — JWT-protected, per-user, with repository/service layer. Dashboard now fetches live leads with loading/error/populated states and WCAG-compliant error banner.
- Tests: backend 30/30 · frontend 55/55 — all green
- Files: 9 backend files (3 new tests, 3 new implementations, 2 model/migration, 1 security) + 3 frontend files
- Next prompts: POST /api/v1/leads to create leads, per-lead detail page, httpOnly cookie auth migration
- Reflection: `vi.hoisted()` was the key vitest insight — `vi.mock` is hoisted above module-scope code, so the `ApiRequestError` class for `instanceof` checks must be defined inside `vi.hoisted()`. Also: FastAPI `Depends()` is captured at decoration time — `unittest.mock.patch` doesn't work; must use `app.dependency_overrides`. Route `""` vs `"/"` with prefix matters (avoids 307 redirect).

## Evaluation notes (flywheel)

- Failure modes observed: Ruff B904 (raise inside except needs `from None`); duplicate error block in client.ts DRY violation; missing `user_id` call assertions in two tests; migration missing `ondelete=CASCADE` initially; `vi.mock` hoisting broke `ApiRequestError instanceof`
- Graders run and results (PASS/FAIL): spec reviewer PASS (all 6 tasks); code quality reviewer PASS after fixes
- Prompt variant (if applicable): Subagent-Driven Development (superpowers skill)
- Next experiment: Route `""` vs `"/"` with FastAPI prefix is a recurring footgun — add to plan template as a note
