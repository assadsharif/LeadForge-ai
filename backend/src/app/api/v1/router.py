from fastapi import APIRouter

from app.api.v1.endpoints import health, leads

v1_router = APIRouter()
v1_router.include_router(health.router, prefix="/health", tags=["health"])
v1_router.include_router(leads.router, prefix="/leads", tags=["leads"])
