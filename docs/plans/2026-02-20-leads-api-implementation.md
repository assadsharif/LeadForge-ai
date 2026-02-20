# Leads API Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement `GET /api/v1/leads` (JWT-protected, per-user) and wire the `/dashboard` frontend to fetch and display leads.

**Architecture:** Backend adds `user_id` FK to Lead model, JWT decode + `get_current_user` FastAPI dependency, repository + service layer, and the protected endpoint. Frontend adds `apiGet` utility and updates the dashboard page with fetch, loading, error, and populated table states.

**Tech Stack:** FastAPI · SQLAlchemy 2 async · Alembic · python-jose · Next.js 14 App Router · Vitest · React Testing Library

---

## Task 1: JWT security utilities

**Files:**
- Modify: `backend/src/app/core/security.py`
- Create: `backend/tests/unit/test_leads_security.py`

### Step 1: Write the failing tests

Create `backend/tests/unit/test_leads_security.py`:

```python
import uuid
from datetime import timedelta

import pytest
from fastapi import HTTPException

from app.core.security import create_access_token, decode_access_token


def test_decode_access_token_valid() -> None:
    user_id = uuid.uuid4()
    token = create_access_token({"sub": str(user_id)})
    assert decode_access_token(token) == user_id


def test_decode_access_token_expired() -> None:
    user_id = uuid.uuid4()
    token = create_access_token({"sub": str(user_id)}, expires_delta=timedelta(seconds=-1))
    with pytest.raises(HTTPException) as exc_info:
        decode_access_token(token)
    assert exc_info.value.status_code == 401


def test_decode_access_token_invalid() -> None:
    with pytest.raises(HTTPException) as exc_info:
        decode_access_token("not.a.valid.token")
    assert exc_info.value.status_code == 401
```

### Step 2: Run to verify FAIL

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  python -m pytest tests/unit/test_leads_security.py -v 2>&1 | tail -15
```

Expected: FAIL — `ImportError: cannot import name 'decode_access_token'`

### Step 3: Implement decode_access_token + get_current_user

Replace the full contents of `backend/src/app/core/security.py`:

```python
import uuid
from datetime import UTC, datetime, timedelta

from fastapi import Header, HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ACCESS_TOKEN_EXPIRE_DAYS = 7
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return _pwd_context.hash(password)  # type: ignore[no-any-return]


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return _pwd_context.verify(plain_password, hashed_password)  # type: ignore[no-any-return]


def create_access_token(
    data: dict[str, object],
    expires_delta: timedelta | None = None,
) -> str:
    to_encode = data.copy()
    expire = datetime.now(UTC) + (
        expires_delta or timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    )
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)  # type: ignore[no-any-return]


def _credentials_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


def decode_access_token(token: str) -> uuid.UUID:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        sub: str | None = payload.get("sub")
        if sub is None:
            raise _credentials_exception()
        return uuid.UUID(sub)
    except (JWTError, ValueError):
        raise _credentials_exception()


async def get_current_user(
    authorization: str | None = Header(default=None),
) -> uuid.UUID:
    if authorization is None or not authorization.startswith("Bearer "):
        raise _credentials_exception()
    return decode_access_token(authorization[7:])
```

**Important notes:**
- `Header(default=None)` makes the `Authorization` header optional at the FastAPI level. The missing-header case is handled explicitly with a 401 (not a 422 validation error).
- `_credentials_exception()` is a helper function — called as a function so linters don't flag it as unreachable after a `raise`.
- `decode_access_token` catches both `JWTError` (expired, malformed) and `ValueError` (invalid UUID in `sub`).
- `get_current_user` is an async FastAPI dependency used via `Depends(get_current_user)`.

### Step 4: Run to verify PASS

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  python -m pytest tests/unit/test_leads_security.py -v 2>&1 | tail -10
```

Expected: 3 tests PASS.

### Step 5: Run full backend suite

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  python -m pytest 2>&1 | tail -10
```

Expected: 21 existing + 3 new = 24 tests, all green.

### Step 6: Commit

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend && \
  git add backend/src/app/core/security.py \
          backend/tests/unit/test_leads_security.py && \
  git commit -m "feat(backend): add decode_access_token and get_current_user dependency"
```

