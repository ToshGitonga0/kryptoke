"""
MarketService — asset listings and price history.
"""

from app.models.models import (
    AssetPublic,
    AssetsPublic,
    PriceHistoryList,
    PriceHistoryPublic,
)
from app.repos.asset_repo import AssetRepository


class MarketService:
    def __init__(self, asset_repo: AssetRepository) -> None:
        self._asset_repo = asset_repo

    async def list_assets(self) -> AssetsPublic:
        assets = await self._asset_repo.list_all()
        return AssetsPublic(
            assets=[AssetPublic.model_validate(a) for a in assets], total=len(assets)
        )

    async def get_asset(self, symbol: str) -> AssetPublic:
        from fastapi import HTTPException

        asset = await self._asset_repo.get_by_symbol(symbol)
        if not asset:
            raise HTTPException(status_code=404, detail=f"Asset {symbol} not found")
        return AssetPublic.model_validate(asset)

    async def get_price_history(self, symbol: str, limit: int = 90) -> PriceHistoryList:
        from fastapi import HTTPException

        asset = await self._asset_repo.get_by_symbol(symbol)
        if not asset:
            raise HTTPException(status_code=404, detail=f"Asset {symbol} not found")
        history = await self._asset_repo.get_price_history(asset.id, limit)
        return PriceHistoryList(
            history=[PriceHistoryPublic.model_validate(h) for h in history]
        )
