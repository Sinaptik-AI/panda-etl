from sqlalchemy.orm import Session

from app import models
from app.schemas.user import APIKeyRequest


def create_user(db: Session, user: APIKeyRequest) -> models.User:
    new_user = models.User(username="BambooETL", email=user.email)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def get_user(db: Session, email: str) -> models.User:
    return db.query(models.User).filter(models.User.email == email).first()
