import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.lead import LeadCreate, LeadRead
from app.services.lead_service import create_lead, list_leads

router = APIRouter()


@router.get("", response_model=list[LeadRead], status_code=200)
async def list_leads_endpoint(
    user_id: uuid.UUID = Depends(get_current_user),  # noqa: B008
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> list[LeadRead]:
    return await list_leads(db, user_id)


@router.post("", response_model=LeadRead, status_code=status.HTTP_201_CREATED)
async def create_lead_endpoint(
    body: LeadCreate,
    user_id: uuid.UUID = Depends(get_current_user),  # noqa: B008
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> LeadRead:
    return await create_lead(db, user_id, body)
