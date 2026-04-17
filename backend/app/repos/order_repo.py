import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.models.models import Order, Trade, Transaction
from app.repos.base import AbstractRepository


class OrderRepository(AbstractRepository[Order]):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, record_id: uuid.UUID) -> Order | None:
        result = await self._session.execute(
            select(Order)
            .options(selectinload(Order.asset))
            .where(Order.id == record_id)
        )
        return result.scalar_one_or_none()

    async def get_by_user(
        self, user_id: uuid.UUID, skip: int = 0, limit: int = 50
    ) -> tuple[list[Order], int]:
        from sqlalchemy import func

        total = (
            await self._session.execute(
                select(func.count(Order.id)).where(Order.user_id == user_id)
            )
        ).scalar_one()
        result = await self._session.execute(
            select(Order)
            .options(selectinload(Order.asset))
            .where(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all()), total

    async def list_all(self) -> list[Order]:
        result = await self._session.execute(select(Order))
        return list(result.scalars().all())

    async def save(self, record: Order) -> Order:
        self._session.add(record)
        await self._session.flush()
        await self._session.refresh(record)
        return record

    async def save_trade(self, record: Trade) -> Trade:
        self._session.add(record)
        await self._session.flush()
        return record

    async def save_transaction(self, record: Transaction) -> Transaction:
        self._session.add(record)
        await self._session.flush()
        return record

    async def get_trades_by_user(
        self, user_id: uuid.UUID, skip: int = 0, limit: int = 50
    ) -> tuple[list[Trade], int]:
        from sqlalchemy import func

        total = (
            await self._session.execute(
                select(func.count(Trade.id)).where(Trade.user_id == user_id)
            )
        ).scalar_one()
        result = await self._session.execute(
            select(Trade)
            .options(selectinload(Trade.asset))
            .where(Trade.user_id == user_id)
            .order_by(Trade.executed_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all()), total

    async def get_transactions_by_user(
        self, user_id: uuid.UUID, skip: int = 0, limit: int = 50
    ) -> tuple[list[Transaction], int]:
        from sqlalchemy import func

        total = (
            await self._session.execute(
                select(func.count(Transaction.id)).where(Transaction.user_id == user_id)
            )
        ).scalar_one()
        result = await self._session.execute(
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(Transaction.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all()), total

    async def delete(self, record_id: uuid.UUID) -> bool:
        order = await self.get_by_id(record_id)
        if not order:
            return False
        await self._session.delete(order)
        await self._session.flush()
        return True
