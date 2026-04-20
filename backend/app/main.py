import asyncio
import logging
from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import alerts, auth, markets, mpesa, notifications, orders, portfolio, users, wallets, watchlist
from app.core.config import settings
from app.services.price_simulator import run_price_simulator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("kryptoke")


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    """Application lifespan: start background tasks on boot, clean up on shutdown."""
    logger.info("KryptoKE API starting up 🌿")
    sim_task = asyncio.create_task(run_price_simulator())
    yield
    logger.info("KryptoKE API shutting down…")
    sim_task.cancel()
    with suppress(asyncio.CancelledError):
        await sim_task


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="KryptoKE — Kenya's Premier Crypto Trading Platform API",
    version="2.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Core routes ────────────────────────────────────────────────────────
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(markets.router, prefix=settings.API_V1_STR)
app.include_router(wallets.router, prefix=settings.API_V1_STR)
app.include_router(portfolio.router, prefix=settings.API_V1_STR)
app.include_router(orders.router, prefix=settings.API_V1_STR)

# ── MVP routes ─────────────────────────────────────────────────────────
app.include_router(mpesa.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(watchlist.router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return {"message": "KryptoKE API 🌿", "version": "2.0.0", "docs": f"{settings.API_V1_STR}/docs"}


@app.get("/health")
async def health():
    return {"status": "ok", "service": "kryptoke-api"}
