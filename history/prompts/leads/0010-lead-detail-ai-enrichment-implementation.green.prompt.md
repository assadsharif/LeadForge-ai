---
id: "0010"
title: Lead Detail Page + AI Enrichment Implementation
stage: green
date: 2026-02-22
surface: agent
model: claude-sonnet-4-6
feature: leads
branch: main
user: HomePC
command: Implement the following plan (Lead Detail Page + AI Enrichment)
labels: ["lead-detail","ai-enrichment","backend","frontend","claude-api"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/app/repositories/lead_repository.py
  - backend/src/app/services/lead_service.py
  - backend/src/app/services/ai/client.py
  - backend/src/app/schemas/lead.py
  - backend/src/app/api/v1/endpoints/leads.py
  - backend/pyproject.toml
  - backend/uv.lock
  - backend/tests/integration/test_lead_detail.py
  - backend/tests/unit/test_lead_detail_service.py
  - frontend/src/app/(dashboard)/leads/[id]/page.tsx
  - frontend/src/app/(dashboard)/leads/page.tsx
  - frontend/src/app/(dashboard)/dashboard/page.tsx
tests:
  - backend/tests/integration/test_lead_detail.py (5 tests — GET /leads/{id} and POST /leads/{id}/enrich)
  - backend/tests/unit/test_lead_detail_service.py (4 tests — get_lead and enrich_lead service)
---

## Prompt

Implement the following plan:

# Implementation Plan: Lead Detail Page + AI Enrichment

## Context
LeadForge AI has a working dashboard with leads CRUD. Three features were requested:
- **Register endpoint** → Already fully implemented (backend + frontend). No work needed.
- **Lead detail page** → Frontend stub exists. Backend needs GET /leads/{id} endpoint.
- **AI enrichment** → ai/client.py is a comment stub. Implement using Claude API to generate a lead summary + personalized outreach email, surfaced on the lead detail page.

## Scope
- **In scope:** Backend GET /leads/{id} + POST /leads/{id}/enrich, AI client via Claude API, lead detail frontend page, leads list page, dashboard link-through.
- **Out of scope:** Register (done), lead editing/deletion, authentication changes.

[Full plan: Feature 1 backend, Feature 2 frontend — see plan above]

## Response snapshot

Implemented all 8 files across backend and frontend:

**Backend:**
1. `lead_repository.py` — Added `get_lead_by_id(session, lead_id, user_id)` scoped to owner
2. `lead_service.py` — Added `get_lead` (raises 404 if None) and `enrich_lead` (calls AI client)
3. `ai/client.py` — Full Claude API implementation using `anthropic` SDK; returns `summary` + `outreach_email`; graceful fallback on errors
4. `schemas/lead.py` — Added `EnrichResponse(summary, outreach_email)`
5. `endpoints/leads.py` — Added `GET /leads/{lead_id}` and `POST /leads/{lead_id}/enrich`
6. `pyproject.toml` — Added `anthropic>=0.25.0` dependency; installed `anthropic==0.83.0` via uv

**Frontend:**
7. `leads/[id]/page.tsx` — Full detail page: auth guard, lead card, "Enrich with AI" button, enrichment result card with copy button
8. `leads/page.tsx` — Full list page: auth guard, table with row links to detail pages
9. `dashboard/page.tsx` — Lead name cells wrapped in `<Link href="/leads/{id}">`

**Tests (9 new, 47 total — all pass):**
- Integration: GET 401/200/404, POST 401/200/404 for enrich endpoint
- Unit: get_lead success/404, enrich_lead success/404

## Outcome

- Impact: Lead detail page fully functional; AI enrichment wired end-to-end via Claude API; dashboard rows clickable
- Tests: 47 passed, 2 warnings (pre-existing deprecation warnings unrelated to changes)
- Files: 9 files modified/created + pyproject.toml + uv.lock
- Next prompts: Run ruff/mypy linting; deploy and verify live AI enrichment with real API key; add tests for ai/client.py unit-level
- Reflection: Had to install `uv` (not present in WSL path) and add `anthropic` to pyproject.toml before tests could load

## Evaluation notes (flywheel)

- Failure modes observed: `anthropic` not in backend deps; uv not in PATH — resolved by installing uv and `uv add anthropic`
- Graders run and results (PASS/FAIL): pytest 47/47 PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Add ruff lint pass to CI check AI client imports
