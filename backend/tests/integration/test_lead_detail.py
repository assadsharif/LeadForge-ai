import uuid
from collections.abc import Generator
from datetime import UTC, datetime
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import HTTPException, status
from httpx import AsyncClient

from app.core.security import get_current_user
from app.main import app
from app.schemas.lead import EnrichResponse, LeadRead


@pytest.fixture(autouse=True)
def clear_overrides() -> Generator[None, None, None]:
    yield
    app.dependency_overrides.clear()


def _lead(lead_id: uuid.UUID | None = None) -> LeadRead:
    return LeadRead(
        id=lead_id or uuid.uuid4(),
        email="ada@example.com",
        name="Ada Lovelace",
        created_at=datetime(2024, 1, 1, tzinfo=UTC),
    )


# ── GET /api/v1/leads/{lead_id} ──────────────────────────────────────────────


@pytest.mark.asyncio
async def test_get_lead_no_auth(client: AsyncClient) -> None:
    response = await client.get(f"/api/v1/leads/{uuid.uuid4()}")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_lead_invalid_token(client: AsyncClient) -> None:
    response = await client.get(
        f"/api/v1/leads/{uuid.uuid4()}",
        headers={"Authorization": "Bearer not-a-valid-jwt"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_lead_returns_lead(client: AsyncClient) -> None:
    user_id = uuid.uuid4()
    lead_id = uuid.uuid4()
    lead = _lead(lead_id)
    app.dependency_overrides[get_current_user] = lambda: user_id
    with patch(
        "app.api.v1.endpoints.leads.get_lead",
        new_callable=AsyncMock,
        return_value=lead,
    ) as mock_get:
        response = await client.get(
            f"/api/v1/leads/{lead_id}",
            headers={"Authorization": "Bearer any-token"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "ada@example.com"
    assert data["name"] == "Ada Lovelace"
    mock_get.assert_called_once()
    assert mock_get.call_args.args[1] == user_id
    assert mock_get.call_args.args[2] == lead_id


@pytest.mark.asyncio
async def test_get_lead_not_found(client: AsyncClient) -> None:
    user_id = uuid.uuid4()
    app.dependency_overrides[get_current_user] = lambda: user_id
    with patch(
        "app.api.v1.endpoints.leads.get_lead",
        new_callable=AsyncMock,
        side_effect=HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found"),
    ):
        response = await client.get(
            f"/api/v1/leads/{uuid.uuid4()}",
            headers={"Authorization": "Bearer any-token"},
        )
    assert response.status_code == 404
    assert response.json()["detail"] == "Lead not found"


# ── POST /api/v1/leads/{lead_id}/enrich ─────────────────────────────────────


@pytest.mark.asyncio
async def test_enrich_lead_no_auth(client: AsyncClient) -> None:
    response = await client.post(f"/api/v1/leads/{uuid.uuid4()}/enrich")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_enrich_lead_returns_enrichment(client: AsyncClient) -> None:
    user_id = uuid.uuid4()
    lead_id = uuid.uuid4()
    enrichment = EnrichResponse(
        summary="Ada Lovelace is a pioneering programmer.",
        outreach_email="Hi Ada, I'd love to connect!",
    )
    app.dependency_overrides[get_current_user] = lambda: user_id
    with patch(
        "app.api.v1.endpoints.leads.enrich_lead",
        new_callable=AsyncMock,
        return_value=enrichment,
    ) as mock_enrich:
        response = await client.post(
            f"/api/v1/leads/{lead_id}/enrich",
            headers={"Authorization": "Bearer any-token"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["summary"] == "Ada Lovelace is a pioneering programmer."
    assert data["outreach_email"] == "Hi Ada, I'd love to connect!"
    mock_enrich.assert_called_once()
    assert mock_enrich.call_args.args[1] == user_id
    assert mock_enrich.call_args.args[2] == lead_id


@pytest.mark.asyncio
async def test_enrich_lead_not_found(client: AsyncClient) -> None:
    user_id = uuid.uuid4()
    app.dependency_overrides[get_current_user] = lambda: user_id
    with patch(
        "app.api.v1.endpoints.leads.enrich_lead",
        new_callable=AsyncMock,
        side_effect=HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found"),
    ):
        response = await client.post(
            f"/api/v1/leads/{uuid.uuid4()}/enrich",
            headers={"Authorization": "Bearer any-token"},
        )
    assert response.status_code == 404
