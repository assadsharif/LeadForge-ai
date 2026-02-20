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
    ) as mock_repo:
        result = await list_leads(mock_db, user_id)

    mock_repo.assert_called_once_with(mock_db, user_id)
    assert result == []
