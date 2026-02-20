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
