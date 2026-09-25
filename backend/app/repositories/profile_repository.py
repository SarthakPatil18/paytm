from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import Optional
from app.models.profile import FinancialProfile


class ProfileRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_user_id(self, user_id: int) -> Optional[FinancialProfile]:
        result = await self.db.execute(
            select(FinancialProfile).where(FinancialProfile.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def create_or_update(self, user_id: int, **fields) -> FinancialProfile:
        existing = await self.get_by_user_id(user_id)
        if existing:
            for key, value in fields.items():
                if value is not None:
                    setattr(existing, key, value)
            await self.db.flush()
            await self.db.refresh(existing)
            return existing
        else:
            profile = FinancialProfile(user_id=user_id, **fields)
            self.db.add(profile)
            await self.db.flush()
            await self.db.refresh(profile)
            return profile

    @staticmethod
    def calculate_completion(profile: FinancialProfile) -> float:
        """Calculate profile data completeness percentage."""
        required_fields = [
            profile.monthly_income,
            profile.monthly_expenses,
            profile.savings,
            profile.existing_emi,
            profile.employment_status,
        ]
        filled = sum(1 for f in required_fields if f is not None)
        return round((filled / len(required_fields)) * 100, 1)
