"""
TradingService — executes buy/sell orders, updates portfolio and balances.
All orders are treated as market orders and filled immediately for MVP.
"""

import uuid
from datetime import datetime
from decimal import Decimal

from fastapi import HTTPException

from app.core.config import settings
from app.models.models import (
    Order,
    OrderCreate,
    OrderPublic,
    OrdersPublic,
    OrderStatus,
    PortfolioItem,
    Trade,
    Transaction,
    TransactionStatus,
    TransactionType,
)
from app.repos.asset_repo import AssetRepository
from app.repos.order_repo import OrderRepository
from app.repos.portfolio_repo import PortfolioRepository
from app.services.wallet_service import WalletService


class TradingService:
    def __init__(
        self,
        order_repo: OrderRepository,
        asset_repo: AssetRepository,
        portfolio_repo: PortfolioRepository,
        wallet_service: WalletService,
    ) -> None:
        self._order_repo = order_repo
        self._asset_repo = asset_repo
        self._portfolio_repo = portfolio_repo
        self._wallet_service = wallet_service

    async def place_order(self, user_id: uuid.UUID, data: OrderCreate) -> OrderPublic:
        asset = await self._asset_repo.get_by_id(data.asset_id)
        if not asset or not asset.is_active:
            raise HTTPException(status_code=404, detail="Asset not found or inactive")

        exec_price = asset.current_price  # For market orders
        if data.order_type == "limit" and data.price:
            exec_price = data.price

        total_cost = exec_price * data.quantity
        fee = total_cost * Decimal(str(settings.TRADING_FEE_RATE))

        if data.side == "buy":
            # Deduct KES from wallet
            required = total_cost + fee
            kes_wallet = await self._wallet_service.deduct_balance(
                user_id, "KES", required
            )

            # Update or create portfolio item
            portfolio_item = await self._portfolio_repo.get_by_user_and_asset(
                user_id, asset.id
            )
            if portfolio_item:
                total_qty = portfolio_item.quantity + data.quantity
                portfolio_item.avg_buy_price = (
                    portfolio_item.avg_buy_price * portfolio_item.quantity
                    + exec_price * data.quantity
                ) / total_qty
                portfolio_item.quantity = total_qty
                portfolio_item.updated_at = datetime.utcnow()
            else:
                portfolio_item = PortfolioItem(
                    user_id=user_id,
                    asset_id=asset.id,
                    quantity=data.quantity,
                    avg_buy_price=exec_price,
                )
            await self._portfolio_repo.save(portfolio_item)

            # Add crypto to wallet
            await self._wallet_service.add_balance(user_id, asset.symbol, data.quantity)

            tx_type = TransactionType.TRADE_BUY
        else:
            # Sell: deduct crypto from wallet
            await self._wallet_service.deduct_balance(
                user_id, asset.symbol, data.quantity
            )

            # Reduce portfolio
            portfolio_item = await self._portfolio_repo.get_by_user_and_asset(
                user_id, asset.id
            )
            if not portfolio_item or portfolio_item.quantity < data.quantity:
                raise HTTPException(status_code=400, detail="Insufficient holdings")
            portfolio_item.quantity -= data.quantity
            portfolio_item.updated_at = datetime.utcnow()
            if portfolio_item.quantity == Decimal("0"):
                await self._portfolio_repo.delete(portfolio_item.id)
            else:
                await self._portfolio_repo.save(portfolio_item)

            # Add KES proceeds (minus fee)
            proceeds = total_cost - fee
            kes_wallet = await self._wallet_service.add_balance(
                user_id, "KES", proceeds
            )
            tx_type = TransactionType.TRADE_SELL

        # Create order record
        order = Order(
            user_id=user_id,
            asset_id=asset.id,
            side=data.side,
            order_type=data.order_type,
            status=OrderStatus.FILLED,
            quantity=data.quantity,
            price=exec_price,
            filled_quantity=data.quantity,
            fee=fee,
        )
        order = await self._order_repo.save(order)

        # Create trade record
        trade = Trade(
            order_id=order.id,
            asset_id=asset.id,
            user_id=user_id,
            side=data.side,
            quantity=data.quantity,
            price=exec_price,
            fee=fee,
            total=total_cost,
        )
        await self._order_repo.save_trade(trade)

        # Transaction record
        tx = Transaction(
            wallet_id=kes_wallet.id,
            user_id=user_id,
            type=tx_type,
            amount=total_cost,
            currency="KES",
            status=TransactionStatus.COMPLETED,
            reference=f"TRD-{order.id.hex[:8].upper()}",
            description=f"{data.side.upper()} {data.quantity} {asset.symbol} @ {exec_price}",
        )
        await self._order_repo.save_transaction(tx)

        return OrderPublic.model_validate(order)

    async def cancel_order(
        self, user_id: uuid.UUID, order_id: uuid.UUID
    ) -> OrderPublic:
        order = await self._order_repo.get_by_id(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        if order.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorised")
        if order.status != OrderStatus.OPEN:
            raise HTTPException(
                status_code=400, detail="Only OPEN orders can be cancelled"
            )
        order.status = OrderStatus.CANCELLED
        order.updated_at = datetime.utcnow()
        order = await self._order_repo.save(order)
        return OrderPublic.model_validate(order)

    async def get_user_orders(
        self, user_id: uuid.UUID, skip: int = 0, limit: int = 50
    ) -> OrdersPublic:
        orders, total = await self._order_repo.get_by_user(user_id, skip, limit)
        return OrdersPublic(
            orders=[OrderPublic.model_validate(o) for o in orders], total=total
        )
