from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    bidding_zone: str = "DE-LU"
    timezone: str = "Europe/Berlin"
    cache_dir: Path = Path(__file__).resolve().parent.parent / "data" / "cache"
    cache_ttl_seconds: int = 900
    openai_api_key: str | None = None
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]


settings = Settings()
settings.cache_dir.mkdir(parents=True, exist_ok=True)
