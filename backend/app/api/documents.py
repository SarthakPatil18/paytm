from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.document import ProcessingStatus
from app.repositories.document_repository import DocumentRepository
from app.repositories.mission_repository import MissionRepository
from app.repositories.profile_repository import ProfileRepository
from app.repositories.audit_repository import AuditRepository
from app.schemas.document import (
    DocumentResponse, DocumentExtractionResponse,
    ExtractionUpdateRequest, ExtractionConfirmRequest, DocumentClassifyRequest
)
from app.services.documents.processing import document_processing_service
from app.services.ai.profile_extraction import profile_extraction_service

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.post("/upload", response_model=DocumentResponse, status_code=201)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    mission_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a document and start the processing pipeline."""
    content = await file.read()
    file_size = len(content)

    # Validate
    is_valid, error_msg = document_processing_service.validate_file(
        file.filename, file_size, file.content_type
    )
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    # Check for duplicate (same filename + same user)
    doc_repo = DocumentRepository(db)
    existing_docs = await doc_repo.get_by_user(current_user.id)
    for existing in existing_docs:
        if existing.original_filename == file.filename:
            raise HTTPException(
                status_code=409,
                detail=f"A document named '{file.filename}' has already been uploaded. Please rename the file or delete the existing one."
            )

    # Save file
    stored_filename, file_path = await document_processing_service.save_file(
        content, file.filename, current_user.id
    )
    mime_type = document_processing_service.get_mime_type(file.filename)

    # Create DB record
    document = await doc_repo.create(
        user_id=current_user.id,
        original_filename=file.filename,
        stored_filename=stored_filename,
        file_path=file_path,
        file_size=file_size,
        mime_type=mime_type,
        processing_status=ProcessingStatus.UPLOADED
    )

    # Link to mission if provided
    if mission_id:
        mission_repo = MissionRepository(db)
        mission = await mission_repo.get_by_id(mission_id)
        if mission and mission.user_id == current_user.id:
            await mission_repo.add_document(mission_id, document.id)

    # Audit log
    audit_repo = AuditRepository(db)
    await audit_repo.log(
        "DOCUMENT_UPLOADED",
        user_id=current_user.id,
        resource_type="document",
        resource_id=document.id,
        metadata={"filename": file.filename, "size": file_size}
    )

    await db.commit()
    await db.refresh(document)

    # Start background processing
    background_tasks.add_task(_process_document_bg, document.id)

    return DocumentResponse.model_validate(document)


async def _process_document_bg(document_id: int):
    """Background task to process document after upload."""
    from app.core.database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        try:
            await document_processing_service.process_document(db, document_id)
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Background processing failed for doc {document_id}: {e}")


@router.get("/", response_model=List[DocumentResponse])
async def list_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    doc_repo = DocumentRepository(db)
    docs = await doc_repo.get_by_user(current_user.id)
    return [DocumentResponse.model_validate(d) for d in docs]


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    doc_repo = DocumentRepository(db)
    doc = await doc_repo.get_by_id(document_id)

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    if doc.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have access to this document.")

    return DocumentResponse.model_validate(doc)


@router.post("/{document_id}/process", response_model=DocumentResponse)
async def reprocess_document(
    document_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Manually trigger document processing (e.g., after classification correction)."""
    doc_repo = DocumentRepository(db)
    doc = await doc_repo.get_by_id(document_id)

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    if doc.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have access to this document.")

    background_tasks.add_task(_process_document_bg, document_id)
    return DocumentResponse.model_validate(doc)


@router.patch("/{document_id}/classify", response_model=DocumentResponse)
async def set_document_type(
    document_id: int,
    classify_data: DocumentClassifyRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Manually set document type when AI confidence is low."""
    doc_repo = DocumentRepository(db)
    doc = await doc_repo.get_by_id(document_id)

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    if doc.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have access to this document.")

    doc.document_type = classify_data.document_type
    doc.classification_confidence = 1.0  # User manually set it
    await db.commit()
    await db.refresh(doc)

    background_tasks.add_task(_process_document_bg, document_id)
    return DocumentResponse.model_validate(doc)


@router.get("/{document_id}/extraction", response_model=DocumentExtractionResponse)
async def get_extraction(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    doc_repo = DocumentRepository(db)
    doc = await doc_repo.get_by_id(document_id)

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    if doc.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have access to this document.")

    extraction = await doc_repo.get_extraction(document_id)
    if not extraction:
        raise HTTPException(status_code=404, detail="No extraction data available yet. The document may still be processing.")

    return DocumentExtractionResponse.model_validate(extraction)


@router.patch("/{document_id}/extraction", response_model=DocumentExtractionResponse)
async def update_extraction(
    document_id: int,
    update_data: ExtractionUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """User edits the extracted fields before confirming."""
    doc_repo = DocumentRepository(db)
    doc = await doc_repo.get_by_id(document_id)

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    if doc.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have access to this document.")

    extraction = await doc_repo.get_extraction(document_id)
    if not extraction:
        raise HTTPException(status_code=404, detail="No extraction data to edit.")

    extraction.edited_fields = update_data.edited_fields
    await db.commit()
    await db.refresh(extraction)

    return DocumentExtractionResponse.model_validate(extraction)


@router.post("/{document_id}/confirm", response_model=DocumentExtractionResponse)
async def confirm_extraction(
    document_id: int,
    confirm_data: ExtractionConfirmRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """User confirms the extracted information and it updates the financial profile."""
    doc_repo = DocumentRepository(db)
    doc = await doc_repo.get_by_id(document_id)

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    if doc.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have access to this document.")

    extraction = await doc_repo.get_extraction(document_id)
    if not extraction:
        raise HTTPException(status_code=404, detail="No extraction data to confirm.")

    # Save confirmed fields
    extraction.confirmed_fields = confirm_data.confirmed_fields
    extraction.is_confirmed = True
    extraction.confirmed_at = datetime.utcnow()
    doc.processing_status = ProcessingStatus.CONFIRMED

    # Update financial profile from confirmed fields
    if doc.document_type:
        profile_updates = profile_extraction_service.extract_profile_updates(
            doc.document_type, confirm_data.confirmed_fields
        )
        if profile_updates:
            profile_repo = ProfileRepository(db)
            await profile_repo.create_or_update(current_user.id, **profile_updates)

    # Audit log
    audit_repo = AuditRepository(db)
    await audit_repo.log(
        "EXTRACTION_CONFIRMED",
        user_id=current_user.id,
        resource_type="document",
        resource_id=document_id,
        metadata={"document_type": doc.document_type}
    )

    if profile_updates:
        await audit_repo.log(
            "PROFILE_UPDATED",
            user_id=current_user.id,
            resource_type="profile",
            metadata={"updated_fields": list(profile_updates.keys())}
        )

    await db.commit()
    await db.refresh(extraction)

    return DocumentExtractionResponse.model_validate(extraction)
