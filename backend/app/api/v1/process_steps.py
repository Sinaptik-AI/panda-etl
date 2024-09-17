from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories import process_step_repository

process_step_router = APIRouter()


@process_step_router.get("/{process_step_id}")
def get_process_step(process_step_id: int, db: Session = Depends(get_db)):
    process_step = process_step_repository.get_process_step(db, process_step_id)

    if not process_step:
        raise HTTPException(status_code=404, detail="Process step not found")

    return {
        "status": "success",
        "message": "Process step data successfully returned",
        "data": {
            "id": process_step.id,
            "process_id": process_step.process_id,
            "asset_id": process_step.asset_id,
            "status": process_step.status.name,
            "created_at": process_step.created_at.isoformat(),
            "updated_at": process_step.updated_at.isoformat(),
            "output": process_step.output,
        },
    }


@process_step_router.get("/{process_step_id}/references")
def get_process_step_output_reference(
    process_step_id: int, db: Session = Depends(get_db)
):
    process_step = process_step_repository.get_process_step(db, process_step_id)

    if not process_step:
        raise HTTPException(status_code=404, detail="Process step not found")

    return {
        "status": "success",
        "message": "Process step data successfully returned",
        "data": {
            "id": process_step.id,
            "process_id": process_step.process_id,
            "asset_id": process_step.asset_id,
            "output_reference": process_step.output_references,
        },
    }
