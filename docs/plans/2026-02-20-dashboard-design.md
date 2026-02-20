# Dashboard Design: LeadForge-AI

**Date**: 2026-02-20
**Status**: Approved
**Author**: assadsharif

## Purpose

The `/dashboard` route is the post-login landing page for authenticated users. It displays a
read-only leads list (empty state for now — backend API wired up in a later feature). Unauthenticated
users are redirected to `/login` via a client-side auth guard.

## Scope

- **In scope**: `/dashboard` route, client-side auth guard, nav with logout, leads table shell,
  empty state UI, 4 Vitest tests.
- **Out of scope**: Fetching real leads from the API, add/edit/delete lead actions, pagination,
  search/filter, httpOnly cookie auth, layout-level route protection, `useAuth` hook abstraction.

## Routing

`/dashboard` maps to `frontend/src/app/(dashboard)/dashboard/page.tsx`. The existing
`(dashboard)/leads/` stubs are left untouched — they will be implemented in the leads feature.

No `(dashboard)/layout.tsx` is added (YAGNI — only one dashboard page at this stage).

## Auth Guard

Client-side `useEffect` pattern, consistent with the current localStorage auth approach:

```typescript
const [isChecking, setIsChecking] = useState(true);

useEffect(() => {
  if (!localStorage.getItem("access_token")) {
    router.push("/login");
  } else {
    setIsChecking(false);
  }
}, [router]);

if (isChecking) return null;
```

The `isChecking` flag prevents a flash of dashboard content for unauthenticated users. No token →
instant redirect to `/login`. Valid token → page renders.

## Logout

```typescript
function handleSignOut() {
  localStorage.removeItem("access_token");
  router.push("/login");
}
```

No API call — no server-side session to invalidate at this stage.

## Visual Design

Mirrors the dark aesthetic of the register/login pages (`#0a0a0f` body from globals.css).

### Nav
- `bg-white/5 border-b border-white/10` full-width bar
- Left: LeadForge**AI** logo (white + indigo-500)
- Right: "Sign out" button (`text-slate-400 hover:text-white`)

### Main content
- `max-w-6xl mx-auto px-6 py-8`
- `<h1>` "Leads" — `text-2xl font-bold text-white`
- Table card: `mt-6 rounded-2xl border border-white/10 bg-white/5`
- Table columns: **Name** · **Email** · **Added** (`text-xs text-slate-400 uppercase`)
- Empty state: centered "No leads yet." in `text-slate-500 py-16`

## Component Architecture

| File | Type | Role |
|---|---|---|
| `src/app/(dashboard)/dashboard/page.tsx` | Client | Auth guard, nav, leads table shell |
| `src/app/(dashboard)/dashboard/__tests__/page.test.tsx` | Test | 4 Vitest + RTL tests |

Single file, no new components extracted. Estimated ~120 lines (within constitution §5.1 200-line limit).

No new npm dependencies.

## Tests

| Test | Assertion |
|---|---|
| Redirects to `/login` when no token | No token → `router.push("/login")` called |
| Renders heading when token present | Token in localStorage → `<h1>Leads</h1>` visible |
| Renders table columns | Name, Email, Added headers in DOM |
| Sign out clears token and redirects | Click "Sign out" → localStorage cleared → `router.push("/login")` |

## Constraints

- No new npm dependencies
- TypeScript strict — no `any`
- WCAG 2.1 AA — nav button accessible, table has `<thead>` with `<th scope="col">`
- Component < 200 lines (constitution §5.1)
- TDD: tests written before implementation
