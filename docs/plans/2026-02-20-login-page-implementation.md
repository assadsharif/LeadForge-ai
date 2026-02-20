# Login Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the login page — FastAPI `POST /auth/login` endpoint + Next.js `LoginForm` — so a returning user can sign in and land on `/dashboard`.

**Architecture:** FastAPI verifies credentials (email lookup + bcrypt compare), returns the same JWT token shape as `/register`. Next.js `LoginForm` posts to the API, stores the token in `localStorage`, and redirects to `/dashboard`. Everything reuses existing patterns: `get_user_by_email`, `verify_password`, `create_access_token`, `apiPost`, and the dark card UI are all already built.

**Tech Stack:** FastAPI · SQLAlchemy 2 async · passlib[bcrypt] · python-jose · Next.js 14 App Router · react-hook-form · zod · @hookform/resolvers · Vitest + RTL · pytest-asyncio

**Design doc:** `docs/plans/2026-02-20-login-page-design.md`

---

## Phase 1: Backend

### Task 1: Login Pydantic schemas

**Files:**
- Modify: `backend/src/app/schemas/auth.py`
- Test: `backend/tests/unit/test_login_schemas.py`

**Step 1: Write the failing test**

Create `backend/tests/unit/test_login_schemas.py`:

```python
from pydantic import ValidationError
import pytest

from app.schemas.auth import LoginRequest


def test_login_request_valid() -> None:
    req = LoginRequest(email="ada@example.com", password="s3cur3pass")
    assert req.email == "ada@example.com"


def test_login_request_invalid_email() -> None:
    with pytest.raises(ValidationError):
        LoginRequest(email="not-an-email", password="s3cur3pass")


def test_login_request_missing_password() -> None:
    with pytest.raises(ValidationError):
        LoginRequest(email="ada@example.com", password="")
```

**Step 2: Run test to verify it fails**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  /home/asad/.local/bin/uv run pytest tests/unit/test_login_schemas.py -v 2>&1 | tail -15
```

Expected: FAIL — `ImportError: cannot import name 'LoginRequest'`

**Step 3: Add LoginRequest and LoginResponse to schemas/auth.py**

Append to the end of `backend/src/app/schemas/auth.py`:

```python
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# Login returns the same token + user shape as register
LoginResponse = RegisterResponse
```

**Step 4: Run test to verify it passes**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  /home/asad/.local/bin/uv run pytest tests/unit/test_login_schemas.py -v 2>&1 | tail -10
```

Expected: PASS (3 tests)

**Step 5: Commit**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend && \
  git add backend/src/app/schemas/auth.py backend/tests/unit/test_login_schemas.py && \
  git commit -m "feat(backend): add LoginRequest schema and LoginResponse alias"
```

---

### Task 2: Login endpoint

**Files:**
- Modify: `backend/src/app/api/v1/endpoints/auth.py`
- Test: `backend/tests/integration/test_auth_login.py`

**Step 1: Write the failing test**

Create `backend/tests/integration/test_auth_login.py`:

```python
import uuid
from datetime import UTC, datetime
from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient

from app.models.user import User


def _mock_user() -> User:
    return User(
        id=uuid.uuid4(),
        full_name="Ada Lovelace",
        email="ada@example.com",
        hashed_password="$2b$12$hashed",
        created_at=datetime(2024, 1, 1, tzinfo=UTC),
    )


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient) -> None:
    mock_user = _mock_user()

    with (
        patch(
            "app.api.v1.endpoints.auth.get_user_by_email",
            new_callable=AsyncMock,
            return_value=mock_user,
        ),
        patch(
            "app.api.v1.endpoints.auth.verify_password",
            return_value=True,
        ),
    ):
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "ada@example.com", "password": "s3cur3pass"},
        )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "ada@example.com"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient) -> None:
    mock_user = _mock_user()

    with (
        patch(
            "app.api.v1.endpoints.auth.get_user_by_email",
            new_callable=AsyncMock,
            return_value=mock_user,
        ),
        patch(
            "app.api.v1.endpoints.auth.verify_password",
            return_value=False,
        ),
    ):
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "ada@example.com", "password": "wrongpass"},
        )

    assert response.status_code == 401
    assert "invalid" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_login_unknown_email(client: AsyncClient) -> None:
    with patch(
        "app.api.v1.endpoints.auth.get_user_by_email",
        new_callable=AsyncMock,
        return_value=None,
    ):
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "ghost@example.com", "password": "s3cur3pass"},
        )

    assert response.status_code == 401
    assert "invalid" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_login_validation_error(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "not-an-email", "password": "s3cur3pass"},
    )
    assert response.status_code == 422
```

**Step 2: Run test to verify it fails**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  /home/asad/.local/bin/uv run pytest tests/integration/test_auth_login.py -v 2>&1 | tail -15
```

