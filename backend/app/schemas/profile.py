from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProfileUpdate(BaseModel):
    monthly_income: Optional[float] = None
    monthly_expenses: Optional[float] = None
    savings: Optional[float] = None
    existing_emi: Optional[float] = None
    income_source: Optional[str] = None
    employment_status: Optional[str] = None
    currency: Optional[str] = None


class ProfileResponse(BaseModel):
    id: int
    user_id: int
    monthly_income: Optional[float]
    monthly_expenses: Optional[float]
    savings: Optional[float]
    existing_emi: Optional[float]
    income_source: Optional[str]
    employment_status: Optional[str]
    currency: str
    completion_percentage: float
    updated_at: datetime

    model_config = {"from_attributes": True}
