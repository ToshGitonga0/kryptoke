"""
KryptoKE seed script — creates realistic Kenyan crypto trading data.
Run: uv run python seed.py
"""

import asyncio
import random
from datetime import datetime, timedelta
from decimal import Decimal

from sqlmodel import select

from app.core.database import async_session_factory
from app.core.security import get_password_hash
from app.models.models import (
    Asset,
    KYCStatus,
    Order,
    OrderStatus,
    PortfolioItem,
    PriceHistory,
    Trade,
    Transaction,
    TransactionStatus,
    TransactionType,
    User,
    UserRole,
    Wallet,
)

# ── Asset seed data ──────────────────────────────────────────────────────────
ASSETS = [
    {
        "symbol": "BTC",
        "name": "Bitcoin",
        "price": Decimal("6500000"),
        "change": Decimal("2.4"),
        "vol": Decimal("1200000000"),
        "mcap": Decimal("120000000000000"),
    },
    {
        "symbol": "ETH",
        "name": "Ethereum",
        "price": Decimal("350000"),
        "change": Decimal("1.8"),
        "vol": Decimal("800000000"),
        "mcap": Decimal("42000000000000"),
    },
    {
        "symbol": "USDT",
        "name": "Tether USD",
        "price": Decimal("130"),
        "change": Decimal("0.01"),
        "vol": Decimal("5000000000"),
        "mcap": Decimal("110000000000000"),
    },
    {
        "symbol": "BNB",
        "name": "BNB",
        "price": Decimal("75000"),
        "change": Decimal("-0.5"),
        "vol": Decimal("400000000"),
        "mcap": Decimal("11000000000000"),
    },
    {
        "symbol": "SOL",
        "name": "Solana",
        "price": Decimal("22000"),
        "change": Decimal("3.2"),
        "vol": Decimal("600000000"),
        "mcap": Decimal("9000000000000"),
    },
    {
        "symbol": "ADA",
        "name": "Cardano",
        "price": Decimal("55"),
        "change": Decimal("-1.2"),
        "vol": Decimal("300000000"),
        "mcap": Decimal("1900000000000"),
    },
    {
        "symbol": "MATIC",
        "name": "Polygon",
        "price": Decimal("110"),
        "change": Decimal("0.7"),
        "vol": Decimal("200000000"),
        "mcap": Decimal("1000000000000"),
    },
    {
        "symbol": "XRP",
        "name": "XRP",
        "price": Decimal("75"),
        "change": Decimal("1.5"),
        "vol": Decimal("450000000"),
        "mcap": Decimal("4200000000000"),
    },
]

KENYAN_USERS = [
    {
        "email": "admin@kryptoke.co.ke",
        "name": "Admin KryptoKE",
        "phone": "+254700000001",
        "role": UserRole.ADMIN,
        "county": "Nairobi",
        "password": "Admin@2024!",
    },
    {
        "email": "staff@kryptoke.co.ke",
        "name": "Grace Wanjiku",
        "phone": "+254700000002",
        "role": UserRole.STAFF,
        "county": "Kiambu",
        "password": "Staff@2024!",
    },
    {
        "email": "james.mwangi@gmail.com",
        "name": "James Mwangi",
        "phone": "+254712345678",
        "role": UserRole.CUSTOMER,
        "county": "Nairobi",
        "password": "Customer@2024!",
    },
    {
        "email": "aisha.omar@gmail.com",
        "name": "Aisha Omar",
        "phone": "+254723456789",
        "role": UserRole.CUSTOMER,
        "county": "Mombasa",
        "password": "Customer@2024!",
    },
    {
        "email": "peter.njoroge@yahoo.com",
        "name": "Peter Njoroge",
        "phone": "+254734567890",
        "role": UserRole.CUSTOMER,
        "county": "Nakuru",
        "password": "Customer@2024!",
    },
    {
        "email": "mercy.kamau@gmail.com",
        "name": "Mercy Kamau",
        "phone": "+254745678901",
        "role": UserRole.CUSTOMER,
        "county": "Kisumu",
        "password": "Customer@2024!",
    },
    {
        "email": "brian.otieno@gmail.com",
        "name": "Brian Otieno",
        "phone": "+254756789012",
        "role": UserRole.CUSTOMER,
        "county": "Siaya",
        "password": "Customer@2024!",
    },
]


