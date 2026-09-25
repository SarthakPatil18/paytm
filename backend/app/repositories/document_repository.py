from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
from app.models.document import Document, DocumentExtraction


class DocumentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, document_id: int) -> Optional[Document]:
        result = await self.db.execute(
            select(Document).where(Document.id == document_id)
        )
        return result.scalar_one_or_none()

    async def get_by_user(self, user_id: int) -> List[Document]:
        result = await self.db.execute(
            select(Document)
            .where(Document.user_id == user_id)
            .order_by(Document.uploaded_at.desc())
        )
        return list(result.scalars().all())

    async def create(self, **fields) -> Document:
        doc = Document(**fields)
        self.db.add(doc)
        await self.db.flush()
        await self.db.refresh(doc)
        return doc

    async def get_extraction(self, document_id: int) -> Optional[DocumentExtraction]:
        result = await self.db.execute(
            select(DocumentExtraction).where(DocumentExtraction.document_id == document_id)
        )
        return result.scalar_one_or_none()
