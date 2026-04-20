import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_active_user, get_db
from app.models.models import (
    OrderCreate,
    OrderPublic,
    OrdersPublic,
    TradePublic,
    TradesPublic,
    User,
)
from app.repos.asset_repo import AssetRepository
from app.repos.order_repo import OrderRepository
from app.repos.portfolio_repo import PortfolioRepository
from app.repos.wallet_repo import WalletRepository
from app.services.trading_service import TradingService
from app.services.wallet_service import WalletService

router = APIRouter(prefix="/orders", tags=["orders"])


def _trading_service(session: AsyncSession = Depends(get_db)) -> TradingService:
    order_repo = OrderRepository(session)
    wallet_repo = WalletRepository(session)
    wallet_svc = WalletService(wallet_repo, order_repo)
    return TradingService(
        order_repo,
        AssetRepository(session),
        PortfolioRepository(session),
        wallet_svc,
    )


@router.post("", response_model=OrderPublic, status_code=201)
async def place_order(
    data: OrderCreate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
    svc: TradingService = Depends(_trading_service),
) -> OrderPublic:
    result = await svc.place_order(current_user.id, data)
    await session.commit()
    return result


@router.get("", response_model=OrdersPublic)
async def list_orders(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    svc: TradingService = Depends(_trading_service),
) -> OrdersPublic:
    return await svc.get_user_orders(current_user.id, skip, limit)


@router.delete("/{order_id}", response_model=OrderPublic)
async def cancel_order(
    order_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
    svc: TradingService = Depends(_trading_service),
) -> OrderPublic:
    result = await svc.cancel_order(current_user.id, order_id)
    await session.commit()
    return result


@router.get("/trades", response_model=TradesPublic)
async def list_trades(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
) -> TradesPublic:
    repo = OrderRepository(session)
    trades, total = await repo.get_trades_by_user(current_user.id, skip, limit)
    return TradesPublic(
        trades=[TradePublic.model_validate(t) for t in trades], total=total
    )
