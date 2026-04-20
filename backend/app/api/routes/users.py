from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_active_user, get_current_admin, get_db
from app.models.models import User, UserPublic, UsersPublic, UserUpdate
from app.repos.user_repo import UserRepository

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserPublic)
async def get_me(current_user: User = Depends(get_current_active_user)) -> UserPublic:
    return UserPublic.model_validate(current_user)


@router.patch("/me", response_model=UserPublic)
async def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
) -> UserPublic:
    repo = UserRepository(session)
    if data.full_name is not None:
        current_user.full_name = data.full_name
    if data.phone_number is not None:
        current_user.phone_number = data.phone_number
    if data.county is not None:
        current_user.county = data.county
    current_user.updated_at = datetime.utcnow()
    user = await repo.save(current_user)
    await session.commit()
    return UserPublic.model_validate(user)


@router.get("", response_model=UsersPublic)
async def list_users(
    skip: int = 0,
    limit: int = 20,
    session: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
) -> UsersPublic:
    repo = UserRepository(session)
    users, total = await repo.list_paginated(skip, limit)
    return UsersPublic(users=[UserPublic.model_validate(u) for u in users], total=total)
