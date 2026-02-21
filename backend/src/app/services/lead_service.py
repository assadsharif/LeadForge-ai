import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.lead_repository import (
    create_lead as repo_create_lead,
)
from app.repositories.lead_repository import (
    get_lead_by_email,
    get_leads_by_user_id,
)
from app.schemas.lead import LeadCreate, LeadRead


async def list_leads(db: AsyncSession, user_id: uuid.UUID) -> list[LeadRead]:
    leads = await get_leads_by_user_id(db, user_id)
    return [LeadRead.model_validate(lead) for lead in leads]


async def create_lead(
    db: AsyncSession, user_id: uuid.UUID, data: LeadCreate
) -> LeadRead:
    existing = await get_lead_by_email(db, data.email)
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A lead with this email already exists",
        )
    lead = await repo_create_lead(db, user_id=user_id, email=data.email, name=data.name)
    return LeadRead.model_validate(lead)
