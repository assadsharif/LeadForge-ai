# Login Page Design: LeadForge-AI

**Date**: 2026-02-20
**Status**: Approved
**Author**: assadsharif

## Purpose

User login flow for LeadForge-AI. Accepts email and password, verifies credentials against the
`users` table, and returns a JWT access token. On success, stores the token in `localStorage` and
redirects to `/dashboard`. Full-stack: Next.js frontend form + FastAPI backend endpoint.

## Scope

- **In scope**: Login form UI, Zod validation, API client fetch, FastAPI login endpoint,
  `LoginRequest` / `LoginResponse` Pydantic schemas, credential verification via `verify_password`.
- **Out of scope**: Forgot password / reset flow, "remember me" / persistent sessions,
  email verification, OAuth (Google/GitHub), dashboard auth gating, httpOnly cookie sessions,
  rate limiting / brute-force protection.

## Visual Style

Mirrors register page dark aesthetic:
- Background: `#0a0a0f` (globals.css body)
- Card: `bg-white/5 backdrop-blur border border-white/10 rounded-2xl`
- Full-height centered layout (`min-h-screen flex items-center justify-center`)
- Logo at top linking back to `/`
- Input fields: dark bg with white/10 border, white text, indigo focus ring
- Submit button: `bg-indigo-600 hover:bg-indigo-500`, disabled + spinner while loading
- Field errors: `text-red-400 text-sm`
- Server error: red-500/10 banner above form
- Footer: "Don't have an account? Sign up" link → `/register`

## Form Fields

| Field | Validation |
|---|---|
| Email | Required, valid email format |
| Password | Required, min 8 chars |

## API Contract

```
POST /api/v1/auth/login
Content-Type: application/json

Request body:
{
  "email": "string",
  "password": "string"
}

200 OK:
{
  "access_token": "string",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "string",
    "full_name": "string",
    "created_at": "datetime"
  }
}

401 Unauthorized:
{ "detail": "Invalid email or password" }

422 Unprocessable Entity:
Pydantic validation errors (field-level)
```

**Security note:** Both "user not found" and "wrong password" return the same 401 message
("Invalid email or password") to prevent user enumeration attacks.

## Auth State

- On 200: `localStorage.setItem("access_token", token)` then `router.push("/dashboard")`
- Consistent with register flow — same token shape, same storage mechanism.

## Component Architecture (Frontend)

| File | Type | Role |
|---|---|---|
| `src/app/(auth)/login/page.tsx` | Server | Page shell, metadata ("Sign in to your account") |
| `src/components/auth/LoginForm.tsx` | Client | Form with react-hook-form + zod, API call, redirect |
| `src/lib/schemas/auth.ts` | Shared | Add `loginSchema` (email + password min 8) and `LoginFormData` type |
| `src/lib/api/client.ts` | Shared | Already implemented — `apiPost` reused as-is |

No new npm dependencies — `react-hook-form`, `zod`, `@hookform/resolvers`, `lucide-react`
already installed.

## Backend Architecture

| File | Change |
|---|---|
| `backend/src/app/schemas/auth.py` | Add `LoginRequest`, `LoginResponse = RegisterResponse` |
| `backend/src/app/api/v1/endpoints/auth.py` | Add `POST /login` handler |

No new repository functions needed — `get_user_by_email` and `verify_password` already exist.
No new migration needed — login reads from the existing `users` table.

## Error Handling

| Scenario | Frontend behavior |
|---|---|
| Field validation failure | Inline error below field, submit blocked |
| 401 wrong credentials | Red banner: "Invalid email or password" |
| Network / 500 error | Red banner: "Something went wrong. Please try again." |
| Loading state | Submit button disabled, spinner icon |

## Constraints

- No new npm dependencies
- TypeScript strict — all props typed, no `any`
- WCAG 2.1 AA — all form fields have labels, errors announced via aria-live (always-present `<p>` nodes)
- Component files < 200 lines each (constitution §5.1)
- TDD: backend tests with pytest, frontend tests with Vitest + React Testing Library

## Tests

**Backend (pytest):**
- `test_login_success` — mock repo + verify_password → 200 with token
- `test_login_wrong_password` — verify_password returns False → 401
- `test_login_unknown_email` — get_user_by_email returns None → 401
- `test_login_validation_error` — bad email format → 422

**Frontend (vitest):**
- Renders email + password fields and submit button
- Shows inline error on empty submit
- Submits to API, stores token in localStorage, redirects to `/dashboard`
- Shows 401 banner "Invalid email or password"
- Shows generic banner on network failure
