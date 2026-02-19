---
id: "0005"
title: LeadForge-AI Folder Structure Scaffold
stage: general
date: 2026-02-19
surface: agent
model: claude-sonnet-4-6
feature: none
branch: none
user: assadsharif
command: create folder structure
labels: ["scaffold","structure","next.js","fastapi","monorepo","docker"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/src/app/layout.tsx
  - frontend/src/app/page.tsx
  - frontend/src/app/globals.css
  - frontend/src/app/loading.tsx
  - frontend/src/app/error.tsx
  - frontend/src/app/(auth)/login/page.tsx
  - frontend/src/app/(auth)/register/page.tsx
  - frontend/src/app/(dashboard)/leads/page.tsx
  - frontend/src/app/(dashboard)/leads/[id]/page.tsx
  - frontend/src/lib/api/client.ts
  - frontend/src/lib/schemas/index.ts
  - frontend/src/types/index.ts
  - frontend/next.config.ts
  - frontend/tailwind.config.ts
  - frontend/tsconfig.json
  - frontend/package.json
  - frontend/Dockerfile
  - frontend/.env.example
  - backend/src/app/main.py
  - backend/src/app/api/v1/router.py
  - backend/src/app/api/v1/endpoints/health.py
  - backend/src/app/api/v1/endpoints/leads.py
  - backend/src/app/core/config.py
  - backend/src/app/core/database.py
  - backend/src/app/core/exceptions.py
  - backend/src/app/core/logging.py
  - backend/src/app/core/security.py
  - backend/src/app/models/base.py
  - backend/src/app/models/lead.py
  - backend/src/app/schemas/common.py
  - backend/src/app/schemas/lead.py
  - backend/src/app/services/lead_service.py
  - backend/src/app/services/ai/client.py
  - backend/src/app/repositories/lead_repository.py
  - backend/migrations/env.py
  - backend/migrations/script.py.mako
  - backend/tests/conftest.py
  - backend/pyproject.toml
  - backend/alembic.ini
  - backend/Dockerfile
  - backend/.env.example
  - docker-compose.yml
  - docker-compose.prod.yml
  - .github/workflows/ci.yml (updated)
  - .gitignore (updated)
  - docs/plans/2026-02-19-folder-structure-design.md
tests:
  - none
---

## Prompt

now create the folder structure for the project

## Response snapshot

Ran brainstorming process: explored context, asked 2 clarifying questions (project root
location, Python dependency manager), proposed 3 backend layout approaches, presented
full design, received approval. Scaffolded complete LeadForge-AI monorepo structure:
- frontend/: Next.js 14 App Router with TypeScript strict, Tailwind, route groups
- backend/: FastAPI + uv, layered architecture, Alembic, structlog, AI wrapper skeleton
- Root: Docker Compose (dev + prod), CI workflow (backend + frontend jobs added)
- Design doc written to docs/plans/2026-02-19-folder-structure-design.md

## Outcome

- Impact: Full project skeleton ready for first feature spec. No business logic written —
  placeholder files mark implementation points. All files conform to constitution v2.0.0.
- Tests: none (scaffold only)
- Files: 47 files created/updated across frontend/, backend/, root
- Next prompts: /sp.specify for first feature; npm install in frontend/; uv sync in backend/
- Reflection: Brainstorming process correctly surfaced the two genuine decisions (project
  root location, Python dep manager). All other decisions were determined by constitution.

## Evaluation notes (flywheel)

- Failure modes observed: CI workflow file existed with SDD toolkit jobs — appended
  new jobs rather than overwriting. Correct handling.
- Graders run and results (PASS/FAIL): all directories verified via find command (PASS)
- Prompt variant (if applicable): brainstorming → design approval → scaffold
- Next experiment: none
