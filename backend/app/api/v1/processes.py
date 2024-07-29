import os

import dateparser
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import csv
from io import StringIO

from app.database import SessionLocal, get_db
from app.repositories import process_repository
from app.repositories import project_repository
from concurrent.futures import ThreadPoolExecutor
from app.models import ProcessStatus, ProcessStep
from app.schemas.process import ProcessData
from app.requests import extract_data
from datetime import datetime

from app.models.process_step import ProcessStepStatus
from app.repositories import user_repository
from app.config import settings
from app.logger import Logger
import traceback

# Thread pool executor for background tasks
executor = ThreadPoolExecutor(max_workers=5)

process_router = APIRouter()

logger = Logger()


@process_router.get("/{process_id}")
def get_process(process_id: int, db: Session = Depends(get_db)):
    process = process_repository.get_process(db=db, process_id=process_id)

    if not process:
        raise HTTPException(status_code=404, detail="Process not found")

    return {
        "status": "success",
        "message": "Process successfully returned",
        "data": {
            "id": process.id,
            "name": process.name,
            "type": process.type,
            "status": process.status,
            "project": process.project.name,
            "project_id": f"{process.project_id}",
            "details": process.details,
            "output": process.output,
            "started_at": (
                process.started_at.isoformat() if process.started_at else None
            ),
            "completed_at": (
                process.completed_at.isoformat() if process.completed_at else None
            ),
            "created_at": (
                process.created_at.isoformat() if process.created_at else None
            ),
            "updated_at": (
                process.updated_at.isoformat() if process.updated_at else None
            ),
        },
    }


@process_router.get("/")
def get_processes(db: Session = Depends(get_db)):
    processes = process_repository.get_processes(db=db)

    return {
        "status": "success",
        "message": "Processes successfully returned",
        "data": [
            {
                "id": process.id,
                "name": process.name,
                "type": process.type,
                "status": process.status,
                "project": process.project.name,
                "project_id": f"{process.project_id}",
                "details": process.details,
                "started_at": (
                    process.started_at.isoformat() if process.started_at else None
                ),
                "completed_at": (
                    process.completed_at.isoformat() if process.completed_at else None
                ),
                "created_at": (
                    process.created_at.isoformat() if process.created_at else None
                ),
                "updated_at": (
                    process.updated_at.isoformat() if process.updated_at else None
                ),
            }
            for process in processes
        ],
    }


@process_router.post("/start")
def start_process(process: ProcessData, db: Session = Depends(get_db)):
    process = process_repository.create_process(db, process)

    assets = project_repository.get_assets(db, process.project_id)

    if not assets[0]:
        raise HTTPException(status_code=404, detail="No Asset found!")

    for asset in assets[0]:
        process_step = ProcessStep(
            process_id=process.id,
            asset_id=asset.id,
            output=None,
            status=ProcessStepStatus.PENDING,
        )
        db.add(process_step)
        db.commit()

    logger.log(f"Add to process {process.id} to the queue")
    executor.submit(process_task, process.id)

    return {
        "status": "success",
        "message": "Processes successfully returned",
        "data": [
            {
                "id": process.id,
                "name": process.name,
                "type": process.type,
                "status": process.status,
                "project": process.project.name,
                "project_id": f"{process.project_id}",
            }
        ],
    }


@process_router.post("/{process_id}/stop")
def stop_processes(process_id: int, db: Session = Depends(get_db)):

    process = process_repository.get_process(db, process_id)

    if process.status in [ProcessStatus.IN_PROGRESS, ProcessStatus.PENDING]:
        process.status = ProcessStatus.STOPPED
        db.commit()
    else:
        raise HTTPException(
            status_code=404, detail="Process not in a state to be stopped"
        )

    return {
        "status": "success",
        "message": "Processes successfully stopped!",
        "data": [{"id": process.id, "type": process.type, "status": process.status}],
    }


