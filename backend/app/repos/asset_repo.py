import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.models.models import Asset, PriceHistory
from app.repos.base import AbstractRepository

class AssetRepository(AbstractRepository[Asset]):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, record_id: uuid.UUID) -> Optional[Asset]:
        result = await self._session.execute(select(Asset).where(Asset.id == record_id))
        return result.scalar_one_or_none()

    async def get_by_symbol(self, symbol: str) -> Optional[Asset]:
        result = await self._session.execute(
            select(Asset).where(Asset.symbol == symbol.upper())
        )
        return result.scalar_one_or_none()

    async def list_all(self) -> List[Asset]:
        result = await self._session.execute(select(Asset).where(Asset.is_active == True))
        return list(result.scalars().all())

    async def get_price_history(self, asset_id: uuid.UUID, limit: int = 90) -> List[PriceHistory]:
        result = await self._session.execute(
            select(PriceHistory)
            .where(PriceHistory.asset_id == asset_id)
            .order_by(PriceHistory.timestamp.desc())
            .limit(limit)
        )
        return list(reversed(result.scalars().all()))

    async def save(self, record: Asset) -> Asset:
        self._session.add(record)
        await self._session.flush()
        await self._session.refresh(record)
        return record

    async def save_price_history(self, record: PriceHistory) -> PriceHistory:
        self._session.add(record)
        await self._session.flush()
        return record

    async def delete(self, record_id: uuid.UUID) -> bool:
        asset = await self.get_by_id(record_id)
        if not asset:
            return False
        await self._session.delete(asset)
        await self._session.flush()
        return True
