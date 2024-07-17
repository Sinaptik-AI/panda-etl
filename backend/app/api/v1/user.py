from fastapi import APIRouter, Depends
from requests import Session

from app.database import get_db
from app.schemas.user import APIKeyRequest
from app.repositories import user_repository
from app import requests


user_router = APIRouter()


@user_router.post("/request-api-key", status_code=201)
def get_user_api_key(api_key_request: APIKeyRequest, db: Session = Depends(get_db)):

    user = user_repository.get_user(db, api_key_request.email)

    if not user:
        user = user_repository.create_user(db, api_key_request)

    message = requests.request_api_key(user.email)

    return {
        "status": "success",
        "message": message,
        "data": None,
    }