def generate_price_history(base_price: Decimal, days: int = 90) -> list[dict]:
    """Generate realistic OHLCV candle data using random walk."""
    history = []
    price = float(base_price)
    now = datetime.utcnow()
    for i in range(days, -1, -1):
        ts = now - timedelta(days=i)
        change_pct = random.gauss(0, 0.025)
        open_p = price
        close_p = price * (1 + change_pct)
        high_p = max(open_p, close_p) * (1 + abs(random.gauss(0, 0.01)))
        low_p = min(open_p, close_p) * (1 - abs(random.gauss(0, 0.01)))
        volume = float(base_price) * random.uniform(0.5, 2.0) * 1000
        history.append(
            {
                "open": Decimal(str(round(open_p, 8))),
                "high": Decimal(str(round(high_p, 8))),
                "low": Decimal(str(round(low_p, 8))),
                "close": Decimal(str(round(close_p, 8))),
                "volume": Decimal(str(round(volume, 2))),
                "timestamp": ts,
            }
        )
        price = close_p
    return history


async def seed() -> None:
    print("🌱 Seeding KryptoKE database…")

    async with async_session_factory() as session:
        # ── Assets ──────────────────────────────────────────────────────
        asset_objs: dict[str, Asset] = {}
        for a in ASSETS:
            existing = await session.execute(select(Asset).where(Asset.symbol == a["symbol"]))
            asset = existing.scalar_one_or_none()
            if not asset:
                asset = Asset(
                    symbol=a["symbol"],
                    name=a["name"],
                    current_price=a["price"],
                    price_change_24h=a["change"],
                    volume_24h=a["vol"],
                    market_cap=a["mcap"],
                    icon_url=f"https://cryptologos.cc/logos/{a['name'].lower().replace(' ', '-')}-{a['symbol'].lower()}-logo.svg",
                )
                session.add(asset)
                await session.flush()
            asset_objs[a["symbol"]] = asset
        print(f"  ✓ {len(asset_objs)} assets")

        # ── Price History ────────────────────────────────────────────────
        for sym, asset in asset_objs.items():
            base_price = next(x["price"] for x in ASSETS if x["symbol"] == sym)
            candles = generate_price_history(base_price)
            for c in candles:
                ph = PriceHistory(asset_id=asset.id, **c)
                session.add(ph)
        await session.flush()
        print(f"  ✓ price history for {len(asset_objs)} assets")

        # ── Users & Wallets ──────────────────────────────────────────────
        user_objs: list[User] = []
        for u in KENYAN_USERS:
            existing = await session.execute(select(User).where(User.email == u["email"]))
            user = existing.scalar_one_or_none()
            if not user:
                user = User(
                    email=u["email"],
                    full_name=u["name"],
                    phone_number=u["phone"],
                    role=u["role"],
                    county=u["county"],
                    kyc_status=KYCStatus.VERIFIED,
                    is_verified=True,
                    hashed_password=get_password_hash(u["password"]),
                    credit_score=random.randint(600, 850),
                )
                session.add(user)
                await session.flush()

            # Wallets: KES + USDT for everyone, plus some crypto for customers
            kes_bal = Decimal(str(random.randint(50000, 500000)))
            usdt_bal = Decimal(str(round(random.uniform(100, 5000), 2)))

            for currency, bal in [("KES", kes_bal), ("USDT", usdt_bal)]:
                existing_w = await session.execute(select(Wallet).where(Wallet.user_id == user.id, Wallet.currency == currency))
                if not existing_w.scalar_one_or_none():
                    session.add(Wallet(user_id=user.id, currency=currency, balance=bal))

            if u["role"] == UserRole.CUSTOMER:
                # Give random crypto holdings
                for sym in random.sample(list(asset_objs.keys()), k=3):
                    if sym == "USDT":
                        continue
                    crypto_bal = Decimal(str(round(random.uniform(0.001, 0.5), 8)))
                    existing_w = await session.execute(select(Wallet).where(Wallet.user_id == user.id, Wallet.currency == sym))
                    if not existing_w.scalar_one_or_none():
                        session.add(Wallet(user_id=user.id, currency=sym, balance=crypto_bal))

            user_objs.append(user)

        await session.flush()
        print(f"  ✓ {len(user_objs)} users + wallets")

        # ── Portfolio Items ──────────────────────────────────────────────
        customers = [u for u in user_objs if u.role == UserRole.CUSTOMER]
        for user in customers:
            for sym in random.sample(["BTC", "ETH", "SOL", "BNB"], k=2):
                asset = asset_objs[sym]
                existing_pi = await session.execute(
                    select(PortfolioItem).where(
                        PortfolioItem.user_id == user.id,
                        PortfolioItem.asset_id == asset.id,
                    )
                )
                if not existing_pi.scalar_one_or_none():
                    qty = Decimal(str(round(random.uniform(0.001, 0.1), 8)))
                    price = asset.current_price * Decimal(str(round(random.uniform(0.8, 1.1), 4)))
                    session.add(
                        PortfolioItem(
                            user_id=user.id,
                            asset_id=asset.id,
                            quantity=qty,
                            avg_buy_price=price,
                        )
                    )
        await session.flush()
        print("  ✓ portfolio items")

        # ── Past Orders & Trades ─────────────────────────────────────────
        admin = user_objs[0]
        for user in customers[:3]:
            for _ in range(5):
                sym = random.choice(["BTC", "ETH", "SOL"])
                asset = asset_objs[sym]
                side = random.choice(["buy", "sell"])
                qty = Decimal(str(round(random.uniform(0.001, 0.05), 8)))
                price = asset.current_price * Decimal(str(round(random.uniform(0.95, 1.05), 4)))
                fee = price * qty * Decimal("0.001")
                total = price * qty

                order = Order(
                    user_id=user.id,
                    asset_id=asset.id,
                    side=side,
                    order_type="market",
                    status=OrderStatus.FILLED,
                    quantity=qty,
                    price=price,
                    filled_quantity=qty,
                    fee=fee,
                    created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30)),
                )
                session.add(order)
                await session.flush()

                trade = Trade(
                    order_id=order.id,
                    asset_id=asset.id,
                    user_id=user.id,
                    side=side,
                    quantity=qty,
                    price=price,
                    fee=fee,
                    total=total,
                    executed_at=order.created_at,
                )
                session.add(trade)

                # Corresponding transaction
                wallet_q = await session.execute(select(Wallet).where(Wallet.user_id == user.id, Wallet.currency == "KES"))
                kes_wallet = wallet_q.scalar_one_or_none()
                if kes_wallet:
                    session.add(
                        Transaction(
                            wallet_id=kes_wallet.id,
                            user_id=user.id,
                            type=TransactionType.TRADE_BUY if side == "buy" else TransactionType.TRADE_SELL,
                            amount=total,
                            currency="KES",
                            status=TransactionStatus.COMPLETED,
                            reference=f"TRD-{order.id.hex[:8].upper()}",
                            description=f"{side.upper()} {qty} {sym} @ {price}",
                            created_at=order.created_at,
                        )
                    )

        await session.flush()
        print("  ✓ orders, trades, transactions")

        await session.commit()
        print("\n✅ Seed complete!")
        print("\n📋 Default Credentials:")
        print("┌─────────────┬────────────────────────────────┬──────────────────┐")
        print("│ Role        │ Email                          │ Password         │")
        print("├─────────────┼────────────────────────────────┼──────────────────┤")
        for u in KENYAN_USERS:
            role_str = u["role"].value.ljust(11)
            email_str = u["email"].ljust(30)
            print(f"│ {role_str} │ {email_str} │ {u['password']:<16} │")
        print("└─────────────┴────────────────────────────────┴──────────────────┘")


if __name__ == "__main__":
    asyncio.run(seed())
