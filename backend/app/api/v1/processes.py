from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

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