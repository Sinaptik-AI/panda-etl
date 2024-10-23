from typing import Dict, List, Optional
from pydantic import BaseModel


class SentenceMetadata(BaseModel):
    page_number: Optional[int] = None

class StructuredSentence(BaseModel):
    text: str
    metadata: Optional[SentenceMetadata] = None

class TextExtractionResponse(BaseModel):
    content: List[StructuredSentence]
    word_count: int
    lang: str


class ReferenceData(BaseModel):
    name: str
    sources: List[str]
    page_numbers: Optional[List[int]] = None


class ExtractFieldsResponse(BaseModel):
    fields: List[Dict]
    references: Optional[List[List[ReferenceData]]]
