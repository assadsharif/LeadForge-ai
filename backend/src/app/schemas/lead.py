import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class LeadCreate(BaseModel):
    email: EmailStr
    name: str


class LeadRead(BaseModel):
    id: uuid.UUID
    email: str
    name: str
    created_at: datetime

    model_config = {"from_attributes": True}
