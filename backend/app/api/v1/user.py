from fastapi import APIRouter, Depends, HTTPException
from requests import Session

from app.database import get_db
from app.schemas.user import APIKeyRequest, UpdateAPIKeyRequest, UserUpdateRequest
from app.repositories import user_repository
from app import requests


user_router = APIRouter()


@user_router.post("/request-api-key", status_code=200)
def request_user_api_key(api_key_request: APIKeyRequest, db: Session = Depends(get_db)):

    user = user_repository.get_user(db, api_key_request.email)

    if not user:
        user = user_repository.create_user(db, api_key_request)

    message = requests.request_api_key(user.email)

    return {
        "status": "success",
        "message": message,
        "data": None,
    }


@user_router.post("/save-api-key", status_code=201)
def save_user_api_key(
    api_key_request: UpdateAPIKeyRequest, db: Session = Depends(get_db)
):
    users = user_repository.get_users(db, n=1)

    if not users:
        raise HTTPException(status_code=404, detail="No User Exists!")

    user_repository.update_user_api_key(db, users[0].id, api_key_request.api_key)

    return {
        "status": "success",
        "message": "Api Key updated successfully!",
        "data": None,
    }


@user_router.get("/get-api-key", status_code=200)
def get_user_api_key(db: Session = Depends(get_db)):
    users = user_repository.get_users(db, n=1)

    if not users:
        raise HTTPException(status_code=404, detail="No User Exists!")

    api_key = user_repository.get_user_api_key(db)

    return {
        "status": "success",
        "message": "Api Key updated successfully!",
        "data": api_key,
    }


@user_router.get("/getme", status_code=200)
def get_user_api_key(db: Session = Depends(get_db)):
    user_email = "john.doe@example.com"
    user = user_repository.get_user(db, user_email)

    return {
        "status": "success",
        "message": "User details returned successfully!",
        "data": user,
    }


@user_router.put("/update-user-info")
async def update_user(user_update: UserUpdateRequest, db: Session = Depends(get_db)):
    user = user_repository.update_user(db, user_update)
    return {
        "status": "success",
        "message": "User details successfully updated!",
        "data": user,
    }