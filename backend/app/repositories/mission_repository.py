from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import Optional, List
from app.models.mission import FinancialMission
from app.models.document import MissionDocument


class MissionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, mission_id: int) -> Optional[FinancialMission]:
        result = await self.db.execute(
            select(FinancialMission).where(FinancialMission.id == mission_id)
        )
        return result.scalar_one_or_none()

    async def get_by_user(self, user_id: int) -> List[FinancialMission]:
        result = await self.db.execute(
            select(FinancialMission)
            .where(FinancialMission.user_id == user_id)
            .order_by(FinancialMission.created_at.desc())
        )
        return list(result.scalars().all())

    async def create(self, user_id: int, **fields) -> FinancialMission:
        mission = FinancialMission(user_id=user_id, **fields)
        self.db.add(mission)
        await self.db.flush()
        await self.db.refresh(mission)
        return mission

    async def update(self, mission: FinancialMission, **fields) -> FinancialMission:
        for key, value in fields.items():
            if value is not None:
                setattr(mission, key, value)
        await self.db.flush()
        await self.db.refresh(mission)
        return mission

    async def add_document(self, mission_id: int, document_id: int) -> MissionDocument:
        # Check if already linked
        result = await self.db.execute(
            select(MissionDocument).where(
                MissionDocument.mission_id == mission_id,
                MissionDocument.document_id == document_id
            )
        )
        existing = result.scalar_one_or_none()
        if existing:
            return existing

        link = MissionDocument(mission_id=mission_id, document_id=document_id)
        self.db.add(link)
        await self.db.flush()
        return link
