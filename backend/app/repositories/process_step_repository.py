from sqlalchemy.orm import Session, joinedload
from app import models

def get_process_step(db: Session, process_step_id: int):
    return (
        db.query(models.ProcessStep)
        .filter(models.ProcessStep.id == process_step_id)
        .options(joinedload(models.ProcessStep.process))
        .first()
    )
