import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.deps import get_current_active_user, get_db
from app.models.models import PriceAlert, PriceAlertCreate, PriceAlertPublic, PriceAlertsPublic, User

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=PriceAlertsPublic)
async def list_alerts(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
) -> PriceAlertsPublic:
    result = await session.execute(
        select(PriceAlert).where(PriceAlert.user_id == current_user.id).order_by(PriceAlert.created_at.desc())
    )
    alerts = result.scalars().all()
    return PriceAlertsPublic(
        alerts=[PriceAlertPublic.model_validate(a) for a in alerts],
        total=len(alerts),
    )


@router.post("", response_model=PriceAlertPublic, status_code=201)
async def create_alert(
    data: PriceAlertCreate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
) -> PriceAlertPublic:
    if data.direction not in ("above", "below"):
        raise HTTPException(status_code=422, detail="direction must be 'above' or 'below'")

    # Limit: max 20 active alerts per user
    count_result = await session.execute(
        select(func.count(PriceAlert.id)).where(
            PriceAlert.user_id == current_user.id,
            PriceAlert.is_active == True,  # noqa: E712
            PriceAlert.is_triggered == False,  # noqa: E712
        )
    )
    if count_result.scalar_one() >= 20:
        raise HTTPException(status_code=400, detail="Maximum 20 active alerts reached")

    alert = PriceAlert(
        user_id=current_user.id,
        asset_id=data.asset_id,
        asset_symbol=data.asset_symbol.upper(),
        target_price=data.target_price,
        direction=data.direction,
        note=data.note,
    )
    session.add(alert)
    await session.commit()
    await session.refresh(alert)
    return PriceAlertPublic.model_validate(alert)


@router.delete("/{alert_id}", status_code=204)
async def delete_alert(
    alert_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
) -> None:
    result = await session.execute(
        select(PriceAlert).where(
            PriceAlert.id == alert_id,
            PriceAlert.user_id == current_user.id,
        )
    )
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    await session.delete(alert)
    await session.commit()
