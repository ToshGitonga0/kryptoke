from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
    )

    # -------------------
    # CORE APP SETTINGS
    # -------------------
    PROJECT_NAME: str = "KryptoKE"
    API_V1_STR: str = "/api/v1"

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # -------------------
    # DATABASE SETTINGS
    # -------------------
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_USER: str = "tosh"

    # ⚠️ No defaults → MUST come from .env
    DB_PASSWORD: str
    DB_NAME: str

    # -------------------
    # BUSINESS LOGIC
    # -------------------
    TRADING_FEE_RATE: float = 0.001  # 0.1%

    # -------------------
    # DATABASE URLS
    # -------------------
    @computed_field  # type: ignore[misc]
    @property
    def ASYNC_DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    @computed_field  # type: ignore[misc]
    @property
    def SYNC_DATABASE_URL(self) -> str:
        return f"postgresql+psycopg2://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"


settings = Settings()
