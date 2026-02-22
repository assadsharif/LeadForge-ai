---
id: "0020"
title: Fix Critical Security Issues — HttpOnly Cookies
stage: green
date: 2026-02-22
surface: agent
model: claude-sonnet-4-6
feature: none
branch: main
user: HomePC
command: implement plan
labels: ["security","cors","auth","cookies","jwt","docker"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/app/main.py
  - backend/src/app/core/security.py
  - backend/src/app/api/v1/endpoints/auth.py
  - docker-compose.yml
  - frontend/src/lib/api/client.ts
  - frontend/src/components/auth/LoginForm.tsx
  - frontend/src/components/auth/RegisterForm.tsx
  - frontend/src/app/(dashboard)/dashboard/page.tsx
  - frontend/src/app/(dashboard)/dashboard/AddLeadModal.tsx
  - frontend/src/app/(dashboard)/leads/[id]/page.tsx
  - frontend/src/middleware.ts (NEW)
  - frontend/src/app/api/health/route.ts (NEW)
tests:
  - backend: python -m pytest (dependency_overrides bypass cookie logic)
  - manual: docker compose up → register → HttpOnly cookie set → /dashboard without cookie → redirect /login → sign out → cookie cleared
---

## Prompt

Implement the following plan:

# Plan: Fix Critical Security Issues

## Context
The code review identified 5 critical security issues that must be resolved before production use. This plan addresses all 5 in a single cohesive change that switches the auth mechanism from localStorage JWT to HttpOnly cookies — eliminating the XSS vulnerability and aligning the entire stack.

## Issues Being Fixed
| # | Issue | Current state |
|---|-------|---------------|
| 1 | `allow_methods=["*"]` & `allow_headers=["*"]` in CORS | `backend/src/app/main.py:27-29` |
| 2 | JWT stored in `localStorage` (XSS-stealable) | `LoginForm.tsx:46`, `RegisterForm.tsx:47` |
| 3 | Hardcoded `SECRET_KEY` in docker-compose.yml | `docker-compose.yml:25` |
| 4 | Frontend Dockerfile health check → `/api/health` does not exist | `frontend/Dockerfile:22-23` |
| 5 | Exposed GitHub PAT | User action required (revoke at GitHub — not a code fix) |

## Approach
Switch auth from `Authorization: Bearer <token>` in `localStorage` → HttpOnly cookie.

[Full plan detail omitted for brevity — see conversation transcript]

## Response snapshot

Implemented all 12 changes from the plan:

1. **`backend/src/app/main.py`** — Restricted CORS to `allow_methods=["GET", "POST"]` and `allow_headers=["Content-Type"]`.

2. **`backend/src/app/core/security.py`** — Replaced `Header(default=None)` with `Cookie(default=None)` in `get_current_user`; removed `Header` import, added `Cookie` import.

3. **`backend/src/app/api/v1/endpoints/auth.py`** — Added `Response` param to `register` and `login`; both set `access_token` HttpOnly cookie (secure=True in production, samesite=lax). Added `POST /logout` that deletes the cookie.

4. **`docker-compose.yml`** — `SECRET_KEY: ${SECRET_KEY:-dev-secret-key-change-in-production}` — dev boots without config, production injects from host env.

5. **`frontend/src/app/api/health/route.ts`** (NEW) — `GET /api/health` returns `{ status: 'ok' }` to satisfy the Dockerfile healthcheck.

6. **`frontend/src/lib/api/client.ts`** — Removed `token?: string` from `apiPost` and `token: string` from `apiGet`; added `credentials: "include"` to both; removed Authorization header injection.

7. **`frontend/src/components/auth/LoginForm.tsx`** — Removed `localStorage.setItem` and unused `res` variable assignment.

8. **`frontend/src/components/auth/RegisterForm.tsx`** — Same as LoginForm.

9. **`frontend/src/middleware.ts`** (NEW) — Server-side auth guard; redirects to `/login` if `access_token` cookie absent; matched on `/dashboard`, `/dashboard/:path*`, `/leads/:path*`.

10. **`frontend/src/app/(dashboard)/dashboard/page.tsx`** — Removed `isChecking` state and localStorage guard `useEffect`; `fetchLeads` runs on mount unconditionally; `handleSignOut` calls `apiPost /api/v1/auth/logout` then redirects; removed token prop from `AddLeadModal`.

11. **`frontend/src/app/(dashboard)/leads/[id]/page.tsx`** — Removed `isChecking` state and all `localStorage` calls; `apiGet`/`apiPost` calls use no token param.

12. **`frontend/src/app/(dashboard)/dashboard/AddLeadModal.tsx`** — Removed `token: string` from Props; removed token arg from `apiPost` call; removed `localStorage.removeItem`.

## Outcome

- Impact: Eliminates XSS-stealable JWT in localStorage (critical), locks down CORS wildcards, removes hardcoded secret, adds missing health endpoint, adds server-side route protection
- Tests: Backend pytest suite unaffected (dependency_overrides bypass cookie logic); frontend localStorage test for LoginForm will need updating (out of scope per plan)
- Files: 10 modified, 2 created
- Next prompts: Revoke exposed GitHub PAT (manual), update frontend LoginForm test that asserts localStorage.setItem, add .env.example update
- Reflection: Cookie-based auth is the correct browser-native XSS-resistant pattern; the middleware guard eliminates the client-side flicker and localStorage check

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): Update LoginForm.test.tsx to assert cookie flow rather than localStorage
