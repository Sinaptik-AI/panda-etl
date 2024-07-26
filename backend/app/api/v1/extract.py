from typing import List, Tuple
from fastapi import APIRouter, Depends, HTTPException
import numpy as np
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories import project_repository
from app.repositories import user_repository
from app.requests import extract_data
from app.logger import Logger
import traceback


extract_router = APIRouter()

logger = Logger()


class Field(BaseModel):
    key: str
    type: str
    description: str


class ExtractFields(BaseModel):
    fields: List[Field]


@extract_router.post("/{project_id}", status_code=201)
async def extract(
    project_id: int, fields: ExtractFields, db: Session = Depends(get_db)
):
    try:
        assets = project_repository.get_assets(db=db, project_id=project_id)

        asset = assets[0]

        api_key = user_repository.get_user_api_key(db)

        data = extract_data(api_key.key, asset.path, fields.dict())

        return {
            "status": "success",
            "message": "File processed successfully",
            "data": data,
        }

    except Exception as e:
        logger.error(traceback.print_exc())
        raise HTTPException(status_code=400, detail="Unable to process file!")
