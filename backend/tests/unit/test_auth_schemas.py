from pydantic import ValidationError
import pytest

from app.schemas.auth import RegisterRequest


def test_register_request_valid() -> None:
    req = RegisterRequest(
        full_name="Ada Lovelace",
        email="ada@example.com",
        password="s3cur3pass",
    )
    assert req.email == "ada@example.com"


def test_register_request_invalid_email() -> None:
    with pytest.raises(ValidationError):
        RegisterRequest(full_name="Ada", email="not-an-email", password="s3cur3pass")


def test_register_request_short_password() -> None:
    with pytest.raises(ValidationError):
        RegisterRequest(full_name="Ada", email="ada@example.com", password="short")
