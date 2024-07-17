from fastapi import APIRouter
from .projects import project_router
from .user import user_router

v1_router = APIRouter()
v1_router.include_router(project_router, prefix="/projects")
v1_router.include_router(user_router, prefix="/user")
