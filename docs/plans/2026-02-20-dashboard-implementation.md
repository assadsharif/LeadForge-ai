# Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the `/dashboard` route — a client-side auth-gated leads list page that redirects unauthenticated users to `/login` and shows an empty-state table for authenticated users.

**Architecture:** Single `"use client"` page component at `(dashboard)/dashboard/page.tsx`. A `useEffect` auth guard checks `localStorage` on mount — no token → redirect to `/login`, valid token → render the page. No API call; the leads table shows an empty state only. No new components extracted (YAGNI — one page, one file).

**Tech Stack:** Next.js 14 App Router · React hooks (`useState`, `useEffect`) · Tailwind CSS · Vitest + React Testing Library · `@testing-library/user-event`

**Design doc:** `docs/plans/2026-02-20-dashboard-design.md`

---

## Task 1: Dashboard page

**Files:**
- Create: `frontend/src/app/(dashboard)/dashboard/page.tsx`
- Create: `frontend/src/app/(dashboard)/dashboard/__tests__/page.test.tsx`

### Step 1: Write the failing tests

Create `frontend/src/app/(dashboard)/dashboard/__tests__/page.test.tsx`:

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "../page";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("redirects to /login when no token", async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("renders Leads heading when authenticated", async () => {
    localStorage.setItem("access_token", "test-token");
    render(<DashboardPage />);
    expect(
      await screen.findByRole("heading", { name: /^leads$/i })
    ).toBeInTheDocument();
  });

  it("renders Name, Email, Added column headers", async () => {
    localStorage.setItem("access_token", "test-token");
    render(<DashboardPage />);
    await screen.findByRole("heading", { name: /^leads$/i });
    expect(screen.getByText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByText(/^added$/i)).toBeInTheDocument();
  });

  it("clears token and redirects on sign out", async () => {
    localStorage.setItem("access_token", "test-token");
    render(<DashboardPage />);
    const signOutBtn = await screen.findByRole("button", { name: /sign out/i });
    await userEvent.click(signOutBtn);
    expect(localStorage.getItem("access_token")).toBeNull();
    expect(mockPush).toHaveBeenCalledWith("/login");
  });
});
```

**Important implementation notes:**
- `next/link` must be mocked because the JSDOM test environment can't handle Next.js Link's router internals.
- `beforeEach` clears localStorage and resets mocks to prevent cross-test pollution.
- `afterEach` also clears localStorage as a safety net.
- The redirect test does NOT set a token — `localStorage.clear()` in `beforeEach` ensures it's empty.
- The authenticated tests set `"test-token"` before render and use `findBy*` (async) because the page renders `null` during the `isChecking` phase and only shows content after the `useEffect` runs.

### Step 2: Run to verify FAIL

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && \
  npx vitest run "src/app/\(dashboard\)/dashboard/__tests__/page.test.tsx" 2>&1 | tail -15
```

Expected: FAIL — `Cannot find module '../page'`

### Step 3: Implement the dashboard page

Create `frontend/src/app/(dashboard)/dashboard/page.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      router.push("/login");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  function handleSignOut() {
    localStorage.removeItem("access_token");
    router.push("/login");
  }

  if (isChecking) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Nav */}
      <nav className="border-b border-white/10 bg-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-lg font-bold text-white">LeadForge</span>
            <span className="text-lg font-bold text-indigo-500">AI</span>
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-sm text-slate-400 transition-colors hover:text-white"
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-bold text-white">Leads</h1>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-400"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-400"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-400"
                >
                  Added
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={3}
                  className="py-16 text-center text-slate-500"
                >
                  No leads yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
```

### Step 4: Run to verify PASS

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && \
  npx vitest run "src/app/\(dashboard\)/dashboard/__tests__/page.test.tsx" 2>&1 | tail -10
```

Expected: PASS (4 tests)

### Step 5: Run full frontend suite

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && \
  npx vitest run 2>&1 | tail -10
```

Expected: all tests green (47 existing + 4 new = 51 tests)

### Step 6: Commit

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend && \
  git add "frontend/src/app/(dashboard)/dashboard/page.tsx" \
          "frontend/src/app/(dashboard)/dashboard/__tests__/page.test.tsx" && \
  git commit -m "feat(frontend): add dashboard page with auth guard and leads table"
```

---

## Task 2: Final type-check, lint, and push

### Step 1: Type-check

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && npm run type-check 2>&1 | tail -5
```

Expected: exit 0, no errors.

### Step 2: Lint

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && npm run lint 2>&1 | tail -5
```

Expected: "No ESLint warnings or errors."

### Step 3: Full test suite

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && npx vitest run 2>&1 | tail -5
```

Expected: 51 tests green.

### Step 4: Push

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend && git push origin main
```

---

## File Map

```
frontend/src/app/(dashboard)/dashboard/
├── page.tsx              ← new: auth guard + nav + leads table + empty state
└── __tests__/
    └── page.test.tsx     ← new: 4 tests (redirect, heading, columns, sign out)
```
