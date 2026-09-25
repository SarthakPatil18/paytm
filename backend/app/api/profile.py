from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.repositories.profile_repository import ProfileRepository
from app.repositories.audit_repository import AuditRepository
from app.schemas.profile import ProfileResponse, ProfileUpdate

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("/", response_model=ProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)

    if not profile:
        # Return empty profile
        from app.models.profile import FinancialProfile
        from datetime import datetime
        empty = FinancialProfile(
            id=0,
            user_id=current_user.id,
            currency="INR",
            updated_at=datetime.utcnow()
        )
        return ProfileResponse(
            id=0,
            user_id=current_user.id,
            monthly_income=None,
            monthly_expenses=None,
            savings=None,
            existing_emi=None,
            income_source=None,
            employment_status=None,
            currency="INR",
            completion_percentage=0.0,
            updated_at=datetime.utcnow()
        )

    completion = ProfileRepository.calculate_completion(profile)
    response_data = {
        **{col: getattr(profile, col) for col in [
            "id", "user_id", "monthly_income", "monthly_expenses",
            "savings", "existing_emi", "income_source", "employment_status",
            "currency", "updated_at"
        ]},
        "completion_percentage": completion
    }
    return ProfileResponse(**response_data)


@router.patch("/", response_model=ProfileResponse)
async def update_profile(
    update_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile_repo = ProfileRepository(db)
    audit_repo = AuditRepository(db)

    update_dict = update_data.model_dump(exclude_none=True)
    profile = await profile_repo.create_or_update(current_user.id, **update_dict)

    await audit_repo.log(
        "PROFILE_UPDATED",
        user_id=current_user.id,
        resource_type="profile",
        resource_id=profile.id,
        metadata={"updated_fields": list(update_dict.keys())}
    )

    completion = ProfileRepository.calculate_completion(profile)
    return ProfileResponse(
        **{col: getattr(profile, col) for col in [
            "id", "user_id", "monthly_income", "monthly_expenses",
            "savings", "existing_emi", "income_source", "employment_status",
            "currency", "updated_at"
        ]},
        completion_percentage=completion
    )
