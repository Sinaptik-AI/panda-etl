from pydantic import BaseModel
from typing import Any, Dict


class ProcessData(BaseModel):
    name: str
    type: str
    details: Dict[str, Any]
    project_id: str | int
