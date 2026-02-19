# Register Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build end-to-end user registration — FastAPI `/auth/register` endpoint + Next.js
register form — so a new user can create an account and land on `/dashboard`.

**Architecture:** FastAPI handles user creation (bcrypt hashed password, PostgreSQL `users`
table, returns JWT). Next.js `RegisterForm` posts to the API, stores the token in
`localStorage`, and redirects to `/dashboard`. All new backend deps installed via `uv`;
all frontend code uses already-installed `react-hook-form` + `zod` + `lucide-react`.

**Tech Stack:** FastAPI · SQLAlchemy 2 async · asyncpg · passlib[bcrypt] · python-jose ·
Alembic · Next.js 14 App Router · react-hook-form · zod · Vitest + RTL · pytest-asyncio

**Design doc:** `docs/plans/2026-02-20-register-page-design.md`

---

## Phase 0: Backend Dependencies

### Task 1: Install passlib + python-jose

**Files:**
- Modify: `backend/pyproject.toml`

**Step 1: Add deps to pyproject.toml**

In `backend/pyproject.toml`, add to the `dependencies` list:

```toml
"passlib[bcrypt]>=1.7.4",
"python-jose[cryptography]>=3.3.0",
```

**Step 2: Sync**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  /home/asad/.local/bin/uv sync 2>&1 | tail -5
```

Expected: `Resolved ... packages` — exit 0.

**Step 3: Verify import**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  /home/asad/.local/bin/uv run python -c "from passlib.context import CryptContext; from jose import jwt; print('ok')"
```

Expected: `ok`

**Step 4: Commit**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend && \
  git add backend/pyproject.toml backend/uv.lock && \
  git commit -m "chore(backend): add passlib + python-jose dependencies"
```

---

## Phase 1: Backend

### Task 2: User model

**Files:**
- Create: `backend/src/app/models/user.py`
- Modify: `backend/src/app/models/__init__.py`

**Step 1: Write the failing test**

Create `backend/tests/unit/test_user_model.py`:

```python
import uuid

import pytest

from app.models.user import User


def test_user_model_attributes() -> None:
    user = User(
        id=uuid.uuid4(),
        full_name="Ada Lovelace",
        email="ada@example.com",
        hashed_password="$2b$12$hashed",
    )
    assert user.full_name == "Ada Lovelace"
    assert user.email == "ada@example.com"
    assert user.__tablename__ == "users"
```

**Step 2: Run test to verify it fails**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  /home/asad/.local/bin/uv run pytest tests/unit/test_user_model.py -v 2>&1 | tail -15
```

Expected: FAIL — `ModuleNotFoundError: No module named 'app.models.user'`

**Step 3: Implement User model**

Create `backend/src/app/models/user.py`:

```python
import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
```

Update `backend/src/app/models/__init__.py` so Alembic's `env.py` picks up the model
when it imports `Base.metadata`:

```python
from app.models.base import Base
from app.models.lead import Lead
from app.models.user import User

__all__ = ["Base", "Lead", "User"]
```

**Step 4: Run test to verify it passes**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  /home/asad/.local/bin/uv run pytest tests/unit/test_user_model.py -v 2>&1 | tail -10
```

Expected: PASS (1 test)

**Step 5: Commit**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend && \
  git add backend/src/app/models/user.py backend/src/app/models/__init__.py \
          backend/tests/unit/test_user_model.py && \
  git commit -m "feat(backend): add User SQLAlchemy model"
```

---

### Task 3: Auth schemas (Pydantic)

**Files:**
- Create: `backend/src/app/schemas/auth.py`

**Step 1: Write the failing test**

Create `backend/tests/unit/test_auth_schemas.py`:

```python
import pytest
from pydantic import ValidationError

from app.schemas.auth import RegisterRequest


def test_register_request_valid() -> None:
    req = RegisterRequest(
        full_name="Ada Lovelace",
        email="ada@example.com",
        password="s3cur3pass",
    )
    assert req.email == "ada@example.com"


def test_register_request_invalid_email() -> None:
    with pytest.raises(ValidationError):
        RegisterRequest(full_name="Ada", email="not-an-email", password="s3cur3pass")


def test_register_request_short_password() -> None:
    with pytest.raises(ValidationError):
        RegisterRequest(full_name="Ada", email="ada@example.com", password="short")
```

