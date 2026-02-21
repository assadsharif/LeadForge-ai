import uuid
from datetime import UTC, datetime
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import HTTPException

from app.models.lead import Lead
from app.schemas.lead import LeadCreate, LeadRead
from app.services.lead_service import create_lead, list_leads


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
    ) as mock_repo:
        result = await list_leads(mock_db, user_id)

    mock_repo.assert_called_once_with(mock_db, user_id)
    assert result == []


@pytest.mark.asyncio
async def test_create_lead_success() -> None:
    user_id = uuid.uuid4()
    mock_db = AsyncMock()
    data = LeadCreate(email="ada@example.com", name="Ada Lovelace")
    new_lead = _mock_lead(user_id)
    with (
        patch(
            "app.services.lead_service.get_lead_by_email",
            new_callable=AsyncMock,
            return_value=None,
        ) as mock_get,
        patch(
            "app.services.lead_service.repo_create_lead",
            new_callable=AsyncMock,
            return_value=new_lead,
        ) as mock_create,
    ):
        result = await create_lead(mock_db, user_id, data)

    mock_get.assert_called_once_with(mock_db, "ada@example.com")
    mock_create.assert_called_once_with(
        mock_db, user_id=user_id, email="ada@example.com", name="Ada Lovelace"
    )
    assert isinstance(result, LeadRead)
    assert result.email == "ada@example.com"


@pytest.mark.asyncio
async def test_create_lead_duplicate_email_raises_409() -> None:
    user_id = uuid.uuid4()
    mock_db = AsyncMock()
    data = LeadCreate(email="ada@example.com", name="Ada Lovelace")
    with (
        patch(
            "app.services.lead_service.get_lead_by_email",
            new_callable=AsyncMock,
            return_value=_mock_lead(user_id),
        ),
        pytest.raises(HTTPException) as exc_info,
    ):
        await create_lead(mock_db, user_id, data)

    assert exc_info.value.status_code == 409
