import time

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
import csv
from io import StringIO

from app.database import SessionLocal, get_db
from app.repositories import process_repository
from app.repositories import project_repository
from concurrent.futures import ThreadPoolExecutor
from app.models import Process, ProcessStatus, ProcessStep
from app.schemas.process import ProcessData
from app.requests import extract_data
from datetime import datetime

from app.models.process_step import ProcessStepStatus


# Thread pool executor for background tasks
executor = ThreadPoolExecutor(max_workers=5)

process_router = APIRouter()


@process_router.get("/")
def get_processes(db: Session = Depends(get_db)):
    processes = process_repository.get_processes(db=db)

    return {
        "status": "success",
        "message": "Processes successfully returned",
        "data": [
            {
                "id": process.id,
                "type": process.type,
                "status": process.status,
                "project": process.project.name,
                "project_id": f"{process.project_id}",
                "started_at": process.started_at.isoformat(),
                "completed_at": process.completed_at.isoformat(),
                "created_at": process.created_at.isoformat(),
                "updated_at": process.updated_at.isoformat(),
            }
            for process in processes
        ],
    }


@process_router.post("/start")
def start_processes(process: ProcessData, db: Session = Depends(get_db)):

    process = process_repository.create_process(db, process)

    assets = project_repository.get_assets(db, process.project_id)

    if not assets:
        raise HTTPException(status_code=404, detail="No Asset found!")

    for asset in assets:
        process_step = ProcessStep(
            process_id=process.id,
            asset_id=asset.id,
            output=None,
            status=ProcessStepStatus.PENDING,
        )
        db.add(process_step)
        db.commit()

    executor.submit(process_task, process.id)

    return {
        "status": "success",
        "message": "Processes successfully returned",
        "data": [
            {
                "id": process.id,
                "type": process.type,
                "status": process.status,
                "project": process.project.name,
                "project_id": f"{process.project_id}",
            }
        ],
    }


# Background task processing function
def process_task(process_id: int):
    db = SessionLocal()
    process = process_repository.get_process(db, process_id)
    process.status = ProcessStatus.IN_PROGRESS
    process.started_at = datetime.now()
    db.commit()

    try:
        process_steps = process_repository.get_process_steps(db, process.id)

        if not process_steps:
            raise Exception("No process found!")

        for process_step in process_steps:

            if process_step.status == ProcessStepStatus.COMPLETED:
                continue

            process_step.status = ProcessStepStatus.IN_PROGRESS
            db.add(process_step)
            db.commit()

            # TODO - Replace with original extract method
            data = extract_data(process_step.asset.path)
            process_step.output = data["data"]
            process_step.status = ProcessStepStatus.COMPLETED
            db.add(process_step)
            db.commit()

        process.status = ProcessStatus.COMPLETED
        process.completed_at = datetime.now()
    except Exception as e:
        process.status = ProcessStatus.FAILED
        process.message = e

    db.commit()
    db.close()


@process_router.get("/{process_id}/download-csv")
def download_process(process_id: int, db: Session = Depends(get_db)):
    process = process_repository.get_process(db=db, process_id=process_id)
    if not process:
        return {
            "status": "error",
            "message": "Process not found",
            "data": None,
        }

    process_steps = process_repository.get_process_steps(db=db, process_id=process_id)
    if not process_steps:
        return {
            "status": "error",
            "message": "Process steps not found",
            "data": None,
        }

    csv_buffer = StringIO()
    csv_writer = csv.writer(csv_buffer)

    # Write headers
    headers = process_steps[0].output.keys()
    csv_writer.writerow(headers)

    # Write data rows
    for step in process_steps:
        csv_writer.writerow(step.output.values())

    csv_content = csv_buffer.getvalue()

    response = Response(content=csv_content)
    response.headers["Content-Disposition"] = (
        f"attachment; filename=process_{process_id}.csv"
    )
    response.headers["Content-Type"] = "text/csv"

    return response