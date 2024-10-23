from functools import wraps
from typing import List
from app.database import SessionLocal
from app.exceptions import CreditLimitExceededException
from app.models.asset_content import AssetProcessingStatus
from app.processing.process_scheduler import ProcessScheduler
from app.repositories import process_repository
from app.repositories import project_repository
from concurrent.futures import ThreadPoolExecutor
from app.models import ProcessStatus
from app.requests import (
    extract_data,
)
from datetime import datetime
from app.models.process_step import ProcessStepStatus
from app.repositories import user_repository
from app.config import settings
import concurrent.futures
from app.logger import Logger
import traceback

from app.utils import clean_text
from app.vectorstore.chroma import ChromaDB

executor = ThreadPoolExecutor(max_workers=5)

logger = Logger()


def submit_process(process_id: int) -> None:
    executor.submit(process_task, process_id)


process_execution_scheduler = ProcessScheduler(60, submit_process, logger)

# Background task processing function
def process_step_task(
    process_id: int,
    process_step_id: int,
    summaries: List[str],
    failed_docs: List[int],
    api_key: str,
):
    try:
        # Initial DB operations (open and fetch relevant data)
        with SessionLocal() as db:
            process = process_repository.get_process(db, process_id)
            process_step = process_repository.get_process_step(db, process_step_id)

            if process.status == ProcessStatus.STOPPED:
                return False  # Stop processing if the process is stopped

            logger.log(f"Processing file: {process_step.asset.path}")
            if process_step.status == ProcessStepStatus.COMPLETED and process.type!="extract":
                summaries.append(process_step.output.get("summary", ""))
                return True

            # Mark step as in progress
            update_process_step_status(db, process_step, ProcessStepStatus.IN_PROGRESS)

            retries = 0
            success = False
            asset_content = project_repository.get_asset_content(
                db, asset_id=process_step.asset.id
            )

        # Move the expensive external operations out of the DB session
        while retries < settings.max_retries and not success:
            try:
                if process.type == "extract":
                    # Handle non-extractive summary process
                    data = extract_process(
                        api_key, process, process_step, asset_content
                    )

                    # Update process step output outside the expensive operations
                    with SessionLocal() as db:
                        update_process_step_status(
                            db,
                            process_step,
                            ProcessStepStatus.COMPLETED,
                            output=data["fields"],
                            output_references=data["context"],
                        )

                success = True

            except CreditLimitExceededException:
                with SessionLocal() as db:
                    process = process_repository.get_process(db, process_id)
                    process_repository.update_process_status(
                        db, process, ProcessStatus.STOPPED
                    )

            except Exception:
                logger.error(traceback.format_exc())
                retries += 1
                if retries == settings.max_retries:
                    failed_docs.append(process_step.asset.id)
                    with SessionLocal() as db:
                        update_process_step_status(
                            db, process_step, ProcessStepStatus.FAILED
                        )

        return True

    except Exception:
        logger.error(traceback.format_exc())
        return False


def process_task(process_id: int):
    try:
        # Step 1: Fetch process details from the database and update its status
        with SessionLocal() as db:
            process = process_repository.get_process(db, process_id)
            process.status = ProcessStatus.IN_PROGRESS
            process.started_at = datetime.utcnow()
            db.commit()

            process_steps = process_repository.get_process_steps_with_asset_content(db, process.id, [ProcessStepStatus.PENDING.name, ProcessStepStatus.FAILED.name, ProcessStepStatus.IN_PROGRESS.name])
            if not process_steps:
                raise Exception("No process found!")

            api_key = user_repository.get_user_api_key(db)
            api_key = api_key.key
            db.refresh(process)

        # Step 2: Process each step in parallel outside the database connection
        failed_docs = []
        summaries = []

        ready_process_steps = [process_step for process_step in process_steps if process_step.asset.content.processing == AssetProcessingStatus.COMPLETED]

        all_process_steps_ready = len(ready_process_steps) == len(process_steps) # Check if all process steps are ready

        # Step 3: Concurrently process all process steps
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            futures = [
                executor.submit(
                    process_step_task,
                    process.id,
                    process_step.id,
                    summaries,
                    failed_docs,
                    api_key,
                )
                for process_step in ready_process_steps
            ]
            # Wait for all submitted tasks to complete
            concurrent.futures.wait(futures)

        # Step 4: After all steps are processed, update the process status and output in the DB
        with SessionLocal() as db:
            process = process_repository.get_process(db, process_id)

            if process.status != ProcessStatus.STOPPED:
                # If summary extraction was performed, add it to the process output
                if not all_process_steps_ready:
                    logger.info(f"Process id: [{process.id}] some steps preprocessing is missing moving to waiting queue")
                    process_execution_scheduler.add_process_to_queue(process.id)
                    # Skip status update since not all steps are ready
                    return

                process.status = (
                    ProcessStatus.COMPLETED if not failed_docs else ProcessStatus.FAILED
                )
                process.completed_at = datetime.utcnow()

            db.commit()

    except Exception as e:
        logger.error(traceback.format_exc())
        # Step 5: Handle failure cases and update the status accordingly
        with SessionLocal() as db:
            process = process_repository.get_process(db, process_id)
            process.status = ProcessStatus.FAILED
            process.message = str(e)
            db.commit()


