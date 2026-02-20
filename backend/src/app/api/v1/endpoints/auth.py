from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import create_access_token, hash_password
from app.repositories.user_repository import create_user, get_user_by_email
from app.schemas.auth import RegisterRequest, RegisterResponse, UserResponse

router = APIRouter()


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    body: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> RegisterResponse:
    existing = await get_user_by_email(db, body.email)
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    hashed = hash_password(body.password)
    user = await create_user(
        db,
        full_name=body.full_name,
        email=body.email,
        hashed_password=hashed,
    )

    token = create_access_token({"sub": str(user.id)})
    return RegisterResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )
