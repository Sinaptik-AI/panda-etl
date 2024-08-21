from datetime import datetime
from typing import List
from pydantic import BaseModel


class AssetBase(BaseModel):
    filename: str
    created_at: datetime
    updated_at: datetime


class Asset(AssetBase):
    id: int
    project_id: int

    class Config:
        orm_mode = True


class UrlAssetCreate(BaseModel):
    url: List[str]