def handle_exceptions(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except CreditLimitExceededException:
            logger.error("Credit limit exceeded")
            raise
        except Exception as e:
            logger.error(f"Error in {func.__name__}: {str(e)}")
            logger.error(traceback.format_exc())
            raise

    return wrapper


@handle_exceptions
def extract_process(api_key, process, process_step, asset_content):
    pdf_content = ""
    vectorstore = ChromaDB(f"panda-etl-{process.project_id}", similary_threshold=3)
    if (
        (
            "multiple_fields" not in process.details
            or not process.details["multiple_fields"]
        )
        and asset_content.content
        and asset_content.content.get("word_count", 0) > 500
    ):
        for field in process.details["fields"]:
            relevant_docs = vectorstore.get_relevant_docs(
                field["key"],
                where={
                    "$and": [
                        {"asset_id": process_step.asset.id},
                        {"project_id": process.project_id},
                    ]
                },
                k=5,
            )

            for index, metadata in enumerate(relevant_docs["metadatas"][0]):
                segment_data = [relevant_docs["documents"][0][index]]
                if metadata["previous_sentence_id"] != -1:
                    prev_sentence = vectorstore.get_relevant_docs_by_id(
                        ids=[metadata["previous_sentence_id"]]
                    )
                    segment_data = [prev_sentence["documents"][0]] + segment_data

                if metadata["next_sentence_id"] != -1:
                    next_sentence = vectorstore.get_relevant_docs_by_id(
                        ids=[metadata["next_sentence_id"]]
                    )
                    segment_data.append(next_sentence["documents"][0])

                pdf_content += "\n" + " ".join(segment_data)

    if not pdf_content:
        pdf_content = (
            "\n".join(asset_content.content["content"])
            if asset_content.content
            else None
        )

    data = extract_data(
        api_key,
        process.details,
        file_path=(process_step.asset.path if not pdf_content else None),
        pdf_content=pdf_content if pdf_content else None,
    )

    for context in data["context"]:
        for sources in context:
            page_numbers = []
            for source_index, source in enumerate(sources["sources"]):

                relevant_docs = vectorstore.get_relevant_docs(
                    source,
                    where={
                        "$and": [
                            {"asset_id": process_step.asset.id},
                            {"project_id": process.project_id},
                        ]
                    },
                    k=5,
                )

                most_relevant_index = 0
                match = False
                clean_source = clean_text(source)
                # search for exact match Index
                for index, relevant_doc in enumerate(relevant_docs["documents"][0]):
                    if clean_source in clean_text(relevant_doc):
                        most_relevant_index = index
                        match = True

                if not match and len(relevant_docs["documents"][0]) > 0:
                    sources["sources"][source_index] = relevant_docs["documents"][0][0]

                if len(relevant_docs["metadatas"][0]) > 0:
                    page_numbers.append(
                        relevant_docs["metadatas"][0][most_relevant_index][
                            "page_number"
                        ]
                    )

            sources["page_numbers"] = page_numbers

    return {
        "fields": data["fields"],
        "context": data["context"],
    }


def update_process_step_status(
    db, process_step, status, output=None, output_references=None
):
    """
    Update the status of a process step.

    Args:
    db: Database session
    process_step: The process step to update
    status: The new status
    output: Optional output data
    output_references: Optional output references
    """
    process_repository.update_process_step_status(
        db, process_step, status, output=output, output_references=output_references
    )
