---
id: "0004"
title: Lead repository and list_leads service
stage: green
date: 2026-02-21
surface: agent
model: claude-sonnet-4-6
feature: leads
branch: main
user: Asad Sharif
command: Task 3 — Lead repository + service (TDD)
labels: ["tdd","backend","repository","service","sqlalchemy","fastapi"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/app/repositories/lead_repository.py
  - backend/src/app/services/lead_service.py
  - backend/tests/unit/test_lead_service.py
tests:
  - tests/unit/test_lead_service.py::test_list_leads_returns_lead_reads
  - tests/unit/test_lead_service.py::test_list_leads_empty
---

## Prompt

You are implementing Task 3: Lead repository + service for a FastAPI backend.

Files:
- Modify: backend/src/app/repositories/lead_repository.py
- Modify: backend/src/app/services/lead_service.py
- Create: backend/tests/unit/test_lead_service.py

Steps:
1. Write failing tests (ImportError expected)
2. Verify FAIL
3. Implement lead_repository.py with get_leads_by_user_id using SQLAlchemy 2 async select
4. Implement lead_service.py with list_leads delegating to the repository and returning list[LeadRead]
5. Verify PASS (2 tests)
6. Run full suite (26 tests expected)
7. Commit: feat(backend): implement lead repository and list_leads service

## Response snapshot

Followed all TDD steps strictly:
1. Created test file with two async tests patching app.services.lead_service.get_leads_by_user_id.
2. Confirmed FAIL: ImportError cannot import name 'list_leads' from empty stub.
3. Implemented get_leads_by_user_id in lead_repository.py using select(Lead).where(Lead.user_id == user_id).order_by(Lead.created_at.desc()).
4. Implemented list_leads in lead_service.py importing get_leads_by_user_id and returning [LeadRead.model_validate(lead) for lead in leads].
5. Both new tests PASSED.
6. Full suite: 26 passed, 0 failures.
7. Committed as 6887d87.

## Outcome

- Impact: Lead query layer and service layer are now functional; downstream GET /api/v1/leads endpoint can be wired directly to list_leads.
- Tests: 2 new unit tests pass; full suite 26/26 green.
- Files: 3 files changed (79 insertions, 4 deletions replacing stubs).
- Next prompts: Task 4 — implement GET /api/v1/leads endpoint wiring list_leads into the router with JWT auth.
- Reflection: Patch target app.services.lead_service.get_leads_by_user_id works because the service imports the function by name into its own namespace.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): pytest 26/26 PASS
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): add ordering assertion to test_list_leads_returns_lead_reads to verify desc sort is exercised
