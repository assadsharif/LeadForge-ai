import uuid
from unittest.mock import AsyncMock, MagicMock

from app.models.user import User
from app.repositories.user_repository import create_user, get_user_by_email


async def test_get_user_by_email_found() -> None:
    mock_session = AsyncMock()
    mock_result = MagicMock()
    expected_user = User(id=uuid.uuid4(), email="ada@example.com", full_name="Ada", hashed_password="x")
    mock_result.scalar_one_or_none.return_value = expected_user
    mock_session.execute.return_value = mock_result

    result = await get_user_by_email(mock_session, "ada@example.com")

    assert result == expected_user
    mock_session.execute.assert_called_once()


async def test_get_user_by_email_not_found() -> None:
    mock_session = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_session.execute.return_value = mock_result

    result = await get_user_by_email(mock_session, "notfound@example.com")

    assert result is None


async def test_create_user() -> None:
    mock_session = AsyncMock()

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
