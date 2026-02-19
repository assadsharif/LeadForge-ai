from pydantic import BaseModel


class ErrorResponse(BaseModel):
    detail: str
    code: str
    field: str | None = None
