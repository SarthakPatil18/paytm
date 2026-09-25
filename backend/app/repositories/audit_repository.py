from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit import AuditLog
from typing import Optional, Any


class AuditRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def log(
        self,
        event: str,
        user_id: Optional[int] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[int] = None,
        metadata: Optional[dict] = None
    ) -> AuditLog:
        log = AuditLog(
            event=event,
            user_id=user_id,
            resource_type=resource_type,
            resource_id=resource_id,
            metadata_=metadata or {}
        )
        self.db.add(log)
        await self.db.flush()
        return log
