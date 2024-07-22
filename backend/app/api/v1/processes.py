from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
import csv
from io import StringIO

from app.database import get_db
from app.repositories import process_repository


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
    response.headers["Content-Disposition"] = f"attachment; filename=process_{process_id}.csv"
    response.headers["Content-Type"] = "text/csv"

    return response