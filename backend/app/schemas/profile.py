from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProfileUpdate(BaseModel):
    monthly_income: Optional[float] = None
    monthly_expenses: Optional[float] = None
    savings: Optional[float] = None
    existing_emi: Optional[float] = None
    monthly_investments: Optional[float] = None
    dependents: Optional[int] = None
    income_source: Optional[str] = None
    employment_status: Optional[str] = None
    employment_experience_years: Optional[float] = None
    currency: Optional[str] = None


class ProfileResponse(BaseModel):
    id: int
    user_id: int
    monthly_income: Optional[float] = None
    monthly_expenses: Optional[float] = None
    savings: Optional[float] = None
    existing_emi: Optional[float] = None
    monthly_investments: Optional[float] = None
    dependents: Optional[int] = None
    income_source: Optional[str] = None
    employment_status: Optional[str] = None
    employment_experience_years: Optional[float] = None
    currency: str = "INR"
    completion_percentage: float = 0.0
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
