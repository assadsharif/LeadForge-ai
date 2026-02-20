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
