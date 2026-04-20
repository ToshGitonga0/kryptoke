"""
KryptoKE — Database models & Pydantic schemas.
All table models use SQLModel; all response/request shapes are plain SQLModel
(no generic wrappers — frontend compatibility first).
"""

import uuid
from datetime import UTC, datetime
from decimal import Decimal
from enum import Enum

from pydantic import EmailStr
from sqlalchemy import Column, Index, Numeric, UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel


# ── Enums ──────────────────────────────────────────────────────────────────
class UserRole(str, Enum):
    CUSTOMER = "customer"
    STAFF = "staff"
    ADMIN = "admin"


class KYCStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"


class OrderSide(str, Enum):
    BUY = "buy"
    SELL = "sell"


class OrderType(str, Enum):
    MARKET = "market"
    LIMIT = "limit"


class OrderStatus(str, Enum):
    OPEN = "open"
    FILLED = "filled"
    PARTIALLY_FILLED = "partially_filled"
    CANCELLED = "cancelled"


class TransactionType(str, Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    TRADE_BUY = "trade_buy"
    TRADE_SELL = "trade_sell"
    FEE = "fee"


class TransactionStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


# ── User ────────────────────────────────────────────────────────────────────
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    full_name: str = Field(max_length=256)
    phone_number: str = Field(max_length=20, index=True)
    national_id: str | None = Field(default=None, max_length=20)
    is_active: bool = Field(default=True, index=True)
    is_verified: bool = Field(default=False)
    role: str = Field(default=UserRole.CUSTOMER, max_length=50, index=True)
    county: str | None = Field(default=None, max_length=100)
    date_of_birth: datetime | None = None
    kyc_status: str = Field(default=KYCStatus.PENDING, max_length=20)


class User(UserBase, table=True):
    __tablename__ = "users"
    __table_args__ = (
        Index("idx_user_active_role", "is_active", "role"),
        Index("idx_user_email_deleted", "email", "deleted_at"),
    )
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    credit_score: int = Field(default=600)
    created_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    updated_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    last_login: datetime | None = None
    deleted_at: datetime | None = None

    wallets: list["Wallet"] = Relationship(back_populates="user")
    portfolio_items: list["PortfolioItem"] = Relationship(back_populates="user")
    orders: list["Order"] = Relationship(back_populates="user")
    transactions: list["Transaction"] = Relationship(back_populates="user")


class UserRegister(SQLModel):
    email: str = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str = Field(max_length=255)
    phone_number: str = Field(max_length=20)
    national_id: str | None = Field(default=None, max_length=20)
    county: str | None = Field(default=None, max_length=100)
    date_of_birth: datetime | None = None


class UserPublic(UserBase):
    id: uuid.UUID
    credit_score: int
    created_at: datetime
    updated_at: datetime
    last_login: datetime | None = None
    model_config = {"from_attributes": True}


class UserUpdate(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    phone_number: str | None = Field(default=None, max_length=20)
    county: str | None = Field(default=None, max_length=100)


class UsersPublic(SQLModel):
    users: list[UserPublic]
    total: int


# ── Auth ────────────────────────────────────────────────────────────────────
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class TokenPayload(SQLModel):
    sub: str | None = None
    exp: int | None = None


# ── Asset ───────────────────────────────────────────────────────────────────
class AssetBase(SQLModel):
    symbol: str = Field(max_length=20, index=True)
    name: str = Field(max_length=100)
    asset_type: str = Field(default="crypto", max_length=20)
    current_price: Decimal = Field(sa_column=Column(Numeric(20, 8)), default=Decimal("0"))
    price_change_24h: Decimal = Field(sa_column=Column(Numeric(10, 4)), default=Decimal("0"))
    volume_24h: Decimal = Field(sa_column=Column(Numeric(24, 2)), default=Decimal("0"))
    market_cap: Decimal = Field(sa_column=Column(Numeric(24, 2)), default=Decimal("0"))
    icon_url: str | None = Field(default=None, max_length=500)
    is_active: bool = Field(default=True)


class Asset(AssetBase, table=True):
    __tablename__ = "assets"
    __table_args__ = (UniqueConstraint("symbol"),)
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.utcnow())

    portfolio_items: list["PortfolioItem"] = Relationship(back_populates="asset")
    orders: list["Order"] = Relationship(back_populates="asset")
    price_history: list["PriceHistory"] = Relationship(back_populates="asset")
    trades: list["Trade"] = Relationship(back_populates="asset")


class AssetPublic(AssetBase):
    id: uuid.UUID
    created_at: datetime
    model_config = {"from_attributes": True}


class AssetsPublic(SQLModel):
    assets: list[AssetPublic]
    total: int


# ── Price History ────────────────────────────────────────────────────────────
class PriceHistory(SQLModel, table=True):
    __tablename__ = "price_history"
    __table_args__ = (Index("idx_ph_asset_ts", "asset_id", "timestamp"),)
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    asset_id: uuid.UUID = Field(foreign_key="assets.id", index=True)
    open: Decimal = Field(sa_column=Column(Numeric(20, 8)))
    high: Decimal = Field(sa_column=Column(Numeric(20, 8)))
    low: Decimal = Field(sa_column=Column(Numeric(20, 8)))
    close: Decimal = Field(sa_column=Column(Numeric(20, 8)))
    volume: Decimal = Field(sa_column=Column(Numeric(24, 2)))
    timestamp: datetime = Field(index=True)

    asset: Asset | None = Relationship(back_populates="price_history")


class PriceHistoryPublic(SQLModel):
    id: uuid.UUID
    asset_id: uuid.UUID
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    volume: Decimal
    timestamp: datetime
    model_config = {"from_attributes": True}


class PriceHistoryList(SQLModel):
    history: list[PriceHistoryPublic]


# ── Wallet ───────────────────────────────────────────────────────────────────
class WalletBase(SQLModel):
    currency: str = Field(max_length=10, index=True)
    balance: Decimal = Field(sa_column=Column(Numeric(24, 8)), default=Decimal("0"))
    locked_balance: Decimal = Field(sa_column=Column(Numeric(24, 8)), default=Decimal("0"))


class Wallet(WalletBase, table=True):
    __tablename__ = "wallets"
    __table_args__ = (UniqueConstraint("user_id", "currency"),)
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    updated_at: datetime = Field(default_factory=lambda: datetime.utcnow())

    user: User | None = Relationship(back_populates="wallets")
    transactions: list["Transaction"] = Relationship(back_populates="wallet")


class WalletPublic(WalletBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class WalletsPublic(SQLModel):
    wallets: list[WalletPublic]


class WalletDepositRequest(SQLModel):
    currency: str
    amount: Decimal
    reference: str | None = None  # e.g. M-Pesa transaction code


class WalletWithdrawRequest(SQLModel):
    currency: str
    amount: Decimal
    phone_number: str  # M-Pesa number


# ── Portfolio Item ────────────────────────────────────────────────────────────
class PortfolioItemBase(SQLModel):
    quantity: Decimal = Field(sa_column=Column(Numeric(24, 8)), default=Decimal("0"))
    avg_buy_price: Decimal = Field(sa_column=Column(Numeric(20, 8)), default=Decimal("0"))


class PortfolioItem(PortfolioItemBase, table=True):
    __tablename__ = "portfolio_items"
    __table_args__ = (UniqueConstraint("user_id", "asset_id"),)
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    asset_id: uuid.UUID = Field(foreign_key="assets.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    updated_at: datetime = Field(default_factory=lambda: datetime.utcnow())

    user: User | None = Relationship(back_populates="portfolio_items")
    asset: Asset | None = Relationship(back_populates="portfolio_items")


class PortfolioItemPublic(PortfolioItemBase):
    id: uuid.UUID
    user_id: uuid.UUID
    asset_id: uuid.UUID
    asset: AssetPublic | None = None
    current_value: Decimal | None = None
    pnl: Decimal | None = None
    pnl_pct: Decimal | None = None
    model_config = {"from_attributes": True}


class PortfolioPublic(SQLModel):
    items: list[PortfolioItemPublic]
    total_invested: Decimal
    total_value: Decimal
    total_pnl: Decimal
    total_pnl_pct: Decimal


# ── Order ─────────────────────────────────────────────────────────────────────
class OrderBase(SQLModel):
    side: str = Field(max_length=10)
    order_type: str = Field(max_length=20)
    quantity: Decimal = Field(sa_column=Column(Numeric(24, 8)))
    price: Decimal = Field(sa_column=Column(Numeric(20, 8)))


class Order(OrderBase, table=True):
    __tablename__ = "orders"
    __table_args__ = (
        Index("idx_order_user_status", "user_id", "status"),
        Index("idx_order_asset_status", "asset_id", "status"),
    )
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    asset_id: uuid.UUID = Field(foreign_key="assets.id", index=True)
    status: str = Field(default=OrderStatus.OPEN, max_length=20, index=True)
    filled_quantity: Decimal = Field(sa_column=Column(Numeric(24, 8)), default=Decimal("0"))
    fee: Decimal = Field(sa_column=Column(Numeric(20, 8)), default=Decimal("0"))
    created_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    updated_at: datetime = Field(default_factory=lambda: datetime.utcnow())

    user: User | None = Relationship(back_populates="orders")
    asset: Asset | None = Relationship(back_populates="orders")
    trades: list["Trade"] = Relationship(back_populates="order")


class OrderCreate(SQLModel):
    asset_id: uuid.UUID
    side: OrderSide
    order_type: OrderType
    quantity: Decimal
    price: Decimal | None = None  # required for LIMIT orders


class OrderPublic(OrderBase):
    id: uuid.UUID
    user_id: uuid.UUID
    asset_id: uuid.UUID
    status: str
    filled_quantity: Decimal
    fee: Decimal
    asset: AssetPublic | None = None
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class OrdersPublic(SQLModel):
    orders: list[OrderPublic]
    total: int


# ── Trade ─────────────────────────────────────────────────────────────────────
class Trade(SQLModel, table=True):
    __tablename__ = "trades"
    __table_args__ = (Index("idx_trade_asset_ts", "asset_id", "executed_at"),)
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    order_id: uuid.UUID = Field(foreign_key="orders.id", index=True)
    asset_id: uuid.UUID = Field(foreign_key="assets.id", index=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    side: str = Field(max_length=10)
    quantity: Decimal = Field(sa_column=Column(Numeric(24, 8)))
    price: Decimal = Field(sa_column=Column(Numeric(20, 8)))
    fee: Decimal = Field(sa_column=Column(Numeric(20, 8)), default=Decimal("0"))
    total: Decimal = Field(sa_column=Column(Numeric(24, 8)))
    executed_at: datetime = Field(default_factory=lambda: datetime.utcnow())

    order: Order | None = Relationship(back_populates="trades")
    asset: Asset | None = Relationship(back_populates="trades")


class TradePublic(SQLModel):
    id: uuid.UUID
    order_id: uuid.UUID
    asset_id: uuid.UUID
    user_id: uuid.UUID
    side: str
    quantity: Decimal
    price: Decimal
    fee: Decimal
    total: Decimal
    executed_at: datetime
    asset: AssetPublic | None = None
    model_config = {"from_attributes": True}


class TradesPublic(SQLModel):
    trades: list[TradePublic]
    total: int


# ── Transaction ───────────────────────────────────────────────────────────────
class Transaction(SQLModel, table=True):
    __tablename__ = "transactions"
    __table_args__ = (Index("idx_tx_user_type", "user_id", "type"),)
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    wallet_id: uuid.UUID = Field(foreign_key="wallets.id", index=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    type: str = Field(max_length=20, index=True)
    amount: Decimal = Field(sa_column=Column(Numeric(24, 8)))
    currency: str = Field(max_length=10)
    status: str = Field(default=TransactionStatus.PENDING, max_length=20)
    reference: str | None = Field(default=None, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    created_at: datetime = Field(default_factory=lambda: datetime.utcnow())

    user: User | None = Relationship(back_populates="transactions")
    wallet: Wallet | None = Relationship(back_populates="transactions")


class TransactionPublic(SQLModel):
    id: uuid.UUID
    wallet_id: uuid.UUID
    user_id: uuid.UUID
    type: str
    amount: Decimal
    currency: str
    status: str
    reference: str | None
    description: str | None
    created_at: datetime
    model_config = {"from_attributes": True}


class TransactionsPublic(SQLModel):
    transactions: list[TransactionPublic]
    total: int


# ── M-Pesa Transaction ─────────────────────────────────────────────────
class MpesaTransaction(SQLModel, table=True):
    __tablename__ = "mpesa_transactions"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    transaction_type: str = Field(max_length=20)  # deposit | withdrawal
    phone_number: str = Field(max_length=20)
    amount: Decimal = Field(sa_column=Column(Numeric(20, 2)))
    currency: str = Field(default="KES", max_length=10)
    status: str = Field(default="pending", max_length=20)  # pending|completed|failed
    checkout_request_id: str = Field(unique=True, max_length=120, index=True)
    mpesa_receipt: str | None = Field(default=None, max_length=100)
    failure_reason: str | None = Field(default=None, max_length=255)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    completed_at: datetime | None = None


class MpesaStkRequest(SQLModel):
    amount: Decimal
    phone_number: str  # format: 254XXXXXXXXX


class MpesaWithdrawRequest(SQLModel):
    amount: Decimal
    phone_number: str


class MpesaStatusResponse(SQLModel):
    checkout_request_id: str
    status: str
    message: str
    mpesa_receipt: str | None = None
    amount: Decimal | None = None


# ── Notification ────────────────────────────────────────────────────────
class Notification(SQLModel, table=True):
    __tablename__ = "notifications"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=200)
    message: str = Field(max_length=1000)
    type: str = Field(default="system", max_length=50)  # trade|deposit|withdrawal|alert|system
    is_read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class NotificationPublic(SQLModel):
    id: uuid.UUID
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime
    model_config = {"from_attributes": True}


class NotificationsPublic(SQLModel):
    notifications: list[NotificationPublic]
    unread_count: int


# ── Price Alert ─────────────────────────────────────────────────────────
class PriceAlert(SQLModel, table=True):
    __tablename__ = "price_alerts"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    asset_id: uuid.UUID = Field(foreign_key="assets.id", index=True)
    asset_symbol: str = Field(max_length=20, index=True)
    target_price: Decimal = Field(sa_column=Column(Numeric(20, 8)))
    direction: str = Field(max_length=10)  # above | below
    note: str | None = Field(default=None, max_length=200)
    is_triggered: bool = Field(default=False)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    triggered_at: datetime | None = None


class PriceAlertCreate(SQLModel):
    asset_id: uuid.UUID
    asset_symbol: str
    target_price: Decimal
    direction: str  # above | below
    note: str | None = None


class PriceAlertPublic(SQLModel):
    id: uuid.UUID
    asset_id: uuid.UUID
    asset_symbol: str
    target_price: Decimal
    direction: str
    note: str | None
    is_triggered: bool
    is_active: bool
    created_at: datetime
    triggered_at: datetime | None
    model_config = {"from_attributes": True}


class PriceAlertsPublic(SQLModel):
    alerts: list[PriceAlertPublic]
    total: int


# ── Watchlist ───────────────────────────────────────────────────────────
class WatchlistItem(SQLModel, table=True):
    __tablename__ = "watchlist_items"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    asset_id: uuid.UUID = Field(foreign_key="assets.id", index=True)
    asset_symbol: str = Field(max_length=20)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class WatchlistPublic(SQLModel):
    items: list[str]  # list of asset symbols
