from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.mission import GoalParseRequest, GoalParseResponse, ChatRequest, ChatResponse
from app.services.ai.goal_understanding import goal_understanding_service
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
    """
    mission_repo = MissionRepository(db)
    doc_repo = DocumentRepository(db)
    profile_repo = ProfileRepository(db)

    # Gather context
    missions = await mission_repo.get_by_user(current_user.id)
    active_mission = next((m for m in missions if m.status == "ACTIVE"), missions[0] if missions else None)
    
    docs = await doc_repo.get_by_user(current_user.id)
    unverified = [d.original_filename for d in docs if d.processing_status in ("review_required", "extracted")]

    profile = await profile_repo.get_or_create(current_user.id)
    profile_pct = int(profile_repo.calculate_completion(profile))

    context = {
        "mission_title": active_mission.goal_title if active_mission else "Financial Mission",
        "target_amount": active_mission.target_amount if active_mission else 0,
        "profile_completion": profile_pct,
        "doc_count": len(docs),
        "unverified_docs": unverified,
    }

    result = await goal_understanding_service.chat(request.message, context)
    return ChatResponse(**result)

