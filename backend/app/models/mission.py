from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text, func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class MissionStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"


class GoalCategory(str, enum.Enum):
    EDUCATION = "education"
    HEALTHCARE = "healthcare"
    HOME = "home"
    VEHICLE = "vehicle"
    BUSINESS = "business"
    EMERGENCY = "emergency"
    OTHER = "other"


class FinancialMission(Base):
    __tablename__ = "financial_missions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    goal_category = Column(String, nullable=False)
    goal_title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    destination = Column(String, nullable=True)

    target_amount = Column(Float, nullable=True)
    currency = Column(String, default="INR")

    deadline = Column(DateTime(timezone=True), nullable=True)
    timeline_text = Column(String, nullable=True)

    status = Column(String, default=MissionStatus.ACTIVE)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    mission_documents = relationship("MissionDocument", back_populates="mission", cascade="all, delete-orphan")
