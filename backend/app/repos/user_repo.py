import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.models import User
from app.repos.base import AbstractRepository


class UserRepository(AbstractRepository[User]):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, record_id: uuid.UUID) -> User | None:
        result = await self._session.execute(select(User).where(User.id == record_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self._session.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_phone(self, phone: str) -> User | None:
        result = await self._session.execute(
            select(User).where(User.phone_number == phone)
        )
        return result.scalar_one_or_none()

    async def list_all(self) -> list[User]:
        result = await self._session.execute(select(User))
        return list(result.scalars().all())

    async def list_paginated(
        self, skip: int = 0, limit: int = 20
    ) -> tuple[list[User], int]:
        from sqlalchemy import func

        count_result = await self._session.execute(select(func.count(User.id)))
        total = count_result.scalar_one()
        result = await self._session.execute(select(User).offset(skip).limit(limit))
        return list(result.scalars().all()), total

    async def save(self, record: User) -> User:
        self._session.add(record)
        await self._session.flush()
        await self._session.refresh(record)
        return record

    async def delete(self, record_id: uuid.UUID) -> bool:
        user = await self.get_by_id(record_id)
        if not user:
            return False
        await self._session.delete(user)
        await self._session.flush()
        return True
