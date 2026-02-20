import uuid
from datetime import UTC, datetime
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
        created_at=datetime(2024, 1, 1, tzinfo=UTC),
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
        created_at=datetime(2024, 1, 1, tzinfo=UTC),
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
