# Register Page Design: LeadForge-AI

**Date**: 2026-02-20
**Status**: Approved
**Author**: assadsharif

## Purpose

User registration flow for LeadForge-AI. Collects full name, email, and password.
On success, stores a JWT access token in `localStorage` and redirects to `/dashboard`.
Full-stack: Next.js frontend form + FastAPI backend endpoint + PostgreSQL `users` table.

## Scope

- **In scope**: Register form UI, Zod validation, API client fetch, FastAPI register endpoint,
  `User` SQLAlchemy model, Alembic migration, JWT token generation, password hashing.
- **Out of scope**: Login, logout, email verification, refresh tokens, OAuth (Google/GitHub),
  dashboard auth gating, session middleware.

## Visual Style

Inherits landing page dark aesthetic:
- Background: `#0a0a0f` (globals.css body)
- Card: `bg-white/5 backdrop-blur border border-white/10 rounded-2xl`
- Full-height centered layout (`min-h-screen flex items-center justify-center`)
- Logo at top linking back to `/`
- Input fields: dark bg with white/10 border, white text, indigo focus ring
- Submit button: `bg-indigo-600 hover:bg-indigo-500`, disabled + spinner while loading
- Field errors: `text-red-400 text-sm`
- Server error: red-500/10 banner above form
- "Already have an account? Log in" link → `/login`

## Form Fields

| Field | Validation |
|---|---|
| Full name | Required, min 2 chars |
| Email | Required, valid email format |
| Password | Required, min 8 chars |
| Confirm password | Required, must match password |

## API Contract

```
POST /api/v1/auth/register
Content-Type: application/json

Request body:
{
  "full_name": "string",
  "email": "string",
  "password": "string"
}

201 Created:
{
  "access_token": "string",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "string",
    "full_name": "string"
  }
}

409 Conflict:
{ "detail": "Email already registered" }

422 Unprocessable Entity:
Pydantic validation errors (field-level)
```

## Auth State

- JWT: 7-day expiry, HS256, signed with `SECRET_KEY` from `.env`
- On 201: `localStorage.setItem("access_token", token)` then `router.push("/dashboard")`
- Note: `localStorage` is intentional for now. httpOnly cookie sessions are deferred pending
  a full auth design session.

## Component Architecture (Frontend)

| File | Type | Role |
|---|---|---|
| `src/app/(auth)/register/page.tsx` | Server | Page shell, metadata ("Create your account") |
| `src/components/auth/RegisterForm.tsx` | Client | Form with react-hook-form + zod, API call, redirect |
| `src/lib/schemas/auth.ts` | Shared | Zod schema (registerSchema, RegisterFormData type) |
| `src/lib/api/client.ts` | Shared | Typed fetch wrapper (base URL from env, error handling) |

## Backend Architecture

| File | Role |
|---|---|
| `backend/pyproject.toml` | Add `passlib[bcrypt]`, `python-jose[cryptography]` |
| `src/app/models/user.py` | SQLAlchemy `User` model |
| `src/app/schemas/auth.py` | Pydantic `RegisterRequest`, `RegisterResponse`, `TokenResponse` |
| `src/app/services/auth.py` | `hash_password()`, `create_access_token()`, `register_user()` |
| `src/app/repositories/user.py` | `get_user_by_email()`, `create_user()` |
| `src/app/api/v1/endpoints/auth.py` | `POST /auth/register` router |
| `src/app/api/v1/router.py` | Include auth router |
| `migrations/versions/001_create_users.py` | Alembic migration: create users table |

## User Model

```python
class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
```

## Error Handling

| Scenario | Frontend behavior |
|---|---|
| Field validation failure | Inline error below field, submit blocked |
| 409 email conflict | Red banner: "An account with this email already exists" |
| Network / 500 error | Red banner: "Something went wrong. Please try again." |
| Loading state | Submit button disabled, spinner icon |

## Constraints

- No new npm dependencies (react-hook-form, zod, lucide-react already installed)
- New Python deps: `passlib[bcrypt]`, `python-jose[cryptography]`
- TypeScript strict — all props typed, no `any`
- WCAG 2.1 AA — all form fields have labels, errors announced via aria-live
- Component files < 200 lines each (constitution §5.1)
- TDD: backend tests with pytest, frontend tests with Vitest + React Testing Library