**Step 2: Run test to verify it fails**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  /home/asad/.local/bin/uv run pytest tests/unit/test_auth_schemas.py -v 2>&1 | tail -15
```

Expected: FAIL — `ImportError`

**Step 3: Implement schemas**

Create `backend/src/app/schemas/auth.py`:

```python
import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, field_validator


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str

    @field_validator("full_name")
    @classmethod
    def name_min_length(cls, v: str) -> str:
        if len(v.strip()) < 2:
            raise ValueError("Full name must be at least 2 characters")
        return v.strip()

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class RegisterResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
```

**Step 4: Run test to verify it passes**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  /home/asad/.local/bin/uv run pytest tests/unit/test_auth_schemas.py -v 2>&1 | tail -10
```

Expected: PASS (3 tests)

**Step 5: Commit**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend && \
  git add backend/src/app/schemas/auth.py backend/tests/unit/test_auth_schemas.py && \
  git commit -m "feat(backend): add auth Pydantic schemas"
```

---

### Task 4: Security utilities (password hashing + JWT)

**Files:**
- Modify: `backend/src/app/core/security.py`

**Step 1: Write the failing test**

Create `backend/tests/unit/test_security.py`:

```python
import pytest

from app.core.security import create_access_token, hash_password, verify_password


def test_hash_password_is_not_plain() -> None:
    hashed = hash_password("mysecret")
    assert hashed != "mysecret"
    assert hashed.startswith("$2b$")


def test_verify_password_correct() -> None:
    hashed = hash_password("mysecret")
    assert verify_password("mysecret", hashed) is True


def test_verify_password_wrong() -> None:
    hashed = hash_password("mysecret")
    assert verify_password("wrong", hashed) is False


def test_create_access_token_returns_string() -> None:
    token = create_access_token({"sub": "user-id-123"})
    assert isinstance(token, str)
    assert len(token) > 10
```

**Step 2: Run test to verify it fails**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  /home/asad/.local/bin/uv run pytest tests/unit/test_security.py -v 2>&1 | tail -15
```

Expected: FAIL — `ImportError` (security.py is a stub)

**Step 3: Implement security utilities**

Replace `backend/src/app/core/security.py`:

```python
from datetime import UTC, datetime, timedelta

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ACCESS_TOKEN_EXPIRE_DAYS = 7
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return _pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return _pwd_context.verify(plain_password, hashed_password)  # type: ignore[return-value]


def create_access_token(
    data: dict[str, object],
    expires_delta: timedelta | None = None,
) -> str:
    to_encode = data.copy()
    expire = datetime.now(UTC) + (
        expires_delta or timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    )
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
```

**Step 4: Run test to verify it passes**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  /home/asad/.local/bin/uv run pytest tests/unit/test_security.py -v 2>&1 | tail -10
```

Expected: PASS (4 tests)

Note: `settings` reads from `.env`. If `SECRET_KEY` is missing the test will fail with a
`ValidationError`. Create `backend/.env` with at minimum:

```
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/leadforge
SECRET_KEY=test-secret-key-for-unit-tests-only
```

**Step 5: Commit**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend && \
  git add backend/src/app/core/security.py backend/tests/unit/test_security.py && \
  git commit -m "feat(backend): implement password hashing and JWT token creation"
```

---

### Task 5: User repository

**Files:**
- Create: `backend/src/app/repositories/user_repository.py`

**Step 1: Write the failing test**

Create `backend/tests/unit/test_user_repository.py`:

