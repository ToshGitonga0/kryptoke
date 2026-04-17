from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_active_user, get_db
from app.models.models import (
    TransactionsPublic,
    User,
    WalletDepositRequest,
    WalletPublic,
    WalletsPublic,
    WalletWithdrawRequest,
)
from app.repos.order_repo import OrderRepository
from app.repos.wallet_repo import WalletRepository
from app.services.wallet_service import WalletService

router = APIRouter(prefix="/wallets", tags=["wallets"])


def _wallet_service(session: AsyncSession = Depends(get_db)) -> WalletService:
    return WalletService(WalletRepository(session), OrderRepository(session))


@router.get("", response_model=WalletsPublic)
async def get_wallets(
    current_user: User = Depends(get_current_active_user),
    svc: WalletService = Depends(_wallet_service),
) -> WalletsPublic:
    return await svc.get_user_wallets(current_user.id)


@router.post("/deposit", response_model=WalletPublic)
async def deposit(
    req: WalletDepositRequest,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
    svc: WalletService = Depends(_wallet_service),
) -> WalletPublic:
    result = await svc.deposit(current_user.id, req)
    await session.commit()
    return result


@router.post("/withdraw", response_model=WalletPublic)
async def withdraw(
    req: WalletWithdrawRequest,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
    svc: WalletService = Depends(_wallet_service),
) -> WalletPublic:
    result = await svc.withdraw(current_user.id, req)
    await session.commit()
    return result


@router.get("/transactions", response_model=TransactionsPublic)
async def get_transactions(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    svc: WalletService = Depends(_wallet_service),
) -> TransactionsPublic:
    return await svc.get_user_transactions(current_user.id, skip, limit)
