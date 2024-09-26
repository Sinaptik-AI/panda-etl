import os
from typing import List
from app.database import SessionLocal
from app.exceptions import CreditLimitExceededException
from app.models import Process, ProcessStep
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

from app.vectorstore.chroma import ChromaDB


executor = ThreadPoolExecutor(max_workers=5)

logger = Logger()


def submit_process(process_id: int):
    executor.submit(process_task, process_id)


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
            if process_step.status == ProcessStepStatus.COMPLETED:
                summaries.append(process_step.output.get("summary", ""))
                return True

            # Mark step as in progress
            process_repository.update_process_step_status(
                db, process_step, ProcessStepStatus.IN_PROGRESS
            )

            retries = 0
            success = False
            asset_content = project_repository.get_asset_content(
                db, asset_id=process_step.asset.id
            )

        # Move the expensive external operations out of the DB session
        while retries < settings.max_retries and not success:
            try:
                if process.type == "extractive_summary":
                    # Extract summary
                    from app.requests import extract_summary

                    data = extract_summary(
                        api_token=api_key,
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

                    # Create directory for highlighted PDF
                    highlighted_file_dir = os.path.join(
                        settings.process_dir, str(process.id), str(process_step.id)
                    )
                    os.makedirs(highlighted_file_dir, exist_ok=True)

                    highlighted_file_path = os.path.join(
                        highlighted_file_dir,
                        f"highlighted_{process_step.asset.filename}",
                    )

                    # Highlight sentences in PDF (expensive operation)
                    highlight_sentences_in_pdf(
                        api_token=api_key,
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

                    # Update process step output outside the expensive operations
                    with SessionLocal() as db:
                        process_repository.update_process_step_status(
                            db, process_step, ProcessStepStatus.COMPLETED, output=data
                        )

                else:
                    # Handle non-extractive summary process
                    pdf_content = ""
                    if (
                        (
                            "multiple_fields" not in process.details
                            or not process.details["multiple_fields"]
                        )
                        and asset_content.content
                        and asset_content.content["word_count"] > 500
                    ):
                        vectorstore = ChromaDB(
                            f"panda-etl-{process.project_id}", similary_threshold=3
                        )

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
                            for index, metadata in enumerate(
                                relevant_docs["metadatas"][0]
                            ):
                                segment_data = [relevant_docs["documents"][0][index]]
                                if metadata["previous_sentence_id"] != -1:
                                    prev_sentence = vectorstore.get_relevant_docs_by_id(
                                        ids=[metadata["previous_sentence_id"]]
                                    )
                                    segment_data = [
                                        prev_sentence["documents"][0]
                                    ] + segment_data

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

                    # Extract data (expensive operation)
                    data = extract_data(
                        api_key,
                        process.details,
                        file_path=(
                            process_step.asset.path if not pdf_content else None
                        ),
                        pdf_content=pdf_content if pdf_content else None,
                    )

                    # Update process step output outside the expensive operations
                    with SessionLocal() as db:
                        process_repository.update_process_step_status(
                            db,
                            process_step,
                            ProcessStepStatus.COMPLETED,
                            output=data["fields"],
                            output_references=data["context"],
                        )

                success = True

            except CreditLimitExceededException as e:
                with SessionLocal() as db:
                    process = process_repository.get_process(db, process_id)
                    process_repository.update_process_status(
                        db, process, ProcessStatus.STOPPED
                    )

            except Exception as e:
                logger.error(traceback.format_exc())
                retries += 1
                if retries == settings.max_retries:
                    failed_docs.append(process_step.asset.id)
                    with SessionLocal() as db:
                        process_repository.update_process_step_status(
                            db, process_step, ProcessStepStatus.FAILED
                        )

        return True

    except Exception as e:
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

            process_steps = process_repository.get_process_steps(db, process.id)
            if not process_steps:
                raise Exception("No process found!")

            api_key = user_repository.get_user_api_key(db)
            api_key = api_key.key
            db.refresh(process)

        # Step 2: Process each step in parallel outside the database connection
        failed_docs = []
        summaries = []
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

            if process.output:
                return

            # Extract summary outside the DB session to avoid holding connection
            data = extract_summary_of_summaries(
                api_key, summaries, process.details["transformation_prompt"]
            )
            summary_of_summaries = data.get("summary", "")
            logger.log(f"Extracting summary from summaries completed")

        # Step 4: After all steps are processed, update the process status and output in the DB
        with SessionLocal() as db:
            process = process_repository.get_process(db, process_id)

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
