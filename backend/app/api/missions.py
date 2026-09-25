from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.repositories.mission_repository import MissionRepository
from app.repositories.audit_repository import AuditRepository
from app.repositories.document_repository import DocumentRepository
from app.repositories.profile_repository import ProfileRepository
from app.schemas.mission import (
    MissionCreate, MissionUpdate, MissionResponse,
    GoalParseRequest, GoalParseResponse,
    ReadinessResponse, ReadinessComponentResponse, NBAResponse,
)
from app.services.ai.goal_understanding import goal_understanding_service
from app.services.missions.readiness import readiness_engine
from app.services.missions.nba import nba_engine

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

    await db.commit()
    await db.refresh(mission)
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

    await db.commit()
    await db.refresh(mission)
    return MissionResponse.model_validate(mission)


@router.get("/{mission_id}/readiness", response_model=ReadinessResponse)
async def get_mission_readiness(
    mission_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Calculate the financial readiness score for a mission.
    This is a deterministic calculation — not AI-generated.
    The score reflects verifiable application state only.
    """
    mission_repo = MissionRepository(db)
    doc_repo = DocumentRepository(db)
    profile_repo = ProfileRepository(db)

    mission = await mission_repo.get_by_id(mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found.")
    if mission.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have access to this mission.")

    docs = await doc_repo.get_by_user(current_user.id)
    profile = await profile_repo.get_by_user_id(current_user.id)

    # Convert to plain dicts for the engine
    mission_dict = {
        "id": mission.id,
        "goal_category": mission.goal_category,
        "goal_title": mission.goal_title,
        "description": mission.description,
        "destination": mission.destination,
        "target_amount": mission.target_amount,
        "deadline": mission.deadline.isoformat() if mission.deadline else None,
        "timeline_text": mission.timeline_text,
        "stage": mission.stage,
    }
    profile_dict = None
    if profile:
        profile_dict = {
            "monthly_income": profile.monthly_income,
            "monthly_expenses": profile.monthly_expenses,
            "savings": profile.savings,
            "existing_emi": profile.existing_emi,
            "employment_status": profile.employment_status,
        }
    docs_list = [
        {
            "id": d.id,
            "document_type": d.document_type,
            "processing_status": d.processing_status,
            "original_filename": d.original_filename,
        }
        for d in docs
    ]

    report = readiness_engine.calculate(mission_dict, profile_dict, docs_list)

    return ReadinessResponse(
        overall_score=report.overall_score,
        components=[
            ReadinessComponentResponse(
                name=c.name,
                score=c.score,
                weight=c.weight,
                max_score=c.max_score,
                current=c.current,
                details=c.details,
                missing=c.missing,
            )
            for c in report.components
        ],
        what_is_affecting=report.what_is_affecting,
        next_improvement=report.next_improvement,
        stage_recommendation=report.stage_recommendation,
    )


@router.get("/{mission_id}/nba", response_model=NBAResponse)
async def get_next_best_action(
    mission_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get the Next Best Action for a specific mission.
    Determined by deterministic rules — not AI-generated.
    """
    mission_repo = MissionRepository(db)
    doc_repo = DocumentRepository(db)
    profile_repo = ProfileRepository(db)

    mission = await mission_repo.get_by_id(mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found.")
    if mission.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have access to this mission.")

    docs = await doc_repo.get_by_user(current_user.id)
    profile = await profile_repo.get_by_user_id(current_user.id)

    mission_dict = {
        "id": mission.id,
        "goal_category": mission.goal_category,
        "stage": mission.stage,
        "deadline": mission.deadline.isoformat() if mission.deadline else None,
    }
    profile_dict = None
    if profile:
        profile_dict = {
            "monthly_income": profile.monthly_income,
            "monthly_expenses": profile.monthly_expenses,
            "savings": profile.savings,
            "existing_emi": profile.existing_emi,
            "employment_status": profile.employment_status,
        }
    docs_list = [
        {
            "id": d.id,
            "document_type": d.document_type,
            "processing_status": d.processing_status,
            "original_filename": d.original_filename,
        }
        for d in docs
    ]

    action = nba_engine.get_next_action(mission_dict, profile_dict, docs_list)
    return NBAResponse(
        action=action.action,
        reason=action.reason,
        priority=action.priority,
        target_route=action.target_route,
        icon=action.icon,
    )
