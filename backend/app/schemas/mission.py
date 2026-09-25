from pydantic import BaseModel
from typing import Optional
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


class MissionResponse(BaseModel):
    id: int
    user_id: int
    goal_category: str
    goal_title: str
    description: Optional[str]
    destination: Optional[str]
    target_amount: Optional[float]
    currency: str
    deadline: Optional[datetime]
    timeline_text: Optional[str]
    status: str
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
