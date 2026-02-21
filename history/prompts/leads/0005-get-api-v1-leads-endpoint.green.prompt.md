---
id: "0005"
title: GET /api/v1/leads endpoint TDD implementation
stage: green
date: 2026-02-21
surface: agent
model: claude-sonnet-4-6
feature: leads
branch: main
user: HomePC
command: Task 4 — implement GET /api/v1/leads endpoint
labels: ["fastapi","tdd","integration-tests","jwt","leads"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/app/api/v1/endpoints/leads.py
  - backend/tests/integration/test_leads.py
tests:
  - tests/integration/test_leads.py::test_list_leads_no_auth_header
  - tests/integration/test_leads.py::test_list_leads_invalid_token
  - tests/integration/test_leads.py::test_list_leads_empty
  - tests/integration/test_leads.py::test_list_leads_returns_user_leads
---

## Prompt

You are implementing Task 4: GET /api/v1/leads endpoint for a FastAPI backend.

Files:
- Modify: backend/src/app/api/v1/endpoints/leads.py
- Create: backend/tests/integration/test_leads.py

Steps: write failing integration tests (4 tests covering no-auth, invalid-token, empty list, returns-user-leads), verify FAIL, implement the endpoint, verify 4 PASS, run full 30-test suite all green, commit.

Context: FastAPI + SQLAlchemy 2 async backend. get_current_user dependency in security.py, list_leads service in lead_service.py, router registered at prefix /leads in v1/router.py.

## Response snapshot

1. Read conftest.py (client fixture uses ASGITransport), security.py, lead_service.py, schemas/lead.py, router.py, main.py.
2. Wrote tests/integration/test_leads.py with 4 tests using dependency_overrides[get_current_user] and patch on app.api.v1.endpoints.leads.list_leads.
3. Verified 4 tests FAIL (stub has no routes / no list_leads attribute).
4. Implemented leads.py with @router.get("") (empty string, not "/", to avoid FastAPI 307 trailing-slash redirect — discovered after initial "/" caused 307 failures).
5. Verified 4 tests PASS.
6. Full suite: 30 passed, 2 warnings.
7. Committed as 2f23c9a: feat(backend): implement GET /api/v1/leads with JWT auth

## Outcome

- Impact: GET /api/v1/leads is now live; returns list[LeadRead] for authenticated users, 401 for missing/invalid tokens.
- Tests: 4 new integration tests added; full suite 30/30 green.
- Files: leads.py replaced (stub → full implementation); test_leads.py created.
- Next prompts: Task 5 — Frontend apiGet + dashboard leads fetch.
- Reflection: Key finding — FastAPI trailing-slash redirect (307) when route is "/" vs "" when the prefix already ends without slash. Convention in this codebase is to use "" not "/" for leaf routes.

## Evaluation notes (flywheel)

- Failure modes observed: Initial "/" route caused 307 redirects for all tests; discovered by running tests and inspecting response status code, then confirmed by reading health.py which uses "".
- Graders run and results (PASS/FAIL): 4/4 integration PASS; 30/30 full suite PASS.
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
