from datetime import datetime
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