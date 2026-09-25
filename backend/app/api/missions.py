from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.repositories.mission_repository import MissionRepository
from app.repositories.audit_repository import AuditRepository
from app.schemas.mission import MissionCreate, MissionUpdate, MissionResponse, GoalParseRequest, GoalParseResponse
from app.services.ai.goal_understanding import goal_understanding_service

router = APIRouter(prefix="/api/missions", tags=["missions"])


@router.post("/", response_model=MissionResponse, status_code=status.HTTP_201_CREATED)
async def create_mission(
    mission_data: MissionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    mission_repo = MissionRepository(db)
    audit_repo = AuditRepository(db)

    mission = await mission_repo.create(
        user_id=current_user.id,
        goal_category=mission_data.goal_category,
        goal_title=mission_data.goal_title,
        description=mission_data.description,
        destination=mission_data.destination,
        target_amount=mission_data.target_amount,
        currency=mission_data.currency,
        deadline=mission_data.deadline,
        timeline_text=mission_data.timeline_text,
        status="ACTIVE",
    )

    await audit_repo.log(
        "MISSION_CREATED",
        user_id=current_user.id,
        resource_type="mission",
        resource_id=mission.id,
        metadata={"goal_category": mission.goal_category, "goal_title": mission.goal_title}
    )

    return MissionResponse.model_validate(mission)


@router.get("/", response_model=List[MissionResponse])
async def list_missions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    mission_repo = MissionRepository(db)
    missions = await mission_repo.get_by_user(current_user.id)
    return [MissionResponse.model_validate(m) for m in missions]


@router.get("/{mission_id}", response_model=MissionResponse)
async def get_mission(
    mission_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    mission_repo = MissionRepository(db)
    mission = await mission_repo.get_by_id(mission_id)

    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found.")
    if mission.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have access to this mission.")

    return MissionResponse.model_validate(mission)


@router.patch("/{mission_id}", response_model=MissionResponse)
async def update_mission(
    mission_id: int,
    update_data: MissionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    mission_repo = MissionRepository(db)
    audit_repo = AuditRepository(db)

    mission = await mission_repo.get_by_id(mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found.")
    if mission.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have access to this mission.")

    update_dict = update_data.model_dump(exclude_none=True)
    mission = await mission_repo.update(mission, **update_dict)

    await audit_repo.log(
        "MISSION_UPDATED",
        user_id=current_user.id,
        resource_type="mission",
        resource_id=mission.id,
        metadata=update_dict
    )

    return MissionResponse.model_validate(mission)
