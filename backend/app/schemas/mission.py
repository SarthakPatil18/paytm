from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class MissionCreate(BaseModel):
    goal_category: str
    goal_title: str
    description: Optional[str] = None
    destination: Optional[str] = None
    target_amount: Optional[float] = None
    currency: str = "INR"
    deadline: Optional[datetime] = None
    timeline_text: Optional[str] = None


class MissionUpdate(BaseModel):
    goal_category: Optional[str] = None
    goal_title: Optional[str] = None
    description: Optional[str] = None
    destination: Optional[str] = None
    target_amount: Optional[float] = None
    currency: Optional[str] = None
    deadline: Optional[datetime] = None
    timeline_text: Optional[str] = None
    status: Optional[str] = None
    stage: Optional[int] = None


class MissionResponse(BaseModel):
    id: int
    user_id: int
    goal_category: str
    goal_title: str
    description: Optional[str] = None
    destination: Optional[str] = None
    target_amount: Optional[float] = None
    currency: str
    deadline: Optional[datetime] = None
    timeline_text: Optional[str] = None
    status: str
    stage: int = 1
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class GoalParseRequest(BaseModel):
    text: str


class GoalParseResponse(BaseModel):
    goal_category: Optional[str] = None
    goal_title: Optional[str] = None
    destination: Optional[str] = None
    target_amount: Optional[float] = None
    currency: str = "INR"
    deadline: Optional[datetime] = None
    timeline_text: Optional[str] = None
    description: Optional[str] = None
    confidence: float = 0.0
    needs_clarification: bool = False
    clarification_questions: list[str] = []


class ChatRequest(BaseModel):
    message: str
    mission_id: Optional[int] = None


class ChatResponse(BaseModel):
    reply: str
    suggested_actions: list[str] = []


# Readiness schemas
class ReadinessComponentResponse(BaseModel):
    name: str
    score: float
    weight: float
    max_score: float
    current: float
    details: List[str]
    missing: List[str]


class ReadinessResponse(BaseModel):
    overall_score: float
    components: List[ReadinessComponentResponse]
    what_is_affecting: List[str]
    next_improvement: Optional[str] = None
    stage_recommendation: int


# NBA schemas
class NBAResponse(BaseModel):
    action: str
    reason: str
    priority: str
    target_route: str
    icon: str
