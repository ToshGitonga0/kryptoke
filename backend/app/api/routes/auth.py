from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db
from app.models.models import Token, UserRegister
from app.repos.order_repo import OrderRepository
from app.repos.user_repo import UserRepository
from app.repos.wallet_repo import WalletRepository
from app.services.auth_service import AuthService
from app.services.wallet_service import WalletService

router = APIRouter(prefix="/auth", tags=["auth"])


def _auth_service(session: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(UserRepository(session))


def _wallet_service(session: AsyncSession = Depends(get_db)) -> WalletService:
    return WalletService(WalletRepository(session), OrderRepository(session))


@router.post("/register", response_model=Token, status_code=201)
async def register(
    data: UserRegister,
    session: AsyncSession = Depends(get_db),
    auth_svc: AuthService = Depends(_auth_service),
    wallet_svc: WalletService = Depends(_wallet_service),
) -> Token:
    user = await auth_svc.register(data)
    # Auto-create KES and USDT wallets for new users
    await wallet_svc.get_or_create_wallet(user.id, "KES")
    await wallet_svc.get_or_create_wallet(user.id, "USDT")
    await session.commit()
    token = await auth_svc.authenticate(data.email, data.password)
    await session.commit()
    return token


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: AsyncSession = Depends(get_db),
    auth_svc: AuthService = Depends(_auth_service),
) -> Token:
    token = await auth_svc.authenticate(form_data.username, form_data.password)
    await session.commit()
    return token
