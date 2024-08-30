from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app import models
from app.schemas.user import APIKeyRequest, UpdateAPIKeyRequest, UserUpdateRequest


def create_user(db: Session, user: APIKeyRequest) -> models.User:
    new_user = models.User(username="PandaETL", email=user.email)
    db.add(new_user)
    db.commit()
    return new_user


def get_user(db: Session, email: str) -> models.User:
    return db.query(models.User).filter(models.User.email == email).first()


def get_users(db: Session, n: int = 10) -> List[models.User]:
    return db.query(models.User).limit(n).all()


def add_user_api_key(db: Session, user_id: str, api_key: str):
    new_api_key = models.APIKey(user_id=user_id, key=api_key)
    db.add(new_api_key)
    db.commit()
    return new_api_key


def update_user_api_key(db: Session, user_id: str, new_api_key: str) -> models.APIKey:
    api_key_record = db.query(models.APIKey).filter_by(user_id=user_id).first()

    if api_key_record:
        api_key_record.api_key = new_api_key
    else:
        api_key_record = models.APIKey(user_id=user_id, key=new_api_key)
        db.add(api_key_record)

    db.commit()

    return api_key_record


def get_user_api_key(db: Session, user_id: str = None):
    if not user_id:
        return db.query(models.APIKey).first()

    return db.query(models.APIKey).filter(models.APIKey.user_id == user_id).first()


def update_user(db: Session, user_update: UserUpdateRequest):
    user = get_user(db, user_update.email)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    user.email = user_update.email
    if user_update.first_name is not None:
        user.first_name = user_update.first_name
    if user_update.last_name is not None:
        user.last_name = user_update.last_name

    db.commit()
    return user