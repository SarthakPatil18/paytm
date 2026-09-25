from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class DocumentResponse(BaseModel):
    id: int
    user_id: int
    original_filename: str
    file_size: int
    mime_type: str
    document_type: Optional[str]
    classification_confidence: Optional[float]
    processing_status: str
    error_message: Optional[str]
    uploaded_at: datetime
    processed_at: Optional[datetime]

    model_config = {"from_attributes": True}


class DocumentExtractionResponse(BaseModel):
    id: int
    document_id: int
    extracted_fields: Optional[dict]
    edited_fields: Optional[dict]
    confirmed_fields: Optional[dict]
    extraction_confidence: Optional[float]
    is_confirmed: bool
    confirmed_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}


class ExtractionUpdateRequest(BaseModel):
    edited_fields: dict


class ExtractionConfirmRequest(BaseModel):
    confirmed_fields: dict


class DocumentClassifyRequest(BaseModel):
    document_type: str
