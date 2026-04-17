from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.deps import get_current_active_user, get_db
from app.models.models import (
    Asset,
    AssetPublic,
    AssetsPublic,
    PriceHistoryList,
    Trade,
)
from app.repos.asset_repo import AssetRepository
from app.services.market_service import MarketService

router = APIRouter(prefix="/markets", tags=["markets"])


def _market_service(session: AsyncSession = Depends(get_db)) -> MarketService:
    return MarketService(AssetRepository(session))


@router.get("/assets", response_model=AssetsPublic)
async def list_assets(
    svc: MarketService = Depends(_market_service),
    _=Depends(get_current_active_user),
) -> AssetsPublic:
    return await svc.list_assets()


@router.get("/assets/{symbol}", response_model=AssetPublic)
async def get_asset(
    symbol: str,
    svc: MarketService = Depends(_market_service),
    _=Depends(get_current_active_user),
) -> AssetPublic:
    return await svc.get_asset(symbol.upper())


@router.get("/assets/{symbol}/history", response_model=PriceHistoryList)
async def get_price_history(
    symbol: str,
    limit: int = Query(default=90, ge=1, le=365),
    svc: MarketService = Depends(_market_service),
    _=Depends(get_current_active_user),
) -> PriceHistoryList:
    return await svc.get_price_history(symbol.upper(), limit)


@router.get("/assets/{symbol}/trades")
async def get_recent_trades(
    symbol: str,
    limit: int = Query(default=25, ge=5, le=100),
    session: AsyncSession = Depends(get_db),
    _=Depends(get_current_active_user),
) -> dict:
    """
    Returns the most recent trades for a symbol (anonymised — no user IDs exposed).
    Used to populate the live trades feed on the trade page.
    """
    asset_result = await session.execute(select(Asset).where(Asset.symbol == symbol.upper(), Asset.is_active == True))  # noqa: E712
    asset = asset_result.scalar_one_or_none()
    if not asset:
        return {"trades": [], "symbol": symbol.upper()}

    result = await session.execute(
        select(Trade).where(Trade.asset_id == asset.id).order_by(Trade.executed_at.desc()).limit(limit)
    )
    trades = result.scalars().all()
    return {
        "symbol": symbol.upper(),
        "trades": [
            {
                "side": t.side,
                "quantity": str(t.quantity),
                "price": str(t.price),
                "total": str(t.total),
                "executed_at": t.executed_at.isoformat(),
            }
            for t in trades
        ],
    }
