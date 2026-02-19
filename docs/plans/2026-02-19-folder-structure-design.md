# Folder Structure Design: LeadForge-AI

**Date**: 2026-02-19
**Status**: Approved
**Author**: assadsharif

## Decision Summary

Monorepo with `frontend/` (Next.js 14 App Router) and `backend/` (FastAPI + uv) as
subdirectories of the current project root. Backend uses layered (type-first) layout.
Python dependency management via uv + pyproject.toml.

## Constraints

- Constitution v2.0.0 mandates `frontend/` + `backend/` separation
- Backend: layered layout (models/, schemas/, services/, repositories/, api/)
- Frontend: App Router with route groups for auth and dashboard
- AI service wrapper isolated under `backend/src/app/services/ai/`
- Alembic migrations under `backend/migrations/versions/`
- Docker + Docker Compose at monorepo root

## Root Structure

```
/CODE/frontend/
├── frontend/
├── backend/
├── docker-compose.yml
├── docker-compose.prod.yml
├── .gitignore
├── .github/workflows/ci.yml
├── .specify/
├── history/
├── specs/
└── README.md
```

## Frontend Structure

```
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx
│   │   ├── (auth)/register/page.tsx
│   │   ├── (dashboard)/leads/page.tsx
│   │   ├── (dashboard)/leads/[id]/page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   └── page.tsx
│   ├── components/ui/
│   ├── components/leads/
│   ├── components/layout/
│   ├── hooks/
│   ├── lib/api/
│   ├── lib/schemas/
│   ├── services/
│   └── types/
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── Dockerfile
```

## Backend Structure

```
backend/
├── src/app/
│   ├── api/v1/endpoints/leads.py
│   ├── api/v1/endpoints/health.py
│   ├── api/v1/router.py
│   ├── core/config.py
│   ├── core/database.py
│   ├── core/exceptions.py
│   ├── core/logging.py
│   ├── core/security.py
│   ├── models/base.py
│   ├── models/lead.py
│   ├── schemas/lead.py
│   ├── schemas/common.py
│   ├── services/lead_service.py
│   ├── services/ai/client.py
│   ├── repositories/lead_repository.py
│   └── main.py
├── migrations/versions/
├── tests/contract/
├── tests/integration/
├── tests/unit/
├── tests/conftest.py
├── .env.example
├── pyproject.toml
├── uv.lock (generated)
├── alembic.ini
└── Dockerfile
```

## Trade-offs Considered

| Decision | Chosen | Rejected | Reason |
|---|---|---|---|
| Backend layout | Layered | Feature-based | Appropriate scale for initial feature set |
| Python deps | uv | pip, Poetry | Speed, modern toolchain |
| Frontend routing | Route groups | Flat routes | Cleaner auth/dashboard separation |
| AI isolation | `services/ai/` | Inline in service | Constitution §7.1 mandate |