```python
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.models.user import User
from app.repositories.user_repository import create_user, get_user_by_email


@pytest.mark.asyncio
async def test_get_user_by_email_found() -> None:
    mock_session = AsyncMock()
    mock_result = MagicMock()
    expected_user = User(id=uuid.uuid4(), email="ada@example.com", full_name="Ada", hashed_password="x")
    mock_result.scalar_one_or_none.return_value = expected_user
    mock_session.execute.return_value = mock_result

    result = await get_user_by_email(mock_session, "ada@example.com")

    assert result == expected_user
    mock_session.execute.assert_called_once()


@pytest.mark.asyncio
async def test_get_user_by_email_not_found() -> None:
    mock_session = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_session.execute.return_value = mock_result

    result = await get_user_by_email(mock_session, "notfound@example.com")

    assert result is None


@pytest.mark.asyncio
async def test_create_user() -> None:
    mock_session = AsyncMock()
    user_id = uuid.uuid4()

    created = await create_user(
        mock_session,
        full_name="Ada Lovelace",
        email="ada@example.com",
        hashed_password="$2b$12$hashed",
    )

    mock_session.add.assert_called_once()
    mock_session.commit.assert_called_once()
    mock_session.refresh.assert_called_once()
    assert isinstance(created, User)
    assert created.email == "ada@example.com"
```

**Step 2: Run test to verify it fails**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  /home/asad/.local/bin/uv run pytest tests/unit/test_user_repository.py -v 2>&1 | tail -15
```

Expected: FAIL — `ImportError`

**Step 3: Implement user repository**

Create `backend/src/app/repositories/user_repository.py`:

```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


async def get_user_by_email(session: AsyncSession, email: str) -> User | None:
    result = await session.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def create_user(
    session: AsyncSession,
    *,
    full_name: str,
    email: str,
    hashed_password: str,
) -> User:
    user = User(full_name=full_name, email=email, hashed_password=hashed_password)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user
```

**Step 4: Run test to verify it passes**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  /home/asad/.local/bin/uv run pytest tests/unit/test_user_repository.py -v 2>&1 | tail -10
```

Expected: PASS (3 tests)

**Step 5: Commit**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend && \
  git add backend/src/app/repositories/user_repository.py \
          backend/tests/unit/test_user_repository.py && \
  git commit -m "feat(backend): add user repository (get_user_by_email, create_user)"
```

---

### Task 6: Auth endpoint

**Files:**
- Create: `backend/src/app/api/v1/endpoints/auth.py`
- Modify: `backend/src/app/api/v1/router.py`

**Step 1: Write the failing test**

Create `backend/tests/integration/test_auth_register.py`:

```python
import uuid
from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient

from app.models.user import User


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient) -> None:
    mock_user = User(
        id=uuid.uuid4(),
        full_name="Ada Lovelace",
        email="ada@example.com",
        hashed_password="$2b$12$hashed",
    )

    with (
        patch(
            "app.api.v1.endpoints.auth.get_user_by_email",
            new_callable=AsyncMock,
            return_value=None,
        ),
        patch(
            "app.api.v1.endpoints.auth.create_user",
            new_callable=AsyncMock,
            return_value=mock_user,
        ),
    ):
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "full_name": "Ada Lovelace",
                "email": "ada@example.com",
                "password": "s3cur3pass",
            },
        )

    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "ada@example.com"


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient) -> None:
    existing_user = User(
        id=uuid.uuid4(),
        full_name="Ada Lovelace",
        email="ada@example.com",
        hashed_password="$2b$12$hashed",
    )

    with patch(
        "app.api.v1.endpoints.auth.get_user_by_email",
        new_callable=AsyncMock,
        return_value=existing_user,
    ):
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "full_name": "Ada Lovelace",
                "email": "ada@example.com",
                "password": "s3cur3pass",
            },
        )

    assert response.status_code == 409
    assert "already registered" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_register_validation_error(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/register",
        json={"full_name": "A", "email": "not-email", "password": "short"},
    )
    assert response.status_code == 422
```

**Step 2: Run test to verify it fails**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  /home/asad/.local/bin/uv run pytest tests/integration/test_auth_register.py -v 2>&1 | tail -15
```

Expected: FAIL — `404 Not Found` (route not registered yet)

**Step 3: Implement auth endpoint**

Create `backend/src/app/api/v1/endpoints/auth.py`:

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import create_access_token, hash_password
from app.repositories.user_repository import create_user, get_user_by_email
from app.schemas.auth import RegisterRequest, RegisterResponse, UserResponse

router = APIRouter()


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(
    body: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> RegisterResponse:
    existing = await get_user_by_email(db, body.email)
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    hashed = hash_password(body.password)
    user = await create_user(db, full_name=body.full_name, email=body.email, hashed_password=hashed)

    token = create_access_token({"sub": str(user.id)})
    return RegisterResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )
