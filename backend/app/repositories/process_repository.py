from sqlalchemy.orm import Session, joinedload, defer

from app import models
from app.schemas.process import ProcessData


def get_processes(db: Session):
    return (
        db.query(models.Process)
        .options(joinedload(models.Process.project), defer(models.Process.output))
        .order_by(models.Process.id.desc())
        .all()
    )


def create_process(db: Session, process_data: ProcessData):
    process = models.Process(
        name=process_data.name,
        type=process_data.type,
        status=models.ProcessStatus.PENDING,
        project_id=process_data.project_id,
        details=process_data.details,
        message="Starting process",
    )
    db.add(process)
    db.commit()
    db.refresh(process)
    return process


def get_process(db: Session, process_id: int):
    return (
        db.query(models.Process)
        .filter(models.Process.id == process_id)
        .options(joinedload(models.Process.project))
        .first()
    )


def get_process_steps(db: Session, process_id: int):
    return (
        db.query(models.ProcessStep)
        .filter(models.ProcessStep.process_id == process_id)
        .options(
            joinedload(models.ProcessStep.process).joinedload(models.Process.project)
        )
        .all()
    )


def get_process_step(db: Session, step_id: int):
    return (
        db.query(models.ProcessStep)
        .filter(models.ProcessStep.id == step_id)
        .options(
            joinedload(models.ProcessStep.process), joinedload(models.ProcessStep.asset)
        )
        .first()
    )
