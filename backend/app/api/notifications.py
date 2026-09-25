from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.repositories.notification_repository import NotificationRepository
from app.schemas.notification import NotificationResponse, NotificationSummary

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("/", response_model=List[NotificationResponse])
async def list_notifications(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List user's notifications, newest first."""
    repo = NotificationRepository(db)
    notifications = await repo.get_by_user(current_user.id, limit=limit)
    return [NotificationResponse.model_validate(n) for n in notifications]


@router.get("/summary", response_model=NotificationSummary)
async def notification_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return unread count and latest notifications for the bell icon."""
    repo = NotificationRepository(db)
    unread = await repo.get_unread_count(current_user.id)
    notifications = await repo.get_by_user(current_user.id, limit=5)
    return NotificationSummary(
        unread_count=unread,
        notifications=[NotificationResponse.model_validate(n) for n in notifications],
    )


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
async def mark_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = NotificationRepository(db)
    notif = await repo.mark_read(notification_id, current_user.id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found.")
    await db.commit()
    await db.refresh(notif)
    return NotificationResponse.model_validate(notif)


@router.post("/mark-all-read")
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = NotificationRepository(db)
    count = await repo.mark_all_read(current_user.id)
    await db.commit()
    return {"marked_read": count}
