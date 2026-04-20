"""
PortfolioService — calculates P&L and portfolio statistics.
"""

import uuid
from decimal import Decimal

from app.models.models import PortfolioItemPublic, PortfolioPublic
from app.repos.asset_repo import AssetRepository
from app.repos.portfolio_repo import PortfolioRepository


class PortfolioService:
    def __init__(
        self, portfolio_repo: PortfolioRepository, asset_repo: AssetRepository
    ) -> None:
        self._portfolio_repo = portfolio_repo
        self._asset_repo = asset_repo

    async def get_portfolio(self, user_id: uuid.UUID) -> PortfolioPublic:
        items = await self._portfolio_repo.get_by_user(user_id)
        total_invested = Decimal("0")
        total_value = Decimal("0")
        enriched = []

        for item in items:
            asset = item.asset or await self._asset_repo.get_by_id(item.asset_id)
            if not asset:
                continue
            invested = item.avg_buy_price * item.quantity
            current_value = asset.current_price * item.quantity
            pnl = current_value - invested
            pnl_pct = (pnl / invested * 100) if invested else Decimal("0")

            total_invested += invested
            total_value += current_value

            enriched.append(
                PortfolioItemPublic(
                    id=item.id,
                    user_id=item.user_id,
                    asset_id=item.asset_id,
                    quantity=item.quantity,
                    avg_buy_price=item.avg_buy_price,
                    asset=asset,
                    current_value=current_value,
                    pnl=pnl,
                    pnl_pct=pnl_pct,
                )
            )

        total_pnl = total_value - total_invested
        total_pnl_pct = (
            (total_pnl / total_invested * 100) if total_invested else Decimal("0")
        )

        return PortfolioPublic(
            items=enriched,
            total_invested=total_invested,
            total_value=total_value,
            total_pnl=total_pnl,
            total_pnl_pct=total_pnl_pct,
        )
