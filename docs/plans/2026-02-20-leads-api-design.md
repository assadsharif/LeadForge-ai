# Leads API Design: LeadForge-AI

**Date**: 2026-02-20
**Status**: Approved
**Author**: assadsharif

## Purpose

Wire up `GET /api/v1/leads` — a JWT-protected endpoint that returns the authenticated user's
leads — and update the `/dashboard` page to fetch and display those leads. Unauthenticated
requests return 401. Each user sees only their own leads.

## Scope

- **In scope**: `GET /api/v1/leads`, JWT decode + `get_current_user` dependency, per-user
  `user_id` FK on `Lead` model, Alembic migration for leads table, `apiGet` client utility,
  dashboard fetch with loading/error/empty/populated states, ~11 new tests.
- **Out of scope**: POST/PATCH/DELETE leads, pagination, search/filter, real-time updates,
  per-lead detail page.

## Data Model

`Lead` model gains a `user_id` FK:

```python
user_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
)
```

Also corrects `server_default=func.now()` → `server_default=text("now()")` to match the
`User` model pattern (the existing code is invalid for async SQLAlchemy).

Migration `0002_create_leads_table.py` creates the `leads` table with all columns including
`user_id` from the start (no leads exist yet — clean creation, not alter-table).

## Auth Pattern

Two additions to `core/security.py`:

**`decode_access_token(token: str) -> uuid.UUID`**
Decodes the HS256 JWT, extracts `sub` (user UUID string), returns `uuid.UUID`.
Raises `HTTPException 401` for expired, invalid, or malformed tokens.

**`get_current_user(authorization: str = Header(...)) -> uuid.UUID`**
FastAPI dependency. Validates `Authorization: Bearer <token>` header format, calls
`decode_access_token`, returns `user_id`. Raises 401 for missing/malformed header.

## API

`GET /api/v1/leads` — `list[LeadRead]`, 200 OK

- Protected by `Depends(get_current_user)`
- Delegates to `list_leads(db, user_id) → list[LeadRead]` in service layer
- Service delegates to `get_leads_by_user_id(session, user_id) → list[Lead]` in repository

Error responses:
- `401 Unauthorized` — missing/invalid/expired token (message: "Could not validate credentials")
- No other errors (no 404, no 422 for this endpoint)

## Repository & Service

```
lead_repository.py
  get_leads_by_user_id(session, user_id) → list[Lead]

lead_service.py
  list_leads(db, user_id) → list[LeadRead]
```

Repository uses `select(Lead).where(Lead.user_id == user_id).order_by(Lead.created_at.desc())`.
Service calls repository and returns validated `LeadRead` instances.

## Frontend

### `client.ts`

Adds `apiGet<T>(path: string, token: string) → Promise<T>`:
- `GET` request with `Authorization: Bearer <token>` header
- Raises `ApiRequestError` on non-2xx (reuses existing error type)

### `dashboard/page.tsx`

Adds `leads` + `isLoading` + `error` state. After auth check passes, fetches leads:

| State | Renders |
|---|---|
| `isChecking` | `null` (existing) |
| `isLoading` | Loading spinner/text |
| `error` (401) | Redirect to `/login` |
| `error` (other) | Inline error banner |
| `leads === []` | "No leads yet." (unchanged) |
| `leads.length > 0` | Table rows: Name / Email / Added |

`Added` column shows `created_at` formatted as `toLocaleDateString()`.

## Component Architecture

| File | Type | Role |
|---|---|---|
| `backend/src/app/models/lead.py` | Model | Add user_id FK, fix server_default |
| `backend/migrations/versions/0002_create_leads_table.py` | Migration | Create leads table |
| `backend/src/app/core/security.py` | Auth | decode_access_token + get_current_user |
| `backend/src/app/repositories/lead_repository.py` | Repository | get_leads_by_user_id |
| `backend/src/app/services/lead_service.py` | Service | list_leads |
| `backend/src/app/api/v1/endpoints/leads.py` | Endpoint | GET / → list[LeadRead] |
| `frontend/src/lib/api/client.ts` | Client | Add apiGet |
| `frontend/src/app/(dashboard)/dashboard/page.tsx` | Page | Fetch + display leads |

## Tests

| File | Tests |
|---|---|
| `backend/tests/unit/test_leads_security.py` | decode_access_token: valid → UUID, expired → 401, bad token → 401 |
| `backend/tests/integration/test_leads.py` | 200 returns only caller's leads; 401 no token; 401 bad token; 200 empty list |
| `frontend/.../dashboard/__tests__/page.test.tsx` | Loading state; leads render; API error banner; 401 → redirect |

~7 backend + ~4 frontend = ~11 new tests.
Baseline: backend 21/21 · frontend 51/51.

## Constraints

- No new npm dependencies
- No new pip dependencies (jose, sqlalchemy already present)
- TypeScript strict — no `any`
- WCAG 2.1 AA — error banner accessible (`role="alert"`)
- TDD: tests written before implementation per task
- User enumeration prevention not applicable here (lead list is user-specific, not a lookup)
