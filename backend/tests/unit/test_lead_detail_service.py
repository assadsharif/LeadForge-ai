import uuid
from datetime import UTC, datetime
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import HTTPException

from app.models.lead import Lead
from app.schemas.lead import EnrichResponse, LeadRead
from app.services.lead_service import enrich_lead, get_lead


def _mock_lead(user_id: uuid.UUID, lead_id: uuid.UUID | None = None) -> Lead:
    return Lead(
        id=lead_id or uuid.uuid4(),
        user_id=user_id,
        email="ada@example.com",
        name="Ada Lovelace",
        created_at=datetime(2024, 1, 1, tzinfo=UTC),
    )


# ── get_lead ─────────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_get_lead_returns_lead_read() -> None:
    user_id = uuid.uuid4()
    lead_id = uuid.uuid4()
    mock_db = AsyncMock()
    mock_lead = _mock_lead(user_id, lead_id)
    with patch(
        "app.services.lead_service.get_lead_by_id",
        new_callable=AsyncMock,
        return_value=mock_lead,
    ) as mock_repo:
        result = await get_lead(mock_db, user_id, lead_id)

    mock_repo.assert_called_once_with(mock_db, lead_id, user_id)
    assert isinstance(result, LeadRead)
    assert result.email == "ada@example.com"
    assert result.id == lead_id


@pytest.mark.asyncio
async def test_get_lead_not_found_raises_404() -> None:
    user_id = uuid.uuid4()
    lead_id = uuid.uuid4()
    mock_db = AsyncMock()
    with (
        patch(
            "app.services.lead_service.get_lead_by_id",
            new_callable=AsyncMock,
            return_value=None,
        ),
        pytest.raises(HTTPException) as exc_info,
    ):
        await get_lead(mock_db, user_id, lead_id)

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Lead not found"


# ── enrich_lead ──────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_enrich_lead_returns_enrich_response() -> None:
    user_id = uuid.uuid4()
    lead_id = uuid.uuid4()
    mock_db = AsyncMock()
    mock_lead = _mock_lead(user_id, lead_id)
    ai_result = {
        "summary": "Ada Lovelace is a pioneering programmer.",
        "outreach_email": "Hi Ada, reaching out!",
    }
    with (
        patch(
            "app.services.lead_service.get_lead_by_id",
            new_callable=AsyncMock,
            return_value=mock_lead,
        ),
        patch(
            "app.services.lead_service.ai_enrich_lead",
            new_callable=AsyncMock,
            return_value=ai_result,
        ) as mock_ai,
    ):
        result = await enrich_lead(mock_db, user_id, lead_id)

    mock_ai.assert_called_once_with("Ada Lovelace", "ada@example.com")
    assert isinstance(result, EnrichResponse)
    assert result.summary == "Ada Lovelace is a pioneering programmer."
    assert result.outreach_email == "Hi Ada, reaching out!"


@pytest.mark.asyncio
async def test_enrich_lead_raises_404_when_lead_missing() -> None:
    user_id = uuid.uuid4()
    lead_id = uuid.uuid4()
    mock_db = AsyncMock()
    with (
        patch(
            "app.services.lead_service.get_lead_by_id",
            new_callable=AsyncMock,
            return_value=None,
        ),
        pytest.raises(HTTPException) as exc_info,
    ):
        await enrich_lead(mock_db, user_id, lead_id)

    assert exc_info.value.status_code == 404