@process_router.post("/{process_id}/resume")
def stop_processes(process_id: int, db: Session = Depends(get_db)):

    process = process_repository.get_process(db, process_id)

    if process.status in [ProcessStatus.STOPPED]:
        process.status = ProcessStatus.PENDING
        db.commit()
        logger.log(f"Add to process {process.id} to the queue")
        executor.submit(process_task, process.id)

    else:
        raise HTTPException(status_code=404, detail="Process ")

    return {
        "status": "success",
        "message": "Processes successfully stopped!",
        "data": [{"id": process.id, "type": process.type, "status": process.status}],
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

        failed_docs = 0
        summaries = []
        process_stopped = False
        for process_step in process_steps:

            db.refresh(process)

            if process.status == ProcessStatus.STOPPED:
                process_stopped = True
                break

            logger.log(f"Processing file: {process_step.asset.path}")
            if process_step.status == ProcessStepStatus.COMPLETED:
                continue

            process_step.status = ProcessStepStatus.IN_PROGRESS
            db.add(process_step)
            db.commit()

            api_key = user_repository.get_user_api_key(db)

            retries = 0
            success = False
            while retries < settings.max_retries and not success:
                try:

                    if process.type == "extractive_summary":
                        from .extract import extract_summary, highlight_sentences_in_pdf

                        summary, summary_sentences = extract_summary(
                            process_step.asset.path,
                            process_step.asset.filename,
                            process.details,
                        )
                        highlighted_file_dir = os.path.join(
                            settings.process_dir, str(process_id), str(process_step.id)
                        )

                        os.makedirs(highlighted_file_dir, exist_ok=True)

                        highlighted_file_path = os.path.join(
                            highlighted_file_dir,
                            f"highlighted_{process_step.asset.filename}",
                        )

                        highlight_sentences_in_pdf(
                            process_step.asset.path,
                            highlighted_file_path,
                            summary_sentences,
                        )

                        data = {
                            "highlighted_pdf": highlighted_file_path,
                            "summary": summary,
                        }

                        if summary:
                            summaries.append(summary)

                    else:
                        data = extract_data(
                            api_key.key, process_step.asset.path, process.details
                        )

                    process_step.output = data
                    process_step.status = ProcessStepStatus.COMPLETED
                    db.add(process_step)
                    db.commit()
                    success = True
                except Exception as e:
                    logger.error(traceback.format_exc())
                    retries += 1
                    if retries == settings.max_retries:
                        failed_docs += 1
                        process_step.status = ProcessStepStatus.FAILED
                        db.add(process_step)
                        db.commit()

        if (
            "show_final_summary" in process.details
            and process.details["show_final_summary"]
        ):
            from .extract import (
                extract_summary_of_summaries,
            )

            logger.log(f"Extracting summary from summaries")
            summary_of_summaries = extract_summary_of_summaries(
                summaries, process.details["transformation_prompt"]
            )
            process.output = {"summary": summary_of_summaries}
            logger.log(f"Extracting summary from summaries completed")

        if not process_stopped:
            process.status = (
                ProcessStatus.COMPLETED if failed_docs == 0 else ProcessStatus.FAILED
            )
            process.completed_at = datetime.now()

    except Exception as e:
        logger.error(traceback.format_exc())
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

    completed_steps = [step for step in process_steps if step.status == ProcessStepStatus.COMPLETED]
    if not completed_steps:
        return {
            "status": "error",
            "message": "No completed steps found",
            "data": None,
        }

    csv_buffer = StringIO()
    csv_writer = csv.writer(csv_buffer)

    # Write headers
    headers = ['Filename'] + list(completed_steps[0].output[0].keys())
    csv_writer = csv.writer(
        csv_buffer, delimiter=";", quotechar='"', quoting=csv.QUOTE_MINIMAL
    )
    csv_writer.writerow(headers)

    # fetch date columns
    date_columns = []
    number_columns = []
    if process.type == "extract":
        if "fields" in process.details:
            for field in process.details["fields"]:
                if field["type"] == "date":
                    date_columns.append(field["key"])
                elif field["type"] == "number":
                    number_columns.append(field["key"])

    # Write data rows
    for step in completed_steps:
        for output in step.output:
            row = [step.asset.filename]
            for key in headers[1:]:
                value = output.get(key, "")
                if key in date_columns:
                    try:
                        parsed_date = dateparser.parse(value)
                        if parsed_date:
                            value = parsed_date.strftime("%d-%m-%Y")
                    except:
                        logger.error(
                            f"Unable to parse date {value} fallback to extracted text"
                        )
                elif key in number_columns:
                    try:
                        value = int(value)
                    except:
                        logger.error(
                            f"Unable to parse number {value} fallback to extracted text"
                        )
                row.append(value)
            csv_writer.writerow(row)

    csv_content = csv_buffer.getvalue()

    response = Response(content=csv_content)
    response.headers["Content-Disposition"] = (
        f"attachment; filename=process_{process_id}.csv"
    )
    response.headers["Content-Type"] = "text/csv"

    return response


@process_router.get("/{process_id}/get-steps")
def get_process_steps(process_id: int, db: Session = Depends(get_db)):
    process_steps = process_repository.get_process_steps(db, process_id)

    if not process_steps:
        raise Exception("No process found!")

    return {
        "status": "success",
        "message": "Process steps successfully returned",
        "data": process_steps,
    }


@process_router.get("/{process_id}/steps/{step_id}/download")
async def get_file(step_id: int, db: Session = Depends(get_db)):
    try:
        process_step = process_repository.get_process_step(db, step_id)

        if process_step is None or "highlighted_pdf" not in process_step.output:
            raise HTTPException(status_code=404, detail="No process step detail found!")

        filepath = process_step.output["highlighted_pdf"]

        # Check if the file exists
        if not os.path.isfile(filepath):
            raise HTTPException(status_code=404, detail="File not found on server")

        # Return the file
        return FileResponse(
            filepath,
            media_type="application/pdf",
            filename=f"highlighted_{process_step.asset.filename}",
        )

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to retrieve file")
