from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.mission import GoalParseRequest, GoalParseResponse
from app.services.ai.goal_understanding import goal_understanding_service

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
