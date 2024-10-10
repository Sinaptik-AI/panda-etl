from collections import defaultdict
import re
import traceback
from typing import Optional
from app.database import get_db
from app.logger import Logger
from app.models.asset_content import AssetProcessingStatus
from app.repositories import project_repository, user_repository
from app.repositories import conversation_repository
from app.requests import chat_query
from app.vectorstore.chroma import ChromaDB
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.config import settings


chat_router = APIRouter()


class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    query: str


logger = Logger()


def group_by_start_end(references):
    grouped_references = defaultdict(
        lambda: {"start": None, "end": None, "references": []}
    )

    for ref in references:
        key = (ref["start"], ref["end"])
        if grouped_references[key]["start"] is None:
            grouped_references[key]["start"] = ref["start"]
            grouped_references[key]["end"] = ref["end"]

        grouped_references[key]["references"].append(ref)

    return list(grouped_references.values())


@chat_router.post("/project/{project_id}", status_code=200)
def chat(project_id: int, chat_request: ChatRequest, db: Session = Depends(get_db)):
    try:
        vectorstore = ChromaDB(f"panda-etl-{project_id}")

        docs, doc_ids = vectorstore.get_relevant_segments(
            chat_request.query, settings.max_relevant_docs
        )

        unique_doc_ids = list(set(doc_ids))
        file_names = project_repository.get_assets_filename(db, unique_doc_ids)

        doc_id_to_filename = {
            doc_id: filename for doc_id, filename in zip(unique_doc_ids, file_names)
        }

        ordered_file_names = [doc_id_to_filename[doc_id] for doc_id in doc_ids]

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
        text_reference = None
        text_references = []
        for sentence in response["references"]:
            print(sentence)
            docs = vectorstore.get_relevant_docs(sentence, k=3)
            if len(docs["metadatas"][0]) == 0:
                continue

            for metadata in docs["metadatas"][0]:
                if (
                    text_reference is None
                    or text_reference["asset_id"] != metadata["asset_id"]
                ):
                    if text_reference is not None:
                        text_references.append(text_reference)

                    text_reference = {
                        "asset_id": metadata["asset_id"],
                        "project_id": metadata["project_id"],
                        "page_number": metadata["page_number"],
                        "filename": (
                            metadata["filename"]
                            if "filename" in metadata
                            else project_repository.get_assets_filename(
                                db, [metadata["asset_id"]]
                            )[0]
                        ),
                    }
                    index = content.find(sentence)
                    text_reference["start"] = index
                    text_reference["end"] = index + len(sentence)

                elif text_reference["asset_id"] == metadata["asset_id"]:
                    index = content.find(sentence)
                    text_reference["end"] = index + len(sentence)

        # group text references based on start and end
        refs = group_by_start_end(text_references)

        print(refs)

        conversation_repository.create_conversation_message(
            db,
            conversation_id=conversation_id,
            query=chat_request.query,
            response=content,
        )

        return {
            "status": "success",
            "message": "chat response successfully returned!",
            "data": {
                "conversation_id": conversation_id,
                "response": content,
                "response_references": refs,
            },
        }

    except HTTPException:
        raise

    except Exception as e:
        logger.error(traceback.print_exc())
        raise HTTPException(status_code=400, detail="Unable to process query!")


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
            "message": "Chat response successfully returned!",
            "data": {"status": status},
        }

    except HTTPException:
        raise

    except Exception as e:
        logger.error(traceback.print_exc())
        raise HTTPException(status_code=400, detail="Unable to process query!")