```

Update `backend/src/app/api/v1/router.py`:

```python
from fastapi import APIRouter

from app.api.v1.endpoints import auth, health, leads

v1_router = APIRouter()
v1_router.include_router(health.router, prefix="/health", tags=["health"])
v1_router.include_router(leads.router, prefix="/leads", tags=["leads"])
v1_router.include_router(auth.router, prefix="/auth", tags=["auth"])
```

**Step 4: Run test to verify it passes**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  /home/asad/.local/bin/uv run pytest tests/integration/test_auth_register.py -v 2>&1 | tail -10
```

Expected: PASS (3 tests)

**Step 5: Run full backend test suite**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  /home/asad/.local/bin/uv run pytest -v 2>&1 | tail -20
```

Expected: all tests green.

**Step 6: Commit**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend && \
  git add backend/src/app/api/v1/endpoints/auth.py \
          backend/src/app/api/v1/router.py \
          backend/tests/integration/test_auth_register.py && \
  git commit -m "feat(backend): add POST /auth/register endpoint"
```

---

### Task 7: Alembic migration — create users table

**Files:**
- Create: `backend/migrations/versions/0001_create_users_table.py`

**Step 1: Write the migration manually**

Create `backend/migrations/versions/0001_create_users_table.py`:

```python
"""create users table

Revision ID: 0001
Revises:
Create Date: 2026-02-20
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index("ix_users_email", "users", ["email"])


def downgrade() -> None:
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
```

**Step 2: Validate migration file syntax**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  /home/asad/.local/bin/uv run python -c "
import importlib.util, sys
spec = importlib.util.spec_from_file_location('m', 'migrations/versions/0001_create_users_table.py')
m = importlib.util.module_from_spec(spec)
print('Migration syntax OK')
"
```

Expected: `Migration syntax OK`

**Step 3: Commit**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend && \
  git add backend/migrations/versions/0001_create_users_table.py && \
  git commit -m "feat(backend): add Alembic migration for users table"
```

---

## Phase 2: Frontend

### Task 8: Zod schema + API client

**Files:**
- Modify: `frontend/src/lib/schemas/auth.ts`
- Modify: `frontend/src/lib/api/client.ts`
- Create: `frontend/.env.local` (if not present)

**Step 1: Write the failing test**

Create `frontend/src/lib/__tests__/auth-schema.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import { registerSchema } from "../schemas/auth";

describe("registerSchema", () => {
  it("accepts valid data", () => {
    const result = registerSchema.safeParse({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "s3cur3pass",
      confirmPassword: "s3cur3pass",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short name", () => {
    const result = registerSchema.safeParse({
      fullName: "A",
      email: "ada@example.com",
      password: "s3cur3pass",
      confirmPassword: "s3cur3pass",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      fullName: "Ada",
      email: "not-email",
      password: "s3cur3pass",
      confirmPassword: "s3cur3pass",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      fullName: "Ada",
      email: "ada@example.com",
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      fullName: "Ada",
      email: "ada@example.com",
      password: "s3cur3pass",
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && \
  npx vitest run src/lib/__tests__/auth-schema.test.ts 2>&1 | tail -15
```

Expected: FAIL — `Cannot find module '../schemas/auth'`

**Step 3: Implement Zod schema**

Replace `frontend/src/lib/schemas/auth.ts`:

```typescript
import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
```

**Step 4: Run test to verify it passes**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && \
  npx vitest run src/lib/__tests__/auth-schema.test.ts 2>&1 | tail -10
```

Expected: PASS (5 tests)

**Step 5: Implement API client**

Replace `frontend/src/lib/api/client.ts`:

```typescript
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type ApiError = {
  detail: string | { msg: string; loc: string[] }[];
};

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
  ) {
    super(detail);
    this.name = "ApiRequestError";
  }
}

export async function apiPost<TBody, TResponse>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
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

