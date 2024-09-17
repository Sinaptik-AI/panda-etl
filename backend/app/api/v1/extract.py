from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories import project_repository
from app.repositories import user_repository
from app.requests import extract_data, extract_field_descriptions
from app.logger import Logger
import traceback
from app.config import settings


extract_router = APIRouter()

logger = Logger()


class Field(BaseModel):
    key: str
    type: str
    description: str


class ExtractFields(BaseModel):
    fields: List[Field]
    assetId: int


class GetFieldDescriptionRequest(BaseModel):
    fields: List[str]


@extract_router.post("/{project_id}", status_code=200)
async def extract(
    project_id: int, fields: ExtractFields, db: Session = Depends(get_db)
):
    try:
        asset = project_repository.get_asset(db=db, asset_id=fields.assetId)

        if asset.project_id != project_id:
            raise HTTPException(
                status_code=400, detail="Check asset permission doesn't exists"
            )

        api_key = user_repository.get_user_api_key(db)

        asset_content = project_repository.get_asset_content(db, asset_id=asset.id)

        if asset_content:
            asset_content = "\n".join(asset_content.content["content"])

        data = extract_data(
            api_token=api_key.key,
            fields=fields.dict(),
            file_path=asset.path if not asset_content else None,
            pdf_content=(None if not asset_content else asset_content),
        )

        return {
            "status": "success",
            "message": "File processed successfully",
            "data": data["fields"],
        }

    except HTTPException:
        raise

    except Exception as e:
        logger.error(traceback.print_exc())
        raise HTTPException(status_code=400, detail="Unable to process file!")


@extract_router.post("/{project_id}/field-descriptions", status_code=200)
async def get_field_descriptions(
    project_id: int, fields: GetFieldDescriptionRequest, db: Session = Depends(get_db)
):
    try:
        project = project_repository.get_project(db=db, project_id=project_id)

        if not project:
            raise HTTPException(status_code=400, detail="Project doesn't exists")

        api_key = user_repository.get_user_api_key(db)

        settings.max_retries
        retries = 0
        success = False
        while retries < settings.max_retries and not success:
            try:
                data = extract_field_descriptions(
                    api_token=api_key.key, fields=fields.fields
                )
                success = True
                return {
                    "status": "success",
                    "message": "File processed successfully",
                    "data": data,
                }

            except Exception as e:
                logger.error(e)
                logger.log("Retrying AI Field Extraction!")
                retries += 1

        raise HTTPException(
            status_code=400, detail="Unable to fetch AI Field Descriptions"
        )

    except HTTPException:
        raise

    except Exception as e:
        logger.error(traceback.print_exc())
        raise HTTPException(status_code=400, detail="Unable to process file!")
