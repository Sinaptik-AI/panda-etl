from pydantic import BaseModel
from typing import Any, Dict


class ProcessData(BaseModel):
    name: str
    type: str
    data: Dict[str, Any]
    project_id: str | int


class ProcessSuggestion(BaseModel):
    name: str
    type: str
    project_id: int
    output_type: str
