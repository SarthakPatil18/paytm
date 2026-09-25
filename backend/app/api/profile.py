from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.repositories.profile_repository import ProfileRepository
from app.repositories.audit_repository import AuditRepository
from app.schemas.profile import ProfileResponse, ProfileUpdate

router = APIRouter(prefix="/api/profile", tags=["profile"])

PROFILE_RESPONSE_FIELDS = [
    "id", "user_id", "monthly_income", "monthly_expenses",
    "savings", "existing_emi", "monthly_investments", "dependents",
    "income_source", "employment_status", "employment_experience_years",
    "currency", "updated_at"
]


def _build_profile_response(profile, completion: float) -> ProfileResponse:
    data = {col: getattr(profile, col, None) for col in PROFILE_RESPONSE_FIELDS}
    data["completion_percentage"] = completion
    return ProfileResponse(**data)


@router.get("/", response_model=ProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)

    if not profile:
        from datetime import datetime
        return ProfileResponse(
            id=0,
            user_id=current_user.id,
            currency="INR",
            completion_percentage=0.0,
            updated_at=datetime.utcnow(),
        )

    completion = ProfileRepository.calculate_completion(profile)
    return _build_profile_response(profile, completion)


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

    await db.commit()
    await db.refresh(profile)

    completion = ProfileRepository.calculate_completion(profile)
    return _build_profile_response(profile, completion)
