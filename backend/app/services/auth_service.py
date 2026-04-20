"""
AuthService — Single responsibility: authentication & registration.
"""

from datetime import datetime

from fastapi import HTTPException, status

from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.models import Token, User, UserPublic, UserRegister, UserRole
from app.repos.user_repo import UserRepository


class AuthService:
    def __init__(self, user_repo: UserRepository) -> None:
        self._user_repo = user_repo

    async def register(self, data: UserRegister) -> User:
        existing = await self._user_repo.get_by_email(data.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        existing_phone = await self._user_repo.get_by_phone(data.phone_number)
        if existing_phone:
            raise HTTPException(
                status_code=400, detail="Phone number already registered"
            )

        user = User(
            email=data.email,
            full_name=data.full_name,
            phone_number=data.phone_number,
            national_id=data.national_id,
            county=data.county,
            date_of_birth=data.date_of_birth,
            hashed_password=get_password_hash(data.password),
            role=UserRole.CUSTOMER,
        )
        return await self._user_repo.save(user)

    async def authenticate(self, email: str, password: str) -> Token:
        user = await self._user_repo.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )
        if not user.is_active:
            raise HTTPException(status_code=400, detail="Inactive account")

        user.last_login = datetime.utcnow()
        await self._user_repo.save(user)

        access_token = create_access_token(str(user.id))
        return Token(
            access_token=access_token,
            user=UserPublic.model_validate(user),
        )