Create `frontend/.env.local` (if it doesn't exist):

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Step 6: Commit**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend && \
  git add frontend/src/lib/schemas/auth.ts \
          frontend/src/lib/api/client.ts \
          frontend/src/lib/__tests__/auth-schema.test.ts && \
  git commit -m "feat(frontend): add registerSchema and typed API client"
```

---

### Task 9: RegisterForm component

**Files:**
- Create: `frontend/src/components/auth/RegisterForm.tsx`
- Create: `frontend/src/components/auth/__tests__/RegisterForm.test.tsx`

**Step 1: Write the failing test**

Create `frontend/src/components/auth/__tests__/RegisterForm.test.tsx`:

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterForm } from "../RegisterForm";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  it("renders all form fields and submit button", () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("shows inline errors when submitted empty", async () => {
    render(<RegisterForm />);
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));
    expect(await screen.findByText(/at least 2 characters/i)).toBeInTheDocument();
  });

  it("shows error when passwords do not match", async () => {
    render(<RegisterForm />);
    await userEvent.type(screen.getByLabelText(/full name/i), "Ada Lovelace");
    await userEvent.type(screen.getByLabelText(/email/i), "ada@example.com");
    await userEvent.type(screen.getByLabelText(/^password/i), "s3cur3pass");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "different");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it("submits to API and redirects on success", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          access_token: "test-jwt",
          token_type: "bearer",
          user: { id: "uuid-1", email: "ada@example.com", full_name: "Ada Lovelace", created_at: new Date().toISOString() },
        }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      ),
    );

    render(<RegisterForm />);
    await userEvent.type(screen.getByLabelText(/full name/i), "Ada Lovelace");
    await userEvent.type(screen.getByLabelText(/email/i), "ada@example.com");
    await userEvent.type(screen.getByLabelText(/^password/i), "s3cur3pass");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "s3cur3pass");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows error banner on 409 conflict", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ detail: "Email already registered" }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      ),
    );

    render(<RegisterForm />);
    await userEvent.type(screen.getByLabelText(/full name/i), "Ada Lovelace");
    await userEvent.type(screen.getByLabelText(/email/i), "ada@example.com");
    await userEvent.type(screen.getByLabelText(/^password/i), "s3cur3pass");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "s3cur3pass");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      await screen.findByText(/already registered/i),
    ).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && \
  npx vitest run src/components/auth/__tests__/RegisterForm.test.tsx 2>&1 | tail -15
```

Expected: FAIL — `Cannot find module '../RegisterForm'`

**Step 3: Implement RegisterForm**

Create `frontend/src/components/auth/RegisterForm.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { registerSchema, type RegisterFormData } from "@/lib/schemas/auth";
import { apiPost, ApiRequestError } from "@/lib/api/client";

interface RegisterResponse {
  access_token: string;
  token_type: string;
  user: { id: string; email: string; full_name: string; created_at: string };
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

const errorClass = "mt-1 text-xs text-red-400";

const labelClass = "mb-1 block text-sm font-medium text-slate-300";

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    setServerError(null);
    try {
      const res = await apiPost<
        { full_name: string; email: string; password: string },
        RegisterResponse
      >("/api/v1/auth/register", {
        full_name: data.fullName,
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
        <label htmlFor="fullName" className={labelClass}>
          Full name
        </label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          placeholder="Ada Lovelace"
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? "fullName-error" : undefined}
          className={inputClass}
          {...register("fullName")}
        />
        {errors.fullName && (
          <p id="fullName-error" className={errorClass}>
            {errors.fullName.message}
          </p>
        )}
      </div>

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
          aria-describedby={errors.email ? "email-error" : undefined}
          className={inputClass}
          {...register("email")}
        />
        {errors.email && (
          <p id="email-error" className={errorClass}>
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
          className={inputClass}
          {...register("password")}
        />
        {errors.password && (
          <p id="password-error" className={errorClass}>
            {errors.password.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className={labelClass}>
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
          className={inputClass}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p id="confirmPassword-error" className={errorClass}>
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Create account
      </button>
    </form>
  );
}
```

Note: `@hookform/resolvers` is not yet installed. Install it first:

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && npm install @hookform/resolvers
```

**Step 4: Run test to verify it passes**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && \
  npx vitest run src/components/auth/__tests__/RegisterForm.test.tsx 2>&1 | tail -15
```

Expected: PASS (5 tests)

**Step 5: Commit**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend && \
  git add frontend/src/components/auth/RegisterForm.tsx \
          frontend/src/components/auth/__tests__/RegisterForm.test.tsx \
          frontend/package.json frontend/package-lock.json && \
  git commit -m "feat(frontend): add RegisterForm component with validation and API call"
```

---

### Task 10: Register page shell

**Files:**
- Modify: `frontend/src/app/(auth)/register/page.tsx`

**Step 1: Write the failing test**

Create `frontend/src/app/(auth)/register/__tests__/page.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RegisterPage from "../page";

describe("RegisterPage", () => {
  it("renders page heading", () => {
    render(<RegisterPage />);
    expect(
      screen.getByRole("heading", { name: /create your account/i })
    ).toBeInTheDocument();
  });

  it("renders login link", () => {
    render(<RegisterPage />);
    const link = screen.getByRole("link", { name: /log in/i });
    expect(link).toHaveAttribute("href", "/login");
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && \
  npx vitest run "src/app/\(auth\)/register/__tests__/page.test.tsx" 2>&1 | tail -15
```

Expected: FAIL — page renders `<div>Register</div>`, no heading found.

**Step 3: Implement register page**

Replace `frontend/src/app/(auth)/register/page.tsx`:

```typescript
import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create your account — LeadForge AI",
  description: "Sign up for LeadForge AI and start capturing smarter leads.",
};

export default function RegisterPage() {
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
            Create your account
          </h1>
          <RegisterForm />
        </div>

        {/* Footer link */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && \
  npx vitest run "src/app/\(auth\)/register/__tests__/page.test.tsx" 2>&1 | tail -10
```

Expected: PASS (2 tests)

**Step 5: Run full frontend test suite**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && \
  npx vitest run 2>&1 | tail -15
```

Expected: all tests green (24 original + 7 new = 31 tests).

**Step 6: Commit**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend && \
  git add "frontend/src/app/(auth)/register/page.tsx" \
          "frontend/src/app/(auth)/register/__tests__/page.test.tsx" && \
  git commit -m "feat(frontend): implement register page UI"
```

---

## Phase 3: Verification

### Task 11: Final type-check, lint, and push

**Step 1: Frontend type-check**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && npm run type-check 2>&1 | tail -10
```

Expected: exit 0.

**Step 2: Frontend lint**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/frontend && npm run lint 2>&1 | tail -5
```

Expected: "No ESLint warnings or errors."

**Step 3: Backend type-check (mypy)**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  /home/asad/.local/bin/uv run mypy src/ 2>&1 | tail -10
```

Expected: "Success: no issues found" (or minimal pre-existing issues).

**Step 4: Backend linter (ruff)**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend/backend && \
  /home/asad/.local/bin/uv run ruff check src/ 2>&1 | tail -5
```

Expected: "All checks passed."

**Step 5: Push**

```bash
cd /mnt/c/Users/HomePC/Desktop/CODE/frontend && git push origin main
```

---

## File Map

```
backend/
├── pyproject.toml                              ← add passlib, python-jose
├── src/app/
│   ├── core/
│   │   └── security.py                         ← implement (was stub)
│   ├── models/
│   │   ├── __init__.py                         ← import User
│   │   └── user.py                             ← new
│   ├── schemas/
│   │   └── auth.py                             ← new
│   ├── repositories/
│   │   └── user_repository.py                  ← new
│   └── api/v1/
│       ├── router.py                           ← add auth router
│       └── endpoints/
│           └── auth.py                         ← new
├── migrations/versions/
│   └── 0001_create_users_table.py              ← new
└── tests/
    ├── unit/
    │   ├── test_user_model.py                  ← new
    │   ├── test_auth_schemas.py                ← new
    │   ├── test_security.py                    ← new
    │   └── test_user_repository.py             ← new
    └── integration/
        └── test_auth_register.py               ← new

frontend/src/
├── lib/
│   ├── schemas/auth.ts                         ← implement (was stub)
│   ├── api/client.ts                           ← implement (was stub)
│   └── __tests__/auth-schema.test.ts           ← new
├── components/auth/
│   ├── RegisterForm.tsx                        ← new
│   └── __tests__/RegisterForm.test.tsx         ← new
└── app/(auth)/register/
    ├── page.tsx                                ← replace stub
    └── __tests__/page.test.tsx                 ← new
```
