"""
KryptoKE M-Pesa Service
========================
Simulates Safaricom Daraja API flows:
  - STK Push (Lipa Na M-Pesa) for deposits
  - B2C (Business to Customer) for withdrawals

When real Daraja credentials are available, replace the
_simulate_stk_callback and _simulate_b2c_callback methods
with actual Daraja API calls to:
  - POST https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest
  - POST https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest

SIMULATED FLOW:
  1. User initiates → backend creates MpesaTransaction(status="pending")
  2. Background asyncio task waits 6-10 seconds (simulates user approving on phone)
  3. Task marks status="completed", credits/debits wallet, logs Transaction

PRODUCTION FLOW (when you have Daraja keys):
  1. POST to Daraja STK Push endpoint → get CheckoutRequestID
  2. Daraja calls your callback URL with result
  3. Your /mpesa/callback endpoint processes result and updates DB
"""

import asyncio
import logging
import random
import string
import uuid
from datetime import UTC, datetime
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.database import async_session_factory
from app.models.models import MpesaTransaction, Notification, Transaction, TransactionStatus, TransactionType, Wallet

logger = logging.getLogger("mpesa_service")

# ── Daraja API config (wire up your real keys when ready) ─────────────
# DARAJA_CONSUMER_KEY    = settings.DARAJA_CONSUMER_KEY
# DARAJA_CONSUMER_SECRET = settings.DARAJA_CONSUMER_SECRET
# DARAJA_SHORTCODE       = settings.DARAJA_SHORTCODE
# DARAJA_PASSKEY         = settings.DARAJA_PASSKEY
# DARAJA_CALLBACK_URL    = settings.DARAJA_CALLBACK_URL
# DARAJA_STK_ENDPOINT    = "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
# DARAJA_B2C_ENDPOINT    = "https://api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest"

SIMULATION_DELAY_MIN = 6  # seconds before auto-completing
SIMULATION_DELAY_MAX = 12
SIMULATION_FAIL_RATE = 0.03  # 3% chance of simulated failure

MIN_DEPOSIT = Decimal("10")  # KES
MAX_DEPOSIT = Decimal("300000")  # KES
MIN_WITHDRAWAL = Decimal("50")
MAX_WITHDRAWAL = Decimal("150000")


def _generate_receipt() -> str:
    """Generate a realistic-looking M-Pesa receipt code."""
    prefix = "SIM"
    chars = string.ascii_uppercase + string.digits
    suffix = "".join(random.choices(chars, k=7))
    return f"{prefix}{suffix}"


def _generate_checkout_id() -> str:
    """Generate a unique checkout request ID."""
    return f"ws_CO_{uuid.uuid4().hex[:24].upper()}"


def _validate_kenyan_phone(phone: str) -> str:
    """
    Normalise Kenyan phone to 254XXXXXXXXX format.
    Accepts: 07XXXXXXXX, +2547XXXXXXXX, 2547XXXXXXXX
    """
    phone = phone.strip().replace(" ", "").replace("-", "")
    if phone.startswith("+"):
        phone = phone[1:]
    if phone.startswith("0"):
        phone = "254" + phone[1:]
    if not phone.startswith("254") or len(phone) != 12:
        raise HTTPException(status_code=422, detail="Invalid Kenyan phone number. Use format: 07XXXXXXXX or 2547XXXXXXXX")
    return phone


