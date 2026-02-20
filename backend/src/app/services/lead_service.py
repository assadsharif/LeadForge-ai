import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.lead_repository import get_leads_by_user_id
from app.schemas.lead import LeadRead


async def list_leads(db: AsyncSession, user_id: uuid.UUID) -> list[LeadRead]:
    leads = await get_leads_by_user_id(db, user_id)
    return [LeadRead.model_validate(lead) for lead in leads]
