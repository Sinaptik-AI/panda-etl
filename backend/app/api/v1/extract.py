from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session


extract_router = APIRouter()


@extract_router.post("/", status_code=201)
async def extract(file: UploadFile = File(...)):
    try:
        return {
            "status": "success",
            "message": "File processed successfully",
            "data": {"data": "Dummy"},
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
