"""
KryptoKE Price Simulator
========================
Background asyncio task that produces realistic market price movements.

Algorithm:
  - Geometric Brownian Motion (GBM) for price changes
  - Each asset has its own volatility profile
  - Prices update every TICK_INTERVAL seconds (default 8s)
  - Saves 15-minute OHLCV candles when the interval crosses a new period
  - Checks and triggers PriceAlerts after each tick
  - Creates in-app Notifications for triggered alerts

This replaces the need for a live exchange API during development and testing.
"""

import asyncio
import logging
import math
import random
from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.database import async_session_factory
from app.models.models import Asset, Notification, PriceAlert, PriceHistory

logger = logging.getLogger("price_simulator")

TICK_INTERVAL = 8  # seconds between price updates
CANDLE_MINUTES = 15  # OHLCV candle resolution in minutes

# Asset-specific annualised volatility (σ). Higher = more volatile price swings.
ASSET_VOLATILITY: dict[str, float] = {
    "BTC": 0.65,
    "ETH": 0.80,
    "BNB": 0.90,
    "SOL": 1.10,
    "XRP": 1.00,
    "ADA": 1.20,
    "MATIC": 1.30,
    "USDT": 0.002,  # stablecoin — almost no movement
    "DEFAULT": 1.00,
}

# Per-asset state: open price of current candle, high, low, volume accumulator
_candle_state: dict[str, dict] = {}


def _tick_volatility(sigma_annual: float, dt_seconds: float) -> float:
    """Convert annual σ to per-tick σ using √Δt scaling."""
    trading_seconds_per_year = 365 * 24 * 3600
    return sigma_annual * math.sqrt(dt_seconds / trading_seconds_per_year)


def _gbm_step(price: float, sigma_annual: float, dt: float) -> float:
    """One Geometric Brownian Motion step (drift = 0 for neutrality)."""
    sigma_dt = _tick_volatility(sigma_annual, dt)
    z = random.gauss(0, 1)
    # GBM: S(t+dt) = S(t) * exp((μ - σ²/2)*dt + σ*√dt*Z)
    # We use μ = 0 (no drift) for a random walk
    exponent = (-0.5 * sigma_dt**2) + sigma_dt * z
    return price * math.exp(exponent)


