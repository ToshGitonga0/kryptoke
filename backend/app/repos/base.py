"""
Abstract base repository — defines the contract every repo must implement.
Repos are injected into services (Dependency Inversion Principle).
"""

import uuid
from abc import ABC, abstractmethod
from typing import Generic, TypeVar

T = TypeVar("T")


class AbstractRepository(ABC, Generic[T]):
    @abstractmethod
    async def get_by_id(self, record_id: uuid.UUID) -> T | None: ...

    @abstractmethod
    async def list_all(self) -> list[T]: ...

    @abstractmethod
    async def save(self, record: T) -> T: ...

    @abstractmethod
    async def delete(self, record_id: uuid.UUID) -> bool: ...
