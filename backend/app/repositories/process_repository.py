from sqlalchemy import desc, func
from sqlalchemy.orm import Session, joinedload, defer

from app import models
from app.schemas.process import ProcessData, ProcessSuggestion


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
        details=process_data.data,
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
            joinedload(models.ProcessStep.process).joinedload(models.Process.project),
            joinedload(models.ProcessStep.asset),
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


def search_relevant_process(db: Session, process_data: ProcessSuggestion):

    # Perform the query
    return (
        db.query(models.Process)
        .filter(models.Process.project_id == process_data.project_id)
        .filter(models.Process.type == process_data.type)
        .filter(
            func.json_extract(models.Process.details, "$.output_type")
            == process_data.output_type
        )
        .options(defer(models.Process.output))
        .limit(10)
        .all()
    )