def _current_candle_key(dt: datetime) -> str:
    """Return a string key representing the current 15-min candle bucket."""
    bucket = (dt.minute // CANDLE_MINUTES) * CANDLE_MINUTES
    return dt.strftime(f"%Y-%m-%dT%H:{bucket:02d}")


async def _check_price_alerts(session: AsyncSession, asset: Asset, old_price: Decimal, new_price: Decimal) -> None:
    """Trigger any PriceAlerts that were crossed by this price move."""
    result = await session.execute(
        select(PriceAlert).where(
            PriceAlert.asset_id == asset.id,
            PriceAlert.is_triggered == False,  # noqa: E712
            PriceAlert.is_active == True,  # noqa: E712
        )
    )
    alerts = result.scalars().all()

    for alert in alerts:
        crossed = (alert.direction == "above" and old_price < alert.target_price <= new_price) or (
            alert.direction == "below" and old_price > alert.target_price >= new_price
        )
        if not crossed:
            continue

        alert.is_triggered = True
        alert.triggered_at = datetime.utcnow()
        session.add(alert)

        direction_text = "risen above" if alert.direction == "above" else "fallen below"
        notification = Notification(
            user_id=alert.user_id,
            title=f"🔔 Price Alert: {asset.symbol}",
            message=(
                f"{asset.symbol} has {direction_text} "
                f"KES {float(alert.target_price):,.2f}. "
                f"Current price: KES {float(new_price):,.2f}"
            ),
            type="alert",
        )
        session.add(notification)
        logger.info("Alert triggered: %s %s %s", asset.symbol, alert.direction, alert.target_price)


async def _update_all_prices(session: AsyncSession) -> None:
    """Fetch all active assets and apply one GBM tick."""
    result = await session.execute(select(Asset).where(Asset.is_active == True))  # noqa: E712
    assets: list[Asset] = list(result.scalars().all())

    now = datetime.utcnow()
    candle_key = _current_candle_key(now)

    for asset in assets:
        symbol = asset.symbol
        sigma = ASSET_VOLATILITY.get(symbol, ASSET_VOLATILITY["DEFAULT"])

        old_price = float(asset.current_price)
        new_price = _gbm_step(old_price, sigma, TICK_INTERVAL)

        # Prevent prices from drifting to zero or becoming absurdly large
        # USDT is clamped tightly; others have a ±30% daily guard
        if symbol == "USDT":
            new_price = max(128.0, min(132.0, new_price))
        else:
            new_price = max(old_price * 0.0001, min(old_price * 10, new_price))

        new_price_dec = Decimal(str(round(new_price, 8)))

        # ── Update OHLCV candle state ───────────────────────────────
        if symbol not in _candle_state or _candle_state[symbol]["key"] != candle_key:
            # New candle period — save the previous candle first
            if symbol in _candle_state:
                prev = _candle_state[symbol]
                ph = PriceHistory(
                    asset_id=asset.id,
                    open=Decimal(str(round(prev["open"], 8))),
                    high=Decimal(str(round(prev["high"], 8))),
                    low=Decimal(str(round(prev["low"], 8))),
                    close=Decimal(str(round(prev["close"], 8))),
                    volume=Decimal(str(round(prev["volume"], 2))),
                    timestamp=prev["started_at"],
                )
                session.add(ph)

            # Initialise new candle
            _candle_state[symbol] = {
                "key": candle_key,
                "open": new_price,
                "high": new_price,
                "low": new_price,
                "close": new_price,
                "volume": new_price * random.uniform(0.01, 0.5),
                "started_at": now,
            }
        else:
            state = _candle_state[symbol]
            state["high"] = max(state["high"], new_price)
            state["low"] = min(state["low"], new_price)
            state["close"] = new_price
            state["volume"] += new_price * random.uniform(0.001, 0.05)

        # ── Compute 24-hour price change % ────────────────────────
        # We use a simple rolling approximation: compare current price
        # to the oldest price_history record within last 24h
        ph_result = await session.execute(
            select(PriceHistory)
            .where(
                PriceHistory.asset_id == asset.id,
                PriceHistory.timestamp >= now - timedelta(hours=24),
            )
            .order_by(PriceHistory.timestamp.asc())
            .limit(1)
        )
        oldest_24h = ph_result.scalar_one_or_none()
        if oldest_24h:
            base = float(oldest_24h.open)
            change_pct = ((new_price - base) / base * 100) if base else 0.0
        else:
            # Fall back: keep existing change with small random nudge
            change_pct = float(asset.price_change_24h) + random.gauss(0, 0.05)

        # ── Recalculate market cap proportionally ─────────────────
        if old_price > 0:
            ratio = new_price / old_price
            new_market_cap = float(asset.market_cap) * ratio
        else:
            new_market_cap = float(asset.market_cap)

        # Volume: random bump each tick
        new_volume = float(asset.volume_24h) * random.uniform(0.9995, 1.0005)

        # ── Persist ────────────────────────────────────────────────
        old_price_dec = asset.current_price
        asset.current_price = new_price_dec
        asset.price_change_24h = Decimal(str(round(change_pct, 4)))
        asset.market_cap = Decimal(str(round(new_market_cap, 2)))
        asset.volume_24h = Decimal(str(round(new_volume, 2)))
        session.add(asset)

        # Check price alerts
        await _check_price_alerts(session, asset, old_price_dec, new_price_dec)


async def run_price_simulator() -> None:
    """
    Entry point for the background task.
    Called once from app lifespan; loops indefinitely.
    """
    logger.info("Price simulator started (tick=%.0fs, candle=%dm)", TICK_INTERVAL, CANDLE_MINUTES)
    # Small initial delay — let the app fully boot first
    await asyncio.sleep(5)

    while True:
        try:
            async with async_session_factory() as session:
                await _update_all_prices(session)
                await session.commit()
        except asyncio.CancelledError:
            logger.info("Price simulator stopped.")
            raise
        except Exception as exc:
            logger.error("Price simulator tick error: %s", exc, exc_info=True)

        await asyncio.sleep(TICK_INTERVAL)