Expected: FAIL — 404 Not Found (route not registered yet)

**Step 3: Implement login endpoint**

Add to `backend/src/app/api/v1/endpoints/auth.py` (after the register handler, before the end of file):

```python
from app.schemas.auth import LoginRequest, LoginResponse
from app.core.security import verify_password


@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
async def login(
    body: LoginRequest,
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> LoginResponse:
    user = await get_user_by_email(db, body.email)
    if user is None or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = create_access_token({"sub": str(user.id)})
    return LoginResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )
```

**Important:** Read `auth.py` first before editing — you need to add the new imports to the existing
import block at the top of the file. `create_access_token` and `hash_password` are already imported;
add `verify_password` to that line. `LoginRequest` and `LoginResponse` are new imports from
`app.schemas.auth`.

**Step 4: Run test to verify it passes**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  /home/asad/.local/bin/uv run pytest tests/integration/test_auth_login.py -v 2>&1 | tail -10
```

Expected: PASS (4 tests)

**Step 5: Run full backend suite**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  /home/asad/.local/bin/uv run pytest -v 2>&1 | tail -10
```

Expected: all 18 tests green (14 existing + 4 new).

**Step 6: Commit**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend && \
  git add backend/src/app/api/v1/endpoints/auth.py \
          backend/tests/integration/test_auth_login.py && \
  git commit -m "feat(backend): add POST /auth/login endpoint"
```

---

## Phase 2: Frontend

### Task 3: loginSchema

**Files:**
- Modify: `frontend/src/lib/schemas/auth.ts`
- Modify: `frontend/src/lib/__tests__/auth-schema.test.ts`

**Step 1: Add login schema tests**

Append to `frontend/src/lib/__tests__/auth-schema.test.ts`:

```typescript
import { loginSchema } from "../schemas/auth";