---

## Task 2: Lead model + Alembic migration

**Files:**
- Modify: `backend/src/app/models/lead.py`
- Create: `backend/migrations/versions/0002_create_leads_table.py`

No new tests for this task — schema correctness is verified by integration tests in Task 4.

### Step 1: Update Lead model

Replace `backend/src/app/models/lead.py`:

```python
import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()")
    )
```

**Changes from the original:**
- Added `user_id` FK column (UUID, references `users.id`, `nullable=False`, `index=True`)
- Fixed `server_default=func.now()` → `server_default=text("now()")` — consistent with User model (`func.now()` is invalid for SQLAlchemy async server_default)
- Updated imports: added `ForeignKey`, `text`; removed unused `func`

### Step 2: Write migration

Create `backend/migrations/versions/0002_create_leads_table.py`:

```python
"""create leads table

Revision ID: 0002
Revises: 0001
Create Date: 2026-02-20
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "leads",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            nullable=False,
        ),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index("ix_leads_user_id", "leads", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_leads_user_id", table_name="leads")
    op.drop_table("leads")
```

### Step 3: Verify backend imports still work

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  python -m pytest 2>&1 | tail -10
```

Expected: 24 tests, all green (no import errors from model changes).

### Step 4: Commit

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend && \
  git add backend/src/app/models/lead.py \
          backend/migrations/versions/0002_create_leads_table.py && \
  git commit -m "feat(backend): add user_id FK to Lead model and create leads migration"
```

---

## Task 3: Lead repository + service

**Files:**
- Modify: `backend/src/app/repositories/lead_repository.py`
- Modify: `backend/src/app/services/lead_service.py`
- Create: `backend/tests/unit/test_lead_service.py`

### Step 1: Write the failing tests

Create `backend/tests/unit/test_lead_service.py`:

```python
import uuid
from datetime import UTC, datetime
from unittest.mock import AsyncMock, patch

import pytest

from app.models.lead import Lead
from app.schemas.lead import LeadRead
from app.services.lead_service import list_leads


def _mock_lead(user_id: uuid.UUID) -> Lead:
    return Lead(
        id=uuid.uuid4(),
        user_id=user_id,
        email="ada@example.com",
        name="Ada Lovelace",
        created_at=datetime(2024, 1, 1, tzinfo=UTC),
    )


@pytest.mark.asyncio
async def test_list_leads_returns_lead_reads() -> None:
    user_id = uuid.uuid4()
    mock_db = AsyncMock()
    with patch(
        "app.services.lead_service.get_leads_by_user_id",
        new_callable=AsyncMock,
        return_value=[_mock_lead(user_id)],
    ) as mock_repo:
        result = await list_leads(mock_db, user_id)

    mock_repo.assert_called_once_with(mock_db, user_id)
    assert len(result) == 1
    assert isinstance(result[0], LeadRead)
    assert result[0].email == "ada@example.com"
    assert result[0].name == "Ada Lovelace"


@pytest.mark.asyncio
async def test_list_leads_empty() -> None:
    user_id = uuid.uuid4()
    mock_db = AsyncMock()
    with patch(
        "app.services.lead_service.get_leads_by_user_id",
        new_callable=AsyncMock,
        return_value=[],
    ):
        result = await list_leads(mock_db, user_id)

    assert result == []
```

### Step 2: Run to verify FAIL

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  python -m pytest tests/unit/test_lead_service.py -v 2>&1 | tail -15
```

Expected: FAIL — `ImportError` from the empty lead_service stub.

### Step 3: Implement lead_repository.py

Replace `backend/src/app/repositories/lead_repository.py`:

```python
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lead import Lead


async def get_leads_by_user_id(
    session: AsyncSession, user_id: uuid.UUID
) -> list[Lead]:
    result = await session.execute(
        select(Lead)
        .where(Lead.user_id == user_id)
        .order_by(Lead.created_at.desc())
    )
    return list(result.scalars().all())
```

### Step 4: Implement lead_service.py

Replace `backend/src/app/services/lead_service.py`:

```python
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.lead_repository import get_leads_by_user_id
from app.schemas.lead import LeadRead


