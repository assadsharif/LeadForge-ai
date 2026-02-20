import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lead import Lead


async def get_leads_by_user_id(
    session: AsyncSession, user_id: uuid.UUID
) -> list[Lead]:
    result = await session.execute(
        select(Lead)
        .where(Lead.user_id == user_id)
        .order_by(Lead.created_at.desc())
    )
    return list(result.scalars().all())
