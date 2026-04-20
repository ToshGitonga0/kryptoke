from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_active_user, get_db
from app.models.models import PortfolioPublic, User
from app.repos.asset_repo import AssetRepository
from app.repos.portfolio_repo import PortfolioRepository
from app.services.portfolio_service import PortfolioService

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


def _portfolio_service(session: AsyncSession = Depends(get_db)) -> PortfolioService:
    return PortfolioService(PortfolioRepository(session), AssetRepository(session))


@router.get("", response_model=PortfolioPublic)
async def get_portfolio(
    current_user: User = Depends(get_current_active_user),
    svc: PortfolioService = Depends(_portfolio_service),
) -> PortfolioPublic:
    return await svc.get_portfolio(current_user.id)
