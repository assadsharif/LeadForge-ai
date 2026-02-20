import pytest
from pydantic import ValidationError

from app.schemas.auth import LoginRequest


def test_login_request_valid() -> None:
    req = LoginRequest(email="ada@example.com", password="s3cur3pass")
    assert req.email == "ada@example.com"


def test_login_request_invalid_email() -> None:
    with pytest.raises(ValidationError):
        LoginRequest(email="not-an-email", password="s3cur3pass")


def test_login_request_empty_password() -> None:
    with pytest.raises(ValidationError):
        LoginRequest(email="ada@example.com", password="")
