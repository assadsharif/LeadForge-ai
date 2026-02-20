
from app.core.security import create_access_token, hash_password, verify_password


def test_hash_password_is_not_plain() -> None:
    hashed = hash_password("mysecret")
    assert hashed != "mysecret"
    assert hashed.startswith("$2b$")


def test_verify_password_correct() -> None:
    hashed = hash_password("mysecret")
    assert verify_password("mysecret", hashed) is True


def test_verify_password_wrong() -> None:
    hashed = hash_password("mysecret")
    assert verify_password("wrong", hashed) is False


def test_create_access_token_returns_string() -> None:
    token = create_access_token({"sub": "user-id-123"})
    assert isinstance(token, str)
    assert len(token) > 10
