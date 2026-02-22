---
id: "0019"
title: holistic codebase code review
stage: general
date: 2026-02-22
surface: agent
model: claude-sonnet-4-6
feature: none
branch: main
user: HomePC
command: do a holistic code review
labels: ["code-review","security","architecture","frontend","backend"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/app/main.py
  - backend/src/app/core/security.py
  - backend/src/app/core/config.py
  - backend/src/app/core/exceptions.py
  - backend/src/app/api/v1/endpoints/auth.py
  - backend/src/app/api/v1/endpoints/leads.py
  - backend/src/app/services/lead_service.py
  - backend/src/app/services/ai/client.py
  - backend/src/app/models/user.py
  - backend/src/app/models/lead.py
  - backend/src/app/repositories/user_repository.py
  - backend/src/app/repositories/lead_repository.py
  - backend/Dockerfile
  - frontend/Dockerfile
  - docker-compose.yml
  - frontend/src/components/auth/LoginForm.tsx
  - frontend/src/components/auth/RegisterForm.tsx
  - frontend/src/lib/api/client.ts
  - frontend/src/app/(dashboard)/dashboard/page.tsx
  - frontend/src/app/(dashboard)/leads/[id]/page.tsx
  - frontend/src/app/(dashboard)/dashboard/AddLeadModal.tsx
  - frontend/src/lib/schemas/auth.ts
  - pyproject.toml
  - frontend/package.json
tests:
  - (none run — review only)
---

## Prompt

do a holistic code review

## Response snapshot

Comprehensive holistic code review of the LeadForge AI full-stack application (FastAPI backend + Next.js frontend).

### Critical Issues Found:
1. **Exposed GitHub PAT in .env** — must be revoked immediately
2. **JWT stored in localStorage** — XSS vulnerability; switch to HttpOnly cookies
3. **CORS `allow_methods=["*"]`** — overly permissive; restrict to GET/POST
4. **Frontend Dockerfile health check** calls `/api/health` which doesn't exist in Next.js — will always fail
5. **Hardcoded `SECRET_KEY`** in docker-compose.yml

### High Priority:
- No pagination on `GET /api/v1/leads` — can return unbounded data
- AI client singleton not async-safe (no asyncio.Lock)
- No request timeout on frontend fetch calls
- Client-side only auth guard (no Next.js middleware)
- No rate limiting on auth endpoints

### Code Quality Score: 7/10
- Type Safety: 9/10 | Security: 5/10 | Test Coverage: 6/10
- Backend structure: excellent layers (routes → services → repos → models)
- Frontend structure: good feature-based routing, full TypeScript strict mode

## Outcome

- Impact: Cross-cutting security and production-readiness audit; 5 critical + 8 high + 6 medium issues identified
- Tests: none run (review only)
- Files: no changes made (review only)
- Next prompts: fix critical security issues, add pagination, improve auth guard
- Reflection: CORS, localStorage auth, and missing health endpoint are the most impactful quick wins

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): implement HttpOnly cookie auth pattern as a single PR
