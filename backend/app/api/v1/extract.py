from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories import project_repository
from app.repositories import user_repository
from app.requests import extract_data


extract_router = APIRouter()


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
        raise HTTPException(status_code=400, detail="Unable to process file!")