async def _complete_stk_push(checkout_request_id: str) -> None:
    """
    Background task: auto-completes a simulated STK push after a delay.
    In production, this logic lives inside your /mpesa/callback endpoint
    which Daraja calls directly after the user approves on their phone.
    """
    delay = random.uniform(SIMULATION_DELAY_MIN, SIMULATION_DELAY_MAX)
    await asyncio.sleep(delay)

    failed = random.random() < SIMULATION_FAIL_RATE

    async with async_session_factory() as session:
        result = await session.execute(
            select(MpesaTransaction).where(MpesaTransaction.checkout_request_id == checkout_request_id)
        )
        tx = result.scalar_one_or_none()
        if not tx or tx.status != "pending":
            return  # Already processed or cancelled

        now = datetime.now(UTC)

        if failed:
            tx.status = "failed"
            tx.failure_reason = "The user cancelled or did not enter PIN"
            tx.completed_at = now
            session.add(tx)

            notif = Notification(
                user_id=tx.user_id,
                title="M-Pesa Transaction Failed",
                message=f"Your KES {float(tx.amount):,.2f} M-Pesa request was not completed.",
                type="deposit" if tx.transaction_type == "deposit" else "withdrawal",
            )
            session.add(notif)
            await session.commit()
            return

        # ── Success: credit or debit the KES wallet ──────────────
        wallet_result = await session.execute(
            select(Wallet).where(
                Wallet.user_id == tx.user_id,
                Wallet.currency == "KES",
            )
        )
        wallet = wallet_result.scalar_one_or_none()

        if not wallet:
            wallet = Wallet(user_id=tx.user_id, currency="KES", balance=Decimal("0"))
            session.add(wallet)
            await session.flush()
            await session.refresh(wallet)

        receipt = _generate_receipt()

        if tx.transaction_type == "deposit":
            wallet.balance += tx.amount
            tx_type = TransactionType.DEPOSIT
            desc = f"M-Pesa Deposit from {tx.phone_number}"
            title = "💰 M-Pesa Deposit Received"
            msg = f"KES {float(tx.amount):,.2f} has been added to your wallet. Ref: {receipt}"
        else:
            if wallet.balance < tx.amount:
                tx.status = "failed"
                tx.failure_reason = "Insufficient balance at time of processing"
                tx.completed_at = now
                session.add(tx)
                await session.commit()
                return
            wallet.balance -= tx.amount
            tx_type = TransactionType.WITHDRAWAL
            desc = f"M-Pesa Withdrawal to {tx.phone_number}"
            title = "📤 M-Pesa Withdrawal Sent"
            msg = f"KES {float(tx.amount):,.2f} sent to {tx.phone_number}. Ref: {receipt}"

        wallet.updated_at = now
        session.add(wallet)

        # Financial transaction record
        ledger_tx = Transaction(
            wallet_id=wallet.id,
            user_id=tx.user_id,
            type=tx_type,
            amount=tx.amount,
            currency="KES",
            status=TransactionStatus.COMPLETED,
            reference=receipt,
            description=desc,
        )
        session.add(ledger_tx)

        # Update M-Pesa record
        tx.status = "completed"
        tx.mpesa_receipt = receipt
        tx.completed_at = now
        session.add(tx)

        # In-app notification
        notif = Notification(
            user_id=tx.user_id,
            title=title,
            message=msg,
            type="deposit" if tx.transaction_type == "deposit" else "withdrawal",
        )
        session.add(notif)

        await session.commit()
        logger.info("M-Pesa %s completed: %s KES %.2f", tx.transaction_type, receipt, float(tx.amount))


async def initiate_stk_push(
    session: AsyncSession,
    user_id: uuid.UUID,
    amount: Decimal,
    phone_number: str,
) -> MpesaTransaction:
    """
    Initiates a simulated STK Push deposit.
    Returns immediately with a pending MpesaTransaction.
    Background task completes it asynchronously.
    """
    if amount < MIN_DEPOSIT or amount > MAX_DEPOSIT:
        raise HTTPException(
            status_code=422, detail=f"Deposit amount must be between KES {MIN_DEPOSIT:,.0f} and KES {MAX_DEPOSIT:,.0f}"
        )

    phone = _validate_kenyan_phone(phone_number)
    checkout_id = _generate_checkout_id()

    tx = MpesaTransaction(
        user_id=user_id,
        transaction_type="deposit",
        phone_number=phone,
        amount=amount,
        currency="KES",
        status="pending",
        checkout_request_id=checkout_id,
    )
    session.add(tx)
    await session.flush()
    await session.refresh(tx)

    # Fire-and-forget background simulation
    asyncio.create_task(_complete_stk_push(checkout_id))

    logger.info("STK Push initiated: user=%s phone=%s amount=%.2f checkout=%s", user_id, phone, float(amount), checkout_id)
    return tx


async def initiate_b2c(
    session: AsyncSession,
    user_id: uuid.UUID,
    amount: Decimal,
    phone_number: str,
) -> MpesaTransaction:
    """
    Initiates a simulated B2C withdrawal.
    Balance is reserved immediately (locked), released on completion.
    """
    if amount < MIN_WITHDRAWAL or amount > MAX_WITHDRAWAL:
        raise HTTPException(
            status_code=422, detail=f"Withdrawal must be between KES {MIN_WITHDRAWAL:,.0f} and KES {MAX_WITHDRAWAL:,.0f}"
        )

    phone = _validate_kenyan_phone(phone_number)

    # Check and lock balance before initiating
    wallet_result = await session.execute(select(Wallet).where(Wallet.user_id == user_id, Wallet.currency == "KES"))
    wallet = wallet_result.scalar_one_or_none()
    if not wallet or wallet.balance < amount:
        raise HTTPException(status_code=400, detail="Insufficient KES balance")

    # Lock the funds during processing
    wallet.locked_balance += amount
    wallet.balance -= amount
    wallet.updated_at = datetime.now(UTC)
    session.add(wallet)

    checkout_id = _generate_checkout_id()
    tx = MpesaTransaction(
        user_id=user_id,
        transaction_type="withdrawal",
        phone_number=phone,
        amount=amount,
        currency="KES",
        status="pending",
        checkout_request_id=checkout_id,
    )
    session.add(tx)
    await session.flush()
    await session.refresh(tx)

    asyncio.create_task(_complete_stk_push(checkout_id))

    logger.info("B2C initiated: user=%s phone=%s amount=%.2f", user_id, phone, float(amount))
    return tx


async def get_transaction_status(checkout_request_id: str) -> MpesaTransaction:
    async with async_session_factory() as session:
        result = await session.execute(
            select(MpesaTransaction).where(MpesaTransaction.checkout_request_id == checkout_request_id)
        )
        tx = result.scalar_one_or_none()
        if not tx:
            raise HTTPException(status_code=404, detail="Transaction not found")
        return tx
