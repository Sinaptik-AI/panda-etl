import os
from app.database import SessionLocal
from app.repositories import process_repository
from app.repositories import project_repository
from concurrent.futures import ThreadPoolExecutor
from app.models import ProcessStatus
from app.requests import (
    extract_data,
    extract_summary_of_summaries,
    highlight_sentences_in_pdf,
)
from datetime import datetime

from app.models.process_step import ProcessStepStatus
from app.repositories import user_repository
from app.config import settings
import concurrent.futures
from app.logger import Logger
import traceback


executor = ThreadPoolExecutor(max_workers=5)

logger = Logger()


def submit_process(process_id: int):
    executor.submit(process_task, process_id)


# Background task processing function
def process_step_task(process_id, process_step_id, summaries, failed_docs):
    db = SessionLocal()  # Create a new session for this thread
    try:
        process = process_repository.get_process(db, process_id)
        process_step = process_repository.get_process_step(db, process_step_id)
        api_key = user_repository.get_user_api_key(db)

        db.refresh(process)

        if process.status == ProcessStatus.STOPPED:
            return False  # Signal to stop processing

        logger.log(f"Processing file: {process_step.asset.path}")
        if process_step.status == ProcessStepStatus.COMPLETED:
            return True

        process_step.status = ProcessStepStatus.IN_PROGRESS
        db.add(process_step)
        db.commit()

        retries = 0
        success = False
        while retries < settings.max_retries and not success:
            try:
                asset_content = project_repository.get_asset_content(
                    db, asset_id=process_step.asset.id
                )

                if process.type == "extractive_summary":
                    from app.requests import extract_summary

                    data = extract_summary(
                        api_token=api_key.key,
                        config=process.details,
                        file_path=(
                            process_step.asset.path
                            if not asset_content or not asset_content.content
                            else None
                        ),
                        pdf_content=(
                            asset_content.content
                            if asset_content and asset_content.content
                            else None
                        ),
                    )

                    summary = data.get("summary", "")
                    summary_sentences = data.get("summary_sentences", "")

                    highlighted_file_dir = os.path.join(
                        settings.process_dir, str(process_id), str(process_step.id)
                    )

                    os.makedirs(highlighted_file_dir, exist_ok=True)

                    highlighted_file_path = os.path.join(
                        highlighted_file_dir,
                        f"highlighted_{process_step.asset.filename}",
                    )

                    highlight_sentences_in_pdf(
                        api_token=api_key.key,
                        sentences=summary_sentences,
                        file_path=process_step.asset.path,
                        output_path=highlighted_file_path,
                    )

                    data = {
                        "highlighted_pdf": highlighted_file_path,
                        "summary": summary,
                    }

                    if summary:
                        summaries.append(summary)

                    process_step.output = data

                else:
                    if asset_content.content:
                        asset_content = "\n".join(asset_content.content["content"])
                    else:
                        asset_content = None

                    data = extract_data(
                        api_key.key,
                        process.details,
                        file_path=(
                            process_step.asset.path if not asset_content else None
                        ),
                        pdf_content=(asset_content if asset_content else None),
                    )

                    process_step.output = data["fields"]
                    process_step.output_references = data["context"]

                process_step.status = ProcessStepStatus.COMPLETED
                db.add(process_step)
                db.commit()
                success = True
            except Exception as e:
                logger.error(traceback.format_exc())
                retries += 1
                if retries == settings.max_retries:
                    failed_docs.append(process_step.asset.id)
                    process_step.status = ProcessStepStatus.FAILED
                    db.add(process_step)
                    db.commit()
        return True
    except Exception as e:
        logger.error(traceback.format_exc())
        return False
    finally:
        db.close()  # Ensure the session is closed after processing


def process_task(process_id: int):
    try:
        # Step 1: Fetch process details from the database and update its status
        with SessionLocal() as db:
            process = process_repository.get_process(db, process_id)
            process.status = ProcessStatus.IN_PROGRESS
            process.started_at = datetime.utcnow()
            db.commit()

            process_steps = process_repository.get_process_steps(db, process.id)
            if not process_steps:
                raise Exception("No process found!")

            db.refresh(process)

        # Step 2: Process each step in parallel outside the database connection
        failed_docs = []
        summaries = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            futures = [
                executor.submit(
                    process_step_task,
                    process_id,
                    process_step.id,
                    summaries,
                    failed_docs,
                )
                for process_step in process_steps
            ]
            # Wait for all submitted tasks to complete
            concurrent.futures.wait(futures)

        # Step 3: Handle summary extraction (expensive operation) outside the DB session
        summary_of_summaries = None
        if (
            "show_final_summary" in process.details
            and process.details["show_final_summary"]
        ):
            logger.log(f"Extracting summary from summaries")
            api_key = None
            # Fetch API key outside the expensive operation block
            with SessionLocal() as db:
                api_key = user_repository.get_user_api_key(db).key

            # Extract summary outside the DB session to avoid holding connection
            data = extract_summary_of_summaries(
                api_key, summaries, process.details["transformation_prompt"]
            )
            summary_of_summaries = data.get("summary", "")
            logger.log(f"Extracting summary from summaries completed")

        # Step 4: After all steps are processed, update the process status and output in the DB
        with SessionLocal() as db:
            process = process_repository.get_process(db, process_id)
            db.refresh(process)  # Ensure we have the latest process object

            if process.status != ProcessStatus.STOPPED:
                # If summary extraction was performed, add it to the process output
                if summary_of_summaries:
                    process.output = {"summary": summary_of_summaries}

                process.status = (
                    ProcessStatus.COMPLETED if not failed_docs else ProcessStatus.FAILED
                )
                process.completed_at = datetime.utcnow()

            db.commit()  # Commit the final status and output

    except Exception as e:
        logger.error(traceback.format_exc())
        # Step 5: Handle failure cases and update the status accordingly
        with SessionLocal() as db:
            process = process_repository.get_process(db, process_id)
            process.status = ProcessStatus.FAILED
            process.message = str(e)
            db.commit()
