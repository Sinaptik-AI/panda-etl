import traceback
from typing import Optional

from app.config import settings
from app.database import get_db
from app.logger import Logger
from app.models.asset_content import AssetProcessingStatus
from app.repositories import (
    conversation_repository,
    project_repository,
    user_repository,
)
from app.requests import chat_query
from app.utils import clean_text, find_following_sentence_ending, find_sentence_endings
from app.vectorstore.chroma import ChromaDB
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

chat_router = APIRouter()


class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    query: str


logger = Logger()


def group_by_start_end(references):
    grouped_references = {}
    for ref in references:
        key = (ref["start"], ref["end"])
        grouped_ref = grouped_references.setdefault(
            key, {"start": ref["start"], "end": ref["end"], "references": []}
        )
        for existing_ref in grouped_ref["references"]:
            if (
                existing_ref["asset_id"] == ref["asset_id"]
                and existing_ref["page_number"] == ref["page_number"]
            ):
                existing_ref["source"].extend(ref["source"])
                break
        else:
            grouped_ref["references"].append(ref)
    return list(grouped_references.values())


@chat_router.post("/project/{project_id}", status_code=200)
def chat(project_id: int, chat_request: ChatRequest, db: Session = Depends(get_db)):
    try:
        vectorstore = ChromaDB(f"panda-etl-{project_id}")

        docs, doc_ids, _ = vectorstore.get_relevant_segments(
            chat_request.query, settings.max_relevant_docs
        )

        unique_doc_ids = list(set(doc_ids))
        file_names = project_repository.get_assets_filename(db, unique_doc_ids)

        doc_id_to_filename = {
            doc_id: filename for doc_id, filename in zip(unique_doc_ids, file_names)
        }

        ordered_file_names = [doc_id_to_filename[doc_id] for doc_id in doc_ids]

        extract_vectorstore = ChromaDB(f"panda-etl-extraction-{project_id}",
                                       similarity_threshold=settings.chat_extraction_doc_threshold)

        # Extract reference documents from the extraction results from db
        extraction_docs = extract_vectorstore.get_relevant_docs(
                chat_request.query,
                k=settings.chat_extraction_max_docs
        )

        # Append text from single documents together
        for extraction_doc in extraction_docs["metadatas"][0]:
            index = next((i for i, item in enumerate(ordered_file_names) if item == extraction_doc["filename"]), None)
            if index is None:
                ordered_file_names.append(extraction_doc["filename"])
                docs.append(extraction_doc["reference"])
            else:
                docs[index] = f'{extraction_doc["reference"]}\n\n{docs[index]}'

        docs_formatted = [
            {"filename": filename, "quote": quote}
            for filename, quote in zip(ordered_file_names, docs)
        ]

        api_key = user_repository.get_user_api_key(db)

        response = chat_query(
            api_token=api_key.key, query=chat_request.query, docs=docs_formatted
        )

        conversation_id = chat_request.conversation_id

        if conversation_id is None:

            user = user_repository.get_users(db)[
                0
            ]  # Always pick the first user as of now
            conversation = conversation_repository.create_new_conversation(
                db,
                project_id=project_id,
                user_id=user.id,
                title=chat_request.query,
            )
            conversation_id = str(conversation.id)

        content = response["response"]
        content_length = len(content)
        clean_content = clean_text(content)
        context_sentence_endings = find_sentence_endings(content)
        text_references = []
        not_exact_matched_refs = []

        for reference in response["references"]:
            sentence = reference["sentence"]

            for reference_content in reference["references"]:
                original_filename = reference_content["file"]
                original_sentence = reference_content["sentence"]

                doc_sent, doc_ids, doc_metadata = vectorstore.get_relevant_segments(
                    original_sentence,
                    k=5,
                    num_surrounding_sentences=0,
                    metadata_filter={"filename": original_filename},
                )

                # Search for exact match
                best_match_index = 0

                for index, sent in enumerate(doc_sent):
                    if clean_text(original_sentence) in clean_text(sent):
                        best_match_index = index

                metadata = doc_metadata[best_match_index]
                sent = doc_sent[best_match_index]

                # find sentence start index of reference in the context
                index = clean_content.find(clean_text(sentence))

                # Find the following sentence end from the end index
                reference_ending_index = find_following_sentence_ending(context_sentence_endings, index + len(sentence))

                if index != -1:
                    text_reference = {
                        "asset_id": metadata["asset_id"],
                        "project_id": metadata["project_id"],
                        "page_number": metadata["page_number"],
                        "filename": original_filename,
                        "source": [sent],
                        "start": index,
                        "end": reference_ending_index,
                    }
                    text_references.append(text_reference)
                else:
                    no_exact_reference = {
                        "asset_id": metadata["asset_id"],
                        "project_id": metadata["project_id"],
                        "page_number": metadata["page_number"],
                        "filename": original_filename,
                        "source": [sent],
                        "start": 0,
                        "end": content_length,
                    }
                    not_exact_matched_refs.append(no_exact_reference)

        # group text references based on start and end
        if len(text_references) > 0:
            refs = group_by_start_end(text_references)
        else:
            refs = group_by_start_end(not_exact_matched_refs)

        conversation_repository.create_conversation_message(
            db,
            conversation_id=conversation_id,
            query=chat_request.query,
            response=content,
        )

        return {
            "status": "success",
            "message": "Chat response successfully generated.",
            "data": {
                "conversation_id": conversation_id,
                "response": content,
                "response_references": refs,
            },
        }

    except HTTPException:
        raise

    except Exception:
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=400,
            detail="Unable to process the chat query. Please try again.",
        )


@chat_router.get("/project/{project_id}/status", status_code=200)
def chat_status(project_id: int, db: Session = Depends(get_db)):
    try:
        asset_contents = project_repository.get_assets_without_content(
            db=db, project_id=project_id
        )

        asset_contents = [
            asset
            for asset in asset_contents
            if asset.status != AssetProcessingStatus.FAILED
        ]

        pending_contents = project_repository.get_assets_content_pending(
            db=db, project_id=project_id
        )

        status = not (asset_contents or pending_contents)

        return {
            "status": "success",
            "message": "Chat message successfully generated.",
            "data": {"status": status},
        }

    except HTTPException:
        raise

    except Exception:
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=400,
            detail="Unable to process the chat query. Please try again.",
        )
