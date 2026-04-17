"""
WalletService — manages balances, deposits, withdrawals, and fee deductions.
"""

import uuid
from datetime import datetime
from decimal import Decimal

from fastapi import HTTPException

from app.models.models import (
    Transaction,
    TransactionStatus,
    TransactionType,
    Wallet,
    WalletDepositRequest,
    WalletPublic,
    WalletsPublic,
    WalletWithdrawRequest,
)
from app.repos.order_repo import OrderRepository
from app.repos.wallet_repo import WalletRepository

SUPPORTED_CURRENCIES = [
    "KES",
    "USDT",
    "BTC",
    "ETH",
    "BNB",
    "SOL",
    "ADA",
    "MATIC",
    "XRP",
]


class WalletService:
    def __init__(
        self, wallet_repo: WalletRepository, order_repo: OrderRepository
    ) -> None:
        self._wallet_repo = wallet_repo
        self._order_repo = order_repo

    async def get_or_create_wallet(self, user_id: uuid.UUID, currency: str) -> Wallet:
        currency = currency.upper()
        wallet = await self._wallet_repo.get_by_user_and_currency(user_id, currency)
        if not wallet:
            wallet = Wallet(user_id=user_id, currency=currency)
            wallet = await self._wallet_repo.save(wallet)
        return wallet

    async def get_user_wallets(self, user_id: uuid.UUID) -> WalletsPublic:
        wallets = await self._wallet_repo.get_by_user(user_id)
        return WalletsPublic(wallets=[WalletPublic.model_validate(w) for w in wallets])

    async def deposit(
        self, user_id: uuid.UUID, req: WalletDepositRequest
    ) -> WalletPublic:
        if req.amount <= Decimal("0"):
            raise HTTPException(
                status_code=400, detail="Deposit amount must be positive"
            )
        wallet = await self.get_or_create_wallet(user_id, req.currency)
        wallet.balance += req.amount
        wallet.updated_at = datetime.utcnow()
        wallet = await self._wallet_repo.save(wallet)

        tx = Transaction(
            wallet_id=wallet.id,
            user_id=user_id,
            type=TransactionType.DEPOSIT,
            amount=req.amount,
            currency=req.currency.upper(),
            status=TransactionStatus.COMPLETED,
            reference=req.reference or f"DEP-{uuid.uuid4().hex[:8].upper()}",
            description="Deposit via M-Pesa / Bank Transfer",
        )
        await self._order_repo.save_transaction(tx)
        return WalletPublic.model_validate(wallet)

    async def withdraw(
        self, user_id: uuid.UUID, req: WalletWithdrawRequest
    ) -> WalletPublic:
        if req.amount <= Decimal("0"):
            raise HTTPException(
                status_code=400, detail="Withdrawal amount must be positive"
            )
        wallet = await self._wallet_repo.get_by_user_and_currency(user_id, req.currency)
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")
        if wallet.balance < req.amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")

        wallet.balance -= req.amount
        wallet.updated_at = datetime.utcnow()
        wallet = await self._wallet_repo.save(wallet)

        tx = Transaction(
            wallet_id=wallet.id,
            user_id=user_id,
            type=TransactionType.WITHDRAWAL,
            amount=req.amount,
            currency=req.currency.upper(),
            status=TransactionStatus.COMPLETED,
            reference=f"WIT-{uuid.uuid4().hex[:8].upper()}",
            description=f"Withdrawal to M-Pesa {req.phone_number}",
        )
        await self._order_repo.save_transaction(tx)
        return WalletPublic.model_validate(wallet)

    async def deduct_balance(
        self, user_id: uuid.UUID, currency: str, amount: Decimal
    ) -> Wallet:
        wallet = await self._wallet_repo.get_by_user_and_currency(user_id, currency)
        if not wallet or wallet.balance < amount:
            raise HTTPException(
                status_code=400, detail=f"Insufficient {currency} balance"
            )
        wallet.balance -= amount
        wallet.updated_at = datetime.utcnow()
        return await self._wallet_repo.save(wallet)

    async def add_balance(
        self, user_id: uuid.UUID, currency: str, amount: Decimal
    ) -> Wallet:
        wallet = await self.get_or_create_wallet(user_id, currency)
        wallet.balance += amount
        wallet.updated_at = datetime.utcnow()
        return await self._wallet_repo.save(wallet)

    async def get_user_transactions(
        self, user_id: uuid.UUID, skip: int = 0, limit: int = 20
    ):
        from app.models.models import TransactionPublic, TransactionsPublic

        txs, total = await self._order_repo.get_transactions_by_user(
            user_id, skip, limit
        )
        return TransactionsPublic(
            transactions=[TransactionPublic.model_validate(t) for t in txs],
            total=total,
        )
