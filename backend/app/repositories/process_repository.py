from sqlalchemy.orm import Session, joinedload

from app import models


def get_processes(db: Session):
    return db.query(models.Process).options(joinedload(models.Process.project)).all()

def get_process(db: Session, process_id: int):
    return db.query(models.Process).filter(models.Process.id == process_id).options(joinedload(models.Process.project)).first()

def get_process_steps(db: Session, process_id: int):
    return db.query(models.ProcessStep).filter(models.ProcessStep.process_id == process_id).options(joinedload(models.ProcessStep.process)).all()