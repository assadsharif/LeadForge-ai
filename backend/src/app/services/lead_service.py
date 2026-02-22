import uuid

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.lead_repository import (
    create_lead as repo_create_lead,
)
from app.repositories.lead_repository import (
    get_lead_by_email,
    get_lead_by_id,
    get_leads_by_user_id,
)
from app.schemas.lead import EnrichResponse, LeadCreate, LeadRead
from app.services.ai.client import enrich_lead as ai_enrich_lead


async def list_leads(db: AsyncSession, user_id: uuid.UUID) -> list[LeadRead]:
    leads = await get_leads_by_user_id(db, user_id)
    return [LeadRead.model_validate(lead) for lead in leads]


async def get_lead(db: AsyncSession, user_id: uuid.UUID, lead_id: uuid.UUID) -> LeadRead:
    lead = await get_lead_by_id(db, lead_id, user_id)
    if lead is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return LeadRead.model_validate(lead)


async def enrich_lead(db: AsyncSession, user_id: uuid.UUID, lead_id: uuid.UUID) -> EnrichResponse:
    lead_read = await get_lead(db, user_id, lead_id)
    result = await ai_enrich_lead(lead_read.name, lead_read.email)
    return EnrichResponse(
        summary=result.get("summary", ""),
        outreach_email=result.get("outreach_email", ""),
    )


async def create_lead(
    db: AsyncSession, user_id: uuid.UUID, data: LeadCreate
) -> LeadRead:
    existing = await get_lead_by_email(db, data.email, user_id)
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A lead with this email already exists",
        )
    try:
        lead = await repo_create_lead(db, user_id=user_id, email=data.email, name=data.name)
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A lead with this email already exists",
        ) from None
    return LeadRead.model_validate(lead)
