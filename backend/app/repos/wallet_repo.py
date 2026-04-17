import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.models import Wallet
from app.repos.base import AbstractRepository


class WalletRepository(AbstractRepository[Wallet]):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, record_id: uuid.UUID) -> Wallet | None:
        result = await self._session.execute(
            select(Wallet).where(Wallet.id == record_id)
        )
        return result.scalar_one_or_none()

    async def get_by_user_and_currency(
        self, user_id: uuid.UUID, currency: str
    ) -> Wallet | None:
        result = await self._session.execute(
            select(Wallet).where(
                Wallet.user_id == user_id, Wallet.currency == currency.upper()
            )
        )
        return result.scalar_one_or_none()

    async def get_by_user(self, user_id: uuid.UUID) -> list[Wallet]:
        result = await self._session.execute(
            select(Wallet).where(Wallet.user_id == user_id)
        )
        return list(result.scalars().all())

    async def list_all(self) -> list[Wallet]:
        result = await self._session.execute(select(Wallet))
        return list(result.scalars().all())

    async def save(self, record: Wallet) -> Wallet:
        self._session.add(record)
        await self._session.flush()
        await self._session.refresh(record)
        return record

    async def delete(self, record_id: uuid.UUID) -> bool:
        wallet = await self.get_by_id(record_id)
        if not wallet:
            return False
        await self._session.delete(wallet)
        await self._session.flush()
        return True
