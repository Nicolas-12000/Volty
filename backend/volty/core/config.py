from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    bidding_zone: str = "DE-LU"
    timezone: str = "Europe/Berlin"
    cache_ttl_seconds: int = 900
    database_url: str = "postgresql+psycopg://volty:volty@127.0.0.1:5432/volty"
    openai_api_key: str | None = None
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    @property
    def cache_dir(self) -> Path:
        """Legacy path; PostgreSQL es el almacén principal."""
        return Path(__file__).resolve().parent.parent.parent / "data" / "cache"


settings = Settings()
