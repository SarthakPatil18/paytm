from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Text, func, Boolean
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class DocumentType(str, enum.Enum):
    SALARY_SLIP = "salary_slip"
    BANK_STATEMENT = "bank_statement"
    SCHOLARSHIP_LETTER = "scholarship_letter"
    IDENTITY_DOCUMENT = "identity_document"
    LOAN_DOCUMENT = "loan_document"
    INSURANCE_DOCUMENT = "insurance_document"
    OTHER = "other"


class ProcessingStatus(str, enum.Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    CLASSIFIED = "classified"
    EXTRACTING = "extracting"
    EXTRACTED = "extracted"
    REVIEW_REQUIRED = "review_required"
    CONFIRMED = "confirmed"
    FAILED = "failed"


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    original_filename = Column(String, nullable=False)
    stored_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String, nullable=False)

    document_type = Column(String, nullable=True)
    classification_confidence = Column(Float, nullable=True)

    processing_status = Column(String, default=ProcessingStatus.UPLOADED)
    error_message = Column(Text, nullable=True)

    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    extractions = relationship("DocumentExtraction", back_populates="document", cascade="all, delete-orphan")
    mission_documents = relationship("MissionDocument", back_populates="document", cascade="all, delete-orphan")


class DocumentExtraction(Base):
    __tablename__ = "document_extractions"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)

    extracted_fields = Column(JSON, nullable=True)  # Raw extracted key-value pairs
    edited_fields = Column(JSON, nullable=True)     # User-edited version
    confirmed_fields = Column(JSON, nullable=True)  # Final confirmed data

    extraction_confidence = Column(Float, nullable=True)
    is_confirmed = Column(Boolean, default=False)
    confirmed_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    document = relationship("Document", back_populates="extractions")


class MissionDocument(Base):
    __tablename__ = "mission_documents"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("financial_missions.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    mission = relationship("FinancialMission", back_populates="mission_documents")
    document = relationship("Document", back_populates="mission_documents")