async def list_leads(db: AsyncSession, user_id: uuid.UUID) -> list[LeadRead]:
    leads = await get_leads_by_user_id(db, user_id)
    return [LeadRead.model_validate(lead) for lead in leads]
```

### Step 5: Run to verify PASS

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  python -m pytest tests/unit/test_lead_service.py -v 2>&1 | tail -10
```

Expected: 2 tests PASS.

### Step 6: Run full backend suite

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  python -m pytest 2>&1 | tail -10
```

Expected: 26 tests, all green.

### Step 7: Commit

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend && \
  git add backend/src/app/repositories/lead_repository.py \
          backend/src/app/services/lead_service.py \
          backend/tests/unit/test_lead_service.py && \
  git commit -m "feat(backend): implement lead repository and list_leads service"
```

---

## Task 4: GET /api/v1/leads endpoint

**Files:**
- Modify: `backend/src/app/api/v1/endpoints/leads.py`
- Create: `backend/tests/integration/test_leads.py`

### Step 1: Write the failing integration tests

Create `backend/tests/integration/test_leads.py`:

```python
import uuid
from collections.abc import Generator
from datetime import UTC, datetime
from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient

from app.core.security import get_current_user
from app.main import app
from app.schemas.lead import LeadRead


@pytest.fixture(autouse=True)
def clear_overrides() -> Generator[None, None, None]:
    yield
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_list_leads_no_auth_header(client: AsyncClient) -> None:
    response = await client.get("/api/v1/leads")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_list_leads_invalid_token(client: AsyncClient) -> None:
    response = await client.get(
        "/api/v1/leads",
        headers={"Authorization": "Bearer not-a-valid-jwt"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_list_leads_empty(client: AsyncClient) -> None:
    user_id = uuid.uuid4()
    app.dependency_overrides[get_current_user] = lambda: user_id
    with patch(
        "app.api.v1.endpoints.leads.list_leads",
        new_callable=AsyncMock,
        return_value=[],
    ):
        response = await client.get(
            "/api/v1/leads",
            headers={"Authorization": "Bearer any-token"},
        )
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_list_leads_returns_user_leads(client: AsyncClient) -> None:
    user_id = uuid.uuid4()
    lead = LeadRead(
        id=uuid.uuid4(),
        email="ada@example.com",
        name="Ada Lovelace",
        created_at=datetime(2024, 1, 1, tzinfo=UTC),
    )
    app.dependency_overrides[get_current_user] = lambda: user_id
    with patch(
        "app.api.v1.endpoints.leads.list_leads",
        new_callable=AsyncMock,
        return_value=[lead],
    ):
        response = await client.get(
            "/api/v1/leads",
            headers={"Authorization": "Bearer any-token"},
        )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["email"] == "ada@example.com"
    assert data[0]["name"] == "Ada Lovelace"
```

**Important notes:**
- `app.dependency_overrides[get_current_user] = lambda: user_id` is the correct FastAPI approach for bypassing a dependency in tests. `unittest.mock.patch` does NOT work for FastAPI dependencies because `Depends(get_current_user)` captures the reference at decoration time.
- The `autouse=True` fixture `clear_overrides` runs after every test in this file, preventing override leakage between tests.
- For the two auth-failure tests, NO override is set — the real `get_current_user` runs and raises 401.
- `list_leads` is patched at the endpoint module level (`app.api.v1.endpoints.leads.list_leads`) — this works because the endpoint imports it with `from app.services.lead_service import list_leads`.
- Check `backend/tests/conftest.py` for the `client` fixture — it should be an `AsyncClient` wrapping the FastAPI `app`.

### Step 2: Run to verify FAIL

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  python -m pytest tests/integration/test_leads.py -v 2>&1 | tail -15
```

Expected: FAIL — 404 (endpoint stub returns no routes).

### Step 3: Implement the leads endpoint

Replace `backend/src/app/api/v1/endpoints/leads.py`:

```python
import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.lead import LeadRead
from app.services.lead_service import list_leads

router = APIRouter()


