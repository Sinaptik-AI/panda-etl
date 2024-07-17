from sqlalchemy.orm import Session, joinedload

from app import models


def get_processes(db: Session):
    return db.query(models.Process).options(joinedload(models.Process.project)).all()