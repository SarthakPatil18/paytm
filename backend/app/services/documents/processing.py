"""
DocumentProcessingService — handles file validation, storage, and processing pipeline.
"""
import logging
import uuid
import os
from pathlib import Path
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.core.config import settings
from app.models.document import Document, DocumentExtraction, ProcessingStatus
from app.services.ai.document_classification import document_classification_service

logger = logging.getLogger(__name__)

ALLOWED_MIME_TYPES = {
    "pdf": "application/pdf",
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
}


class DocumentProcessingService:

    def validate_file(self, filename: str, file_size: int, content_type: str) -> tuple[bool, str]:
        """Validate file type and size. Returns (is_valid, error_message)."""
        ext = Path(filename).suffix.lower().lstrip(".")

        if ext not in settings.allowed_extensions_list:
            return False, f"Unsupported file format '.{ext}'. Please upload PDF, PNG, JPG, or JPEG files."

        if file_size > settings.max_file_size_bytes:
            return False, f"File is too large ({file_size // (1024*1024)}MB). Maximum allowed size is {settings.MAX_FILE_SIZE_MB}MB."

        return True, ""

    async def save_file(self, file_content: bytes, original_filename: str, user_id: int) -> tuple[str, str]:
        """Save file to storage and return (stored_filename, file_path)."""
        ext = Path(original_filename).suffix.lower()
        stored_filename = f"user_{user_id}_{uuid.uuid4().hex}{ext}"

        storage_dir = Path(settings.STORAGE_PATH) / "documents" / str(user_id)
        storage_dir.mkdir(parents=True, exist_ok=True)

        file_path = storage_dir / stored_filename
        with open(file_path, "wb") as f:
            f.write(file_content)

        return stored_filename, str(file_path)

    def get_mime_type(self, filename: str) -> str:
        """Get MIME type from filename extension."""
        ext = Path(filename).suffix.lower().lstrip(".")
        return ALLOWED_MIME_TYPES.get(ext, "application/octet-stream")

    async def process_document(self, db: AsyncSession, document_id: int) -> bool:
        """
        Run the full classification + extraction pipeline for a document.
        Returns True if successful.
        """
        # Get document
        result = await db.execute(select(Document).where(Document.id == document_id))
        document = result.scalar_one_or_none()
        if not document:
            logger.error(f"Document {document_id} not found")
            return False

        try:
            # Step 1: Classify
            await db.execute(
                update(Document)
                .where(Document.id == document_id)
                .values(processing_status=ProcessingStatus.CLASSIFIED)
            )
            await db.commit()

            classification = await document_classification_service.classify_document(
                document.file_path, document.mime_type
            )

            doc_type = classification.get("document_type", "other")
            confidence = classification.get("confidence", 0.5)

            await db.execute(
                update(Document)
                .where(Document.id == document_id)
                .values(
                    document_type=doc_type,
                    classification_confidence=confidence,
                    processing_status=ProcessingStatus.EXTRACTING
                )
            )
            await db.commit()

            # Step 2: Extract fields
            extraction_result = await document_classification_service.extract_fields(
                document.file_path, document.mime_type, doc_type
            )

            extracted_fields = extraction_result.get("fields", {})
            extraction_confidence = extraction_result.get("confidence", 0.0)

            # Save extraction
            existing = await db.execute(
                select(DocumentExtraction).where(DocumentExtraction.document_id == document_id)
            )
            existing_extraction = existing.scalar_one_or_none()

            if existing_extraction:
                await db.execute(
                    update(DocumentExtraction)
                    .where(DocumentExtraction.id == existing_extraction.id)
                    .values(
                        extracted_fields=extracted_fields,
                        extraction_confidence=extraction_confidence
                    )
                )
            else:
                new_extraction = DocumentExtraction(
                    document_id=document_id,
                    extracted_fields=extracted_fields,
                    extraction_confidence=extraction_confidence
                )
                db.add(new_extraction)

            await db.execute(
                update(Document)
                .where(Document.id == document_id)
                .values(
                    processing_status=ProcessingStatus.REVIEW_REQUIRED,
                    processed_at=datetime.utcnow()
                )
            )
            await db.commit()

            logger.info(f"Document {document_id} processed successfully. Type: {doc_type}, Confidence: {confidence}")
            return True

        except Exception as e:
            logger.error(f"Error processing document {document_id}: {e}")
            await db.execute(
                update(Document)
                .where(Document.id == document_id)
                .values(
                    processing_status=ProcessingStatus.FAILED,
                    error_message=str(e)
                )
            )
            await db.commit()
            return False


document_processing_service = DocumentProcessingService()
