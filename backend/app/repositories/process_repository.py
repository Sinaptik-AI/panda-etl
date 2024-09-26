from app.models.process import ProcessStatus
from sqlalchemy import desc, func, or_
from sqlalchemy.orm import Session, joinedload, defer, aliased

from app import models
from app.schemas.process import ProcessData, ProcessSuggestion
from app.models.process_step import ProcessStep, ProcessStepStatus
from datetime import datetime, timezone


def get_processes(db: Session):
    # Alias for the ProcessStep model to use in the query
    ProcessStepAlias = aliased(models.ProcessStep)

    # Subquery to get the count of completed ProcessStep
    completed_steps_count_subquery = (
        db.query(
            ProcessStepAlias.process_id,
            func.count(ProcessStepAlias.id).label("completed_steps_count"),
        )
        .filter(ProcessStepAlias.status == ProcessStepStatus.COMPLETED)
        .group_by(ProcessStepAlias.process_id)
        .subquery()
    )

    # Main query to get processes with the count of completed steps
    processes = (
        db.query(
            models.Process,
            func.coalesce(
                completed_steps_count_subquery.c.completed_steps_count, 0
            ).label("completed_steps_count"),
        )
        .filter(
            models.Process.deleted_at == None,
        )
        .outerjoin(
            completed_steps_count_subquery,
            models.Process.id == completed_steps_count_subquery.c.process_id,
        )
        .options(joinedload(models.Process.project), defer(models.Process.output))
        .order_by(models.Process.id.desc())
        .all()
    )

    return processes


def get_all_pending_processes(db: Session):
    return db.query(models.Process).filter(
        or_(
            models.Process.status == ProcessStatus.PENDING,
            models.Process.status == ProcessStatus.IN_PROGRESS,
        )
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

    return (
        db.query(models.Process)
        .filter(models.Process.type == process_data.type)
        .filter(
            func.json_extract(models.Process.details, "$.output_type")
            == process_data.output_type
        )
        .options(defer(models.Process.output))
        .limit(10)
        .all()
    )


def delete_process_steps(db: Session, process_id: int):

    current_timestamp = datetime.now(tz=timezone.utc)

    db.query(ProcessStep).filter(ProcessStep.process_id == process_id).update(
        {ProcessStep.deleted_at: current_timestamp}
    )

    db.commit()


def update_process_step_status(
    db, process_step, status, output=None, output_references=None
):
    process_step.status = status
    if output:
        process_step.output = output

    if output_references:
        process_step.output_references = output_references

    db.add(process_step)
    db.commit()


def update_process_status(db, process, status, completed_at=None):
    process.status = status
    if completed_at:
        process.completed_at = completed_at
    db.add(process)
    db.commit()
