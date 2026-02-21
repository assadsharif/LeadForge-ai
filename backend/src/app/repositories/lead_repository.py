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


async def get_lead_by_email(session: AsyncSession, email: str) -> Lead | None:
    result = await session.execute(select(Lead).where(Lead.email == email))
    return result.scalar_one_or_none()


async def create_lead(
    session: AsyncSession,
    *,
    user_id: uuid.UUID,
    email: str,
    name: str,
) -> Lead:
    lead = Lead(user_id=user_id, email=email, name=name)
    session.add(lead)
    await session.commit()
    await session.refresh(lead)
    return lead
