from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.mission import GoalParseRequest, GoalParseResponse, ChatRequest, ChatResponse, NBAResponse, ReadinessResponse, ReadinessComponentResponse
from app.services.ai.goal_understanding import goal_understanding_service
from app.services.missions.readiness import readiness_engine
from app.services.missions.nba import nba_engine
from app.repositories.mission_repository import MissionRepository
from app.repositories.document_repository import DocumentRepository
from app.repositories.profile_repository import ProfileRepository

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/parse-goal", response_model=GoalParseResponse)
async def parse_goal(
    request: GoalParseRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Parse a natural-language goal description into structured data.
    This endpoint uses AI to extract goal information but does NOT create a mission.
    The user must review and confirm before a mission is created.
    """
    result = await goal_understanding_service.parse_goal(request.text)
    return result


@router.post("/chat", response_model=ChatResponse)
async def chat_assistant(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Conversational financial journey assistant.
    Provides contextual advice based on the user's active mission, documents, and profile.
    AI explains application state — it does not fabricate financial data.
    """
    mission_repo = MissionRepository(db)
    doc_repo = DocumentRepository(db)
    profile_repo = ProfileRepository(db)

    # Gather context
    missions = await mission_repo.get_by_user(current_user.id)
    active_mission = next((m for m in missions if m.status == "ACTIVE"), missions[0] if missions else None)

    docs = await doc_repo.get_by_user(current_user.id)
    unverified = [d.original_filename for d in docs if d.processing_status in ("review_required", "extracted")]

    profile = await profile_repo.get_by_user_id(current_user.id)
    profile_pct = int(ProfileRepository.calculate_completion(profile)) if profile else 0

    # Build readiness if we have a mission
    readiness_score = 0.0
    if active_mission:
        profile_dict = {
            "monthly_income": profile.monthly_income if profile else None,
            "monthly_expenses": profile.monthly_expenses if profile else None,
            "savings": profile.savings if profile else None,
            "existing_emi": profile.existing_emi if profile else None,
            "employment_status": profile.employment_status if profile else None,
        }
        docs_list = [
            {"id": d.id, "document_type": d.document_type, "processing_status": d.processing_status, "original_filename": d.original_filename}
            for d in docs
        ]
        mission_dict = {
            "id": active_mission.id,
            "goal_category": active_mission.goal_category,
            "goal_title": active_mission.goal_title,
            "description": active_mission.description,
            "destination": active_mission.destination,
            "target_amount": active_mission.target_amount,
            "deadline": active_mission.deadline.isoformat() if active_mission.deadline else None,
            "timeline_text": active_mission.timeline_text,
            "stage": active_mission.stage,
        }
        report = readiness_engine.calculate(mission_dict, profile_dict, docs_list)
        readiness_score = report.overall_score

    context = {
        "mission_title": active_mission.goal_title if active_mission else "Financial Mission",
        "target_amount": active_mission.target_amount if active_mission else 0,
        "goal_category": active_mission.goal_category if active_mission else None,
        "profile_completion": profile_pct,
        "doc_count": len(docs),
        "unverified_docs": unverified,
        "readiness_score": readiness_score,
    }

    result = await goal_understanding_service.chat(request.message, context)
    return ChatResponse(**result)


@router.get("/nba", response_model=NBAResponse)
async def get_global_nba(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get the Next Best Action across all missions (global view).
    Uses the active mission if one exists.
    Purely deterministic — no LLM involved.
    """
    mission_repo = MissionRepository(db)
    doc_repo = DocumentRepository(db)
    profile_repo = ProfileRepository(db)

    missions = await mission_repo.get_by_user(current_user.id)
    active_mission = next((m for m in missions if m.status == "ACTIVE"), None)

    docs = await doc_repo.get_by_user(current_user.id)
    profile = await profile_repo.get_by_user_id(current_user.id)

    mission_dict = None
    if active_mission:
        mission_dict = {
            "id": active_mission.id,
            "goal_category": active_mission.goal_category,
            "stage": active_mission.stage,
            "deadline": active_mission.deadline.isoformat() if active_mission.deadline else None,
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
        {"id": d.id, "document_type": d.document_type, "processing_status": d.processing_status, "original_filename": d.original_filename}
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


@router.get("/readiness", response_model=ReadinessResponse)
async def get_global_readiness(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get overall readiness across all missions (uses active mission).
    Deterministic calculation only.
    """
    mission_repo = MissionRepository(db)
    doc_repo = DocumentRepository(db)
    profile_repo = ProfileRepository(db)

    missions = await mission_repo.get_by_user(current_user.id)
    active_mission = next((m for m in missions if m.status == "ACTIVE"), None)

    docs = await doc_repo.get_by_user(current_user.id)
    profile = await profile_repo.get_by_user_id(current_user.id)

    mission_dict = None
    if active_mission:
        mission_dict = {
            "id": active_mission.id,
            "goal_category": active_mission.goal_category,
            "goal_title": active_mission.goal_title,
            "description": active_mission.description,
            "destination": active_mission.destination,
            "target_amount": active_mission.target_amount,
            "deadline": active_mission.deadline.isoformat() if active_mission.deadline else None,
            "timeline_text": active_mission.timeline_text,
            "stage": active_mission.stage,
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
        {"id": d.id, "document_type": d.document_type, "processing_status": d.processing_status, "original_filename": d.original_filename}
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
