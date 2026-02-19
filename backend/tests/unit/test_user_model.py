import uuid

from app.models.user import User


def test_user_model_attributes() -> None:
    user = User(
        id=uuid.uuid4(),
        full_name="Ada Lovelace",
        email="ada@example.com",
        hashed_password="$2b$12$hashed",
    )
    assert user.full_name == "Ada Lovelace"
    assert user.email == "ada@example.com"
    assert user.__tablename__ == "users"