@router.get("/", response_model=list[LeadRead], status_code=200)
async def list_leads_endpoint(
    user_id: uuid.UUID = Depends(get_current_user),  # noqa: B008
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> list[LeadRead]:
    return await list_leads(db, user_id)
```

### Step 4: Run to verify PASS

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  python -m pytest tests/integration/test_leads.py -v 2>&1 | tail -15
```

Expected: 4 tests PASS.

### Step 5: Run full backend suite

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  python -m pytest 2>&1 | tail -10
```

Expected: 30 tests, all green (21 existing + 3 security + 2 service + 4 integration).

### Step 6: Commit

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend && \
  git add backend/src/app/api/v1/endpoints/leads.py \
          backend/tests/integration/test_leads.py && \
  git commit -m "feat(backend): implement GET /api/v1/leads with JWT auth"
```

---

## Task 5: Frontend — apiGet + dashboard leads fetch

**Files:**
- Modify: `frontend/src/lib/api/client.ts`
- Modify: `frontend/src/app/(dashboard)/dashboard/page.tsx`
- Modify: `frontend/src/app/(dashboard)/dashboard/__tests__/page.test.tsx`

### Step 1: Write the failing frontend tests

Replace `frontend/src/app/(dashboard)/dashboard/__tests__/page.test.tsx` (keeps all 4 existing tests, adds 4 new ones):

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
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Mock API client — define ApiRequestError here so instanceof checks work
// when the dashboard component throws/catches it through the mocked module.
class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

const mockApiGet = vi.fn();

vi.mock("@/lib/api/client", () => ({
  ApiRequestError,
  apiGet: (...args: unknown[]) => mockApiGet(...args),
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    // Default: authenticated requests return an empty leads list
    mockApiGet.mockResolvedValue([]);
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ── Existing tests ────────────────────────────────────────────────────

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
      await screen.findByRole("heading", { name: /^leads$/i }),
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

  // ── New tests ─────────────────────────────────────────────────────────

  it("shows loading state while fetching leads", async () => {
    localStorage.setItem("access_token", "test-token");
    mockApiGet.mockReturnValue(new Promise(() => {})); // never resolves
    render(<DashboardPage />);
    expect(await screen.findByText("Loading\u2026")).toBeInTheDocument();
  });

  it("renders leads returned by the API", async () => {
    localStorage.setItem("access_token", "test-token");
    mockApiGet.mockResolvedValue([
      {
        id: "abc123",
        name: "Ada Lovelace",
        email: "ada@example.com",
        created_at: "2024-01-01T00:00:00Z",
      },
    ]);
    render(<DashboardPage />);
    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
  });

  it("shows error banner when API returns non-401 error", async () => {
    localStorage.setItem("access_token", "test-token");
    mockApiGet.mockRejectedValue(new ApiRequestError(500, "Internal server error"));
    render(<DashboardPage />);
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Internal server error");
  });

  it("clears token and redirects to /login on 401 from API", async () => {
    localStorage.setItem("access_token", "test-token");
    mockApiGet.mockRejectedValue(new ApiRequestError(401, "Unauthorized"));
    render(<DashboardPage />);
    await waitFor(() => {
      expect(localStorage.getItem("access_token")).toBeNull();
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });
});
```

**Important note on the mock:** `vi.mock("@/lib/api/client", ...)` replaces all exports of the module in the test environment — including what `DashboardPage` imports. The `ApiRequestError` class defined in the mock factory is the same one used everywhere, so `err instanceof ApiRequestError` in the dashboard component correctly identifies the mocked errors.

### Step 2: Run to verify FAIL

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && \
  npx vitest run "src/app/\\(dashboard\\)/dashboard/__tests__/page.test.tsx" 2>&1 | tail -15
```

Expected: existing 4 tests fail or pass inconsistently; new 4 tests fail — `apiGet` not yet exported from client.ts, dashboard doesn't fetch.

### Step 3: Add apiGet to client.ts

Add to the end of `frontend/src/lib/api/client.ts` (after the existing `apiPost` function):

```typescript
export async function apiGet<TResponse>(
  path: string,
  token: string,
): Promise<TResponse> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({ detail: "Unknown error" }));
    const detail =
      typeof err.detail === "string"
        ? err.detail
        : err.detail.map((e) => e.msg).join(", ");
    throw new ApiRequestError(res.status, detail);
  }

  return res.json() as Promise<TResponse>;
}
```

### Step 4: Implement the updated dashboard page

Replace `frontend/src/app/(dashboard)/dashboard/page.tsx`:

```typescript
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ApiRequestError, apiGet } from "@/lib/api/client";

type Lead = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      router.push("/login");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  const fetchLeads = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiGet<Lead[]>("/api/v1/leads", token);
      setLeads(data);
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 401) {
        localStorage.removeItem("access_token");
        router.push("/login");
      } else {
        setError(err instanceof Error ? err.message : "Failed to load leads.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!isChecking) {
      void fetchLeads();
    }
  }, [isChecking, fetchLeads]);

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

        {error !== null && (
          <div
            role="alert"
            className="mt-4 rounded-lg bg-red-900/20 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </div>
        )}

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
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="py-16 text-center text-slate-500">
                    Loading…
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-16 text-center text-slate-500">
                    No leads yet.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-white/5">
                    <td className="px-6 py-4 text-white">{lead.name}</td>
                    <td className="px-6 py-4 text-slate-300">{lead.email}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
```

**Important notes:**
- `useCallback` wraps `fetchLeads` — gives it a stable reference so the second `useEffect` (which lists `fetchLeads` as a dependency) doesn't loop on every render.
- `void fetchLeads()` discards the Promise — prevents the `no-floating-promises` ESLint rule from flagging it.
- `error !== null` (not just `error`) is the condition — explicit null check, no accidental truthy/falsy issues.
- The `Lead` type is a local inline type matching the `LeadRead` backend schema — no shared type package needed yet (YAGNI).

### Step 5: Run to verify PASS

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && \
  npx vitest run "src/app/\\(dashboard\\)/dashboard/__tests__/page.test.tsx" 2>&1 | tail -10
```

Expected: 8 tests PASS (4 existing + 4 new).

### Step 6: Run full frontend suite

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && \
  npx vitest run 2>&1 | tail -10
```

Expected: 55 tests, all green (51 existing + 4 new).

### Step 7: Commit

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend && \
  git add "frontend/src/lib/api/client.ts" \
          "frontend/src/app/(dashboard)/dashboard/page.tsx" \
          "frontend/src/app/(dashboard)/dashboard/__tests__/page.test.tsx" && \
  git commit -m "feat(frontend): wire dashboard to GET /api/v1/leads with loading/error states"
```

---

## Task 6: Final verification + push

### Step 1: Type-check frontend

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && npm run type-check 2>&1 | tail -5
```

Expected: exit 0, no errors.

### Step 2: Lint frontend

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && npm run lint 2>&1 | tail -5
```

Expected: "No ESLint warnings or errors."

### Step 3: Full frontend suite

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && npx vitest run 2>&1 | tail -5
```

Expected: 55 tests green.

### Step 4: Full backend suite

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  python -m pytest 2>&1 | tail -5
```

Expected: 30 tests green.

### Step 5: Backend lint + type-check

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  ruff check src/ && mypy src/ 2>&1 | tail -5
```

Expected: no errors.

### Step 6: Push

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend && git push origin main
```

---

## File Map

```
backend/
├── src/app/core/security.py                    ← modified: +decode_access_token, +get_current_user
├── src/app/models/lead.py                      ← modified: +user_id FK, fix server_default
├── migrations/versions/0002_create_leads_table.py  ← new
├── src/app/repositories/lead_repository.py    ← implemented: get_leads_by_user_id
├── src/app/services/lead_service.py            ← implemented: list_leads
├── src/app/api/v1/endpoints/leads.py          ← implemented: GET /
├── tests/unit/test_leads_security.py           ← new: 3 tests
├── tests/unit/test_lead_service.py             ← new: 2 tests
└── tests/integration/test_leads.py             ← new: 4 tests

frontend/
├── src/lib/api/client.ts                       ← modified: +apiGet
├── src/app/(dashboard)/dashboard/page.tsx      ← modified: fetch leads, loading/error/populated
└── src/app/(dashboard)/dashboard/__tests__/page.test.tsx  ← modified: +4 new tests
```
