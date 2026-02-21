---
id: "0008"
title: POST /api/v1/leads Create Endpoint
stage: green
date: 2026-02-21
surface: agent
model: claude-sonnet-4-6
feature: leads
branch: main
user: assadsharif
command: "now build the POST /api/v1/leads endpoint"
labels: ["leads","fastapi","post","create","409","tdd","repository-pattern"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/app/repositories/lead_repository.py
  - backend/src/app/services/lead_service.py
  - backend/src/app/api/v1/endpoints/leads.py
  - backend/tests/integration/test_leads.py
  - backend/tests/unit/test_lead_service.py
tests:
  - tests/unit/test_lead_service.py::test_create_lead_success (new)
  - tests/unit/test_lead_service.py::test_create_lead_duplicate_email_raises_409 (new)
  - tests/integration/test_leads.py::test_create_lead_no_auth_header (new)
  - tests/integration/test_leads.py::test_create_lead_invalid_token (new)
  - tests/integration/test_leads.py::test_create_lead_success (new)
  - tests/integration/test_leads.py::test_create_lead_duplicate_email (new)
---

## Prompt

now build the POST /api/v1/leads endpoint

## Response snapshot

Implemented the full POST /api/v1/leads endpoint across 4 layers:

- **Repository** (`lead_repository.py`): added `get_lead_by_email(session, email) -> Lead | None` and `create_lead(session, *, user_id, email, name) -> Lead` following the same `session.add / commit / refresh` pattern as `create_user`.
- **Service** (`lead_service.py`): added `create_lead(db, user_id, data: LeadCreate) -> LeadRead` — queries for existing email, raises `HTTPException(409)` on duplicate, then delegates to repo and validates result to `LeadRead`.
- **Endpoint** (`leads.py`): added `POST ""` handler returning `LeadRead` with `201 Created`, using the same `Depends(get_current_user)` + `Depends(get_db)` pattern as the GET handler.
- **Tests**: 6 new tests (2 unit, 4 integration) — auth guards (401), happy path (201, payload assertions, mock call verification), duplicate email (409 with correct detail message). All 12 tests pass. Ruff clean.

Clarifying decision made: email uniqueness is **global** (Option A), consistent with the existing `unique=True` constraint on `Lead.email` — no migration needed.

## Outcome

- Impact: Creates a new authenticated POST endpoint; any user can create a lead with a unique email globally. Duplicate email → 409 with detail "A lead with this email already exists".
- Tests: 12 total passing (6 existing + 6 new). 0 failures.
- Files: 5 files modified, 0 new files created.
- Next prompts: DELETE /api/v1/leads/{id}, PATCH /api/v1/leads/{id}, pagination on GET, per-user email uniqueness (migration to composite unique constraint)
- Reflection: The alias pattern `create_lead as repo_create_lead` is necessary when service and repo share a function name. Ruff I001 was triggered by a blank line between two third-party import groups — removing it and letting `ruff --fix` reorder resolved it cleanly.

## Evaluation notes (flywheel)

- Failure modes observed: Ruff auto-fix split a single `from app.repositories.lead_repository import (...)` block into two separate blocks; manual consolidation was needed after running `--fix`.
- Graders run and results (PASS/FAIL): pytest 12/12 PASS, ruff PASS
- Prompt variant (if applicable): feature-dev skill flow (discovery → explore → clarify → implement → review)
- Next experiment: Try raising `DomainException` instead of `HTTPException` in the service layer for consistency with the registered exception handler, then verify test assertions still hold.
