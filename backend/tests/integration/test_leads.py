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