describe("loginSchema", () => {
  it("accepts valid data", () => {
    const result = loginSchema.safeParse({
      email: "ada@example.com",
      password: "s3cur3pass",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-email",
      password: "s3cur3pass",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({
      email: "ada@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});
```

**Step 2: Run to verify FAIL**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && \
  npx vitest run src/lib/__tests__/auth-schema.test.ts 2>&1 | tail -15
```

Expected: FAIL — `loginSchema` not exported from `../schemas/auth`

**Step 3: Add loginSchema to auth.ts**

Append to `frontend/src/lib/schemas/auth.ts`:

```typescript
export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
```

**Step 4: Run to verify PASS**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && \
  npx vitest run src/lib/__tests__/auth-schema.test.ts 2>&1 | tail -10
```

Expected: PASS (8 tests — 5 existing + 3 new)

**Step 5: Commit**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend && \
  git add frontend/src/lib/schemas/auth.ts \
          frontend/src/lib/__tests__/auth-schema.test.ts && \
  git commit -m "feat(frontend): add loginSchema and LoginFormData type"
```

---

### Task 4: LoginForm component

**Files:**
- Create: `frontend/src/components/auth/LoginForm.tsx`
- Create: `frontend/src/components/auth/__tests__/LoginForm.test.tsx`

**Step 1: Write the failing test**

Create `frontend/src/components/auth/__tests__/LoginForm.test.tsx`:

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "../LoginForm";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  it("renders email, password fields and submit button", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows inline errors when submitted empty", async () => {
    render(<LoginForm />);
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
  });

  it("submits to API, stores token, and redirects on success", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          access_token: "test-jwt",
          token_type: "bearer",
          user: {
            id: "uuid-1",
            email: "ada@example.com",
            full_name: "Ada Lovelace",
            created_at: new Date().toISOString(),
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText(/email/i), "ada@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "s3cur3pass");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows error banner on 401 invalid credentials", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ detail: "Invalid email or password" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      ),
    );

    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText(/email/i), "ada@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "wrongpass1");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
  });

  it("shows generic error banner on network failure", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Network Error"));

    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText(/email/i), "ada@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "s3cur3pass");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
  });
});
```

**Step 2: Run to verify FAIL**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && \
  npx vitest run src/components/auth/__tests__/LoginForm.test.tsx 2>&1 | tail -15
```

Expected: FAIL — `Cannot find module '../LoginForm'`

**Step 3: Implement LoginForm**

Create `frontend/src/components/auth/LoginForm.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth";
import { apiPost, ApiRequestError } from "@/lib/api/client";

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: { id: string; email: string; full_name: string; created_at: string };
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

const errorClass = "mt-1 text-xs text-red-400";

const labelClass = "mb-1 block text-sm font-medium text-slate-300";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setServerError(null);
    try {
      const res = await apiPost<
        { email: string; password: string },
        LoginResponse
      >("/api/v1/auth/login", {
        email: data.email,
        password: data.password,
      });
      localStorage.setItem("access_token", res.access_token);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setServerError(err.detail);
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {serverError && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={!!errors.email}
          aria-describedby="email-error"
          className={inputClass}
          {...register("email")}
        />
        <p
          id="email-error"
          className={errorClass}
          aria-live="polite"
          aria-atomic="true"
        >
          {errors.email?.message ?? ""}
        </p>
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          aria-invalid={!!errors.password}
          aria-describedby="password-error"
          className={inputClass}
          {...register("password")}
        />
        <p
          id="password-error"
          className={errorClass}
          aria-live="polite"
          aria-atomic="true"
        >
          {errors.password?.message ?? ""}
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Sign in
      </button>
    </form>
  );
}
```

**Step 4: Run to verify PASS**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && \
  npx vitest run src/components/auth/__tests__/LoginForm.test.tsx 2>&1 | tail -15
```

Expected: PASS (5 tests)

**Step 5: Commit**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend && \
  git add frontend/src/components/auth/LoginForm.tsx \
          frontend/src/components/auth/__tests__/LoginForm.test.tsx && \
  git commit -m "feat(frontend): add LoginForm component with validation and API call"
```

---

### Task 5: Login page shell

**Files:**
- Modify: `frontend/src/app/(auth)/login/page.tsx`
- Create: `frontend/src/app/(auth)/login/__tests__/page.test.tsx`

**Step 1: Write the failing test**

Create `frontend/src/app/(auth)/login/__tests__/page.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LoginPage from "../page";

vi.mock("@/components/auth/LoginForm", () => ({
  LoginForm: () => <div data-testid="login-form" />,
}));

describe("LoginPage", () => {
  it("renders page heading", () => {
    render(<LoginPage />);
    expect(
      screen.getByRole("heading", { name: /sign in to your account/i })
    ).toBeInTheDocument();
  });

  it("renders sign up link", () => {
    render(<LoginPage />);
    const link = screen.getByRole("link", { name: /sign up/i });
    expect(link).toHaveAttribute("href", "/register");
  });
});
```

**Step 2: Run to verify FAIL**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && \
  npx vitest run 2>&1 | grep -E "LoginPage|FAIL|Tests" | tail -10
```

Expected: LoginPage tests FAIL — stub renders `<div>Login</div>`, no heading found.

**Step 3: Replace login page stub**

Replace `frontend/src/app/(auth)/login/page.tsx`:

```typescript
import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in to your account — LeadForge AI",
  description: "Sign in to LeadForge AI to manage your leads.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center justify-center gap-1">
          <span className="text-xl font-bold text-white">LeadForge</span>
          <span className="text-xl font-bold text-indigo-500">AI</span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <h1 className="mb-6 text-center text-xl font-bold text-white">
            Sign in to your account
          </h1>
          <LoginForm />
        </div>

        {/* Footer link */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
```

**Step 4: Run to verify PASS**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && \
  npx vitest run 2>&1 | tail -10
```

Expected: all tests green (37 existing + 3 schema + 5 LoginForm + 2 page = 47 tests).

**Step 5: Commit**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend && \
  git add "frontend/src/app/(auth)/login/page.tsx" \
          "frontend/src/app/(auth)/login/__tests__/page.test.tsx" && \
  git commit -m "feat(frontend): implement login page UI"
```

---

## Phase 3: Verification

### Task 6: Final type-check, lint, and push

**Step 1: Frontend type-check**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && npm run type-check 2>&1 | tail -5
```

Expected: exit 0.

**Step 2: Frontend lint**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && npm run lint 2>&1 | tail -5
```

Expected: "No ESLint warnings or errors."

**Step 3: Backend ruff**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  /home/asad/.local/bin/uv run ruff check src/ 2>&1 | tail -5
```

Expected: "All checks passed."

**Step 4: Full backend test suite**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  /home/asad/.local/bin/uv run pytest -v 2>&1 | tail -10
```

Expected: 18 tests green.

**Step 5: Push**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend && git push origin main
```

---

## File Map

```
backend/
├── src/app/
│   ├── schemas/
│   │   └── auth.py              ← add LoginRequest, LoginResponse alias
│   └── api/v1/endpoints/
│       └── auth.py              ← add POST /login handler
└── tests/
    ├── unit/
    │   └── test_login_schemas.py   ← new
    └── integration/
        └── test_auth_login.py      ← new

frontend/src/
├── lib/
│   ├── schemas/auth.ts          ← add loginSchema, LoginFormData
│   └── __tests__/auth-schema.test.ts  ← add 3 loginSchema tests
├── components/auth/
│   ├── LoginForm.tsx            ← new
│   └── __tests__/LoginForm.test.tsx  ← new
└── app/(auth)/login/
    ├── page.tsx                 ← replace stub
    └── __tests__/page.test.tsx  ← new
```
