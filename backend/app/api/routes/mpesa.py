"""
M-Pesa endpoints.
When you have real Daraja credentials, update mpesa_service.py only —
these routes stay the same.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_active_user, get_db
from app.models.models import (
    MpesaStatusResponse,
    MpesaStkRequest,
    MpesaWithdrawRequest,
    User,
)
from app.services import mpesa_service

router = APIRouter(prefix="/mpesa", tags=["mpesa"])


@router.post("/stk-push", response_model=MpesaStatusResponse, status_code=202)
async def stk_push(
    req: MpesaStkRequest,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
) -> MpesaStatusResponse:
    """
    Initiate an M-Pesa STK Push (deposit).
    Returns immediately — poll /mpesa/status/{checkout_request_id} for updates.
    """
    tx = await mpesa_service.initiate_stk_push(session, current_user.id, req.amount, req.phone_number)
    await session.commit()
    return MpesaStatusResponse(
        checkout_request_id=tx.checkout_request_id,
        status="pending",
        message="M-Pesa prompt sent. Please check your phone and enter your PIN.",
        amount=tx.amount,
    )


@router.post("/withdraw", response_model=MpesaStatusResponse, status_code=202)
async def withdraw(
    req: MpesaWithdrawRequest,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
) -> MpesaStatusResponse:
    """Initiate an M-Pesa B2C withdrawal."""
    tx = await mpesa_service.initiate_b2c(session, current_user.id, req.amount, req.phone_number)
    await session.commit()
    return MpesaStatusResponse(
        checkout_request_id=tx.checkout_request_id,
        status="pending",
        message=f"Withdrawal initiated. Funds will be sent to {req.phone_number} shortly.",
        amount=tx.amount,
    )


@router.get("/status/{checkout_request_id}", response_model=MpesaStatusResponse)
async def get_status(checkout_request_id: str, _: User = Depends(get_current_active_user)) -> MpesaStatusResponse:
    """Poll transaction status until status is 'completed' or 'failed'."""
    tx = await mpesa_service.get_transaction_status(checkout_request_id)
    messages = {
        "pending": "Waiting for M-Pesa confirmation…",
        "completed": "Transaction completed successfully.",
        "failed": tx.failure_reason or "Transaction failed. Please try again.",
    }
    return MpesaStatusResponse(
        checkout_request_id=tx.checkout_request_id,
        status=tx.status,
        message=messages.get(tx.status, "Unknown status"),
        mpesa_receipt=tx.mpesa_receipt,
        amount=tx.amount,
    )
