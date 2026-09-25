from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from app.core.database import Base


class FinancialProfile(Base):
    __tablename__ = "financial_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    monthly_income = Column(Float, nullable=True)
    monthly_expenses = Column(Float, nullable=True)
    savings = Column(Float, nullable=True)
    existing_emi = Column(Float, nullable=True)

    income_source = Column(String, nullable=True)
    employment_status = Column(String, nullable=True)

    currency = Column(String, default="INR")

    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
