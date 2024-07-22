from pydantic import BaseModel
from typing import Any, Dict


class ProcessData(BaseModel):
    type: str
    details: Dict[str, Any]
    project_id: str | int
