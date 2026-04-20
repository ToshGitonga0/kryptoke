import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, update

from app.core.deps import get_current_active_user, get_db
from app.models.models import Notification, NotificationPublic, NotificationsPublic, User

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=NotificationsPublic)
async def list_notifications(
    skip: int = 0,
    limit: int = 30,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
) -> NotificationsPublic:
    result = await session.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    notifications = result.scalars().all()

    unread_result = await session.execute(
        select(func.count(Notification.id)).where(
            Notification.user_id == current_user.id,
            Notification.is_read == False,  # noqa: E712
        )
    )
    unread_count = unread_result.scalar_one()

    return NotificationsPublic(
        notifications=[NotificationPublic.model_validate(n) for n in notifications],
        unread_count=unread_count,
    )


@router.patch("/read-all", status_code=204)
async def mark_all_read(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
) -> None:
    await session.execute(
        update(Notification)
        .where(Notification.user_id == current_user.id, Notification.is_read == False)  # noqa: E712
        .values(is_read=True)
    )
    await session.commit()


@router.patch("/{notification_id}/read", response_model=NotificationPublic)
async def mark_read(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
) -> NotificationPublic:
    from fastapi import HTTPException

    result = await session.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
    )
    notif = result.scalar_one_or_none()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    session.add(notif)
    await session.commit()
    await session.refresh(notif)
    return NotificationPublic.model_validate(notif)
