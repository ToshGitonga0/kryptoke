import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.models.models import PortfolioItem
from app.repos.base import AbstractRepository


class PortfolioRepository(AbstractRepository[PortfolioItem]):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, record_id: uuid.UUID) -> PortfolioItem | None:
        result = await self._session.execute(
            select(PortfolioItem)
            .options(selectinload(PortfolioItem.asset))
            .where(PortfolioItem.id == record_id)
        )
        return result.scalar_one_or_none()

    async def get_by_user_and_asset(
        self, user_id: uuid.UUID, asset_id: uuid.UUID
    ) -> PortfolioItem | None:
        result = await self._session.execute(
            select(PortfolioItem)
            .options(selectinload(PortfolioItem.asset))
            .where(PortfolioItem.user_id == user_id, PortfolioItem.asset_id == asset_id)
        )
        return result.scalar_one_or_none()

    async def get_by_user(self, user_id: uuid.UUID) -> list[PortfolioItem]:
        result = await self._session.execute(
            select(PortfolioItem)
            .options(selectinload(PortfolioItem.asset))
            .where(PortfolioItem.user_id == user_id)
        )
        return list(result.scalars().all())

    async def list_all(self) -> list[PortfolioItem]:
        result = await self._session.execute(select(PortfolioItem))
        return list(result.scalars().all())

    async def save(self, record: PortfolioItem) -> PortfolioItem:
        self._session.add(record)
        await self._session.flush()
        await self._session.refresh(record)
        return record

    async def delete(self, record_id: uuid.UUID) -> bool:
        item = await self.get_by_id(record_id)
        if not item:
            return False
        await self._session.delete(item)
        await self._session.flush()
        return True
