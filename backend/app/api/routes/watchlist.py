from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.deps import get_current_active_user, get_db
from app.models.models import Asset, User, WatchlistItem, WatchlistPublic

router = APIRouter(prefix="/watchlist", tags=["watchlist"])


@router.get("", response_model=WatchlistPublic)
async def get_watchlist(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
) -> WatchlistPublic:
    result = await session.execute(
        select(WatchlistItem).where(WatchlistItem.user_id == current_user.id).order_by(WatchlistItem.created_at.desc())
    )
    items = result.scalars().all()
    return WatchlistPublic(items=[i.asset_symbol for i in items])


@router.post("/{symbol}", status_code=201)
async def add_to_watchlist(
    symbol: str,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
) -> dict:
    symbol = symbol.upper()
    asset_result = await session.execute(select(Asset).where(Asset.symbol == symbol, Asset.is_active == True))  # noqa: E712
    asset = asset_result.scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset {symbol} not found")

    # Idempotent
    existing = await session.execute(
        select(WatchlistItem).where(
            WatchlistItem.user_id == current_user.id,
            WatchlistItem.asset_id == asset.id,
        )
    )
    if existing.scalar_one_or_none():
        return {"message": "Already in watchlist"}

    item = WatchlistItem(
        user_id=current_user.id,
        asset_id=asset.id,
        asset_symbol=symbol,
    )
    session.add(item)
    await session.commit()
    return {"message": f"{symbol} added to watchlist"}


@router.delete("/{symbol}", status_code=204)
async def remove_from_watchlist(
    symbol: str,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
) -> None:
    symbol = symbol.upper()
    result = await session.execute(
        select(WatchlistItem).where(
            WatchlistItem.user_id == current_user.id,
            WatchlistItem.asset_symbol == symbol,
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Not in watchlist")
    await session.delete(item)
    await session.commit()
