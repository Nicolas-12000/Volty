from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    bidding_zone: str = "DE-LU"
    timezone: str = "Europe/Berlin"
    cache_ttl_seconds: int = 900
    database_url: str = "postgresql+psycopg://volty:volty@127.0.0.1:5432/volty"
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-3-flash-preview"
    gemini_temperature: float = 0.35
    matias_backend: str = "gemini"
    matias_thread_store: str = "auto"
    matias_rag: str = "none"
    matias_prompt_path: str | None = None
    jwt_secret: str = "volty-dev-secret-change-in-production"
    demo_user_email: str = "demo@volty.dev"
    demo_user_password: str = "valle-0700"
    demo_user_name: str = "Hogar demo"
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    @property
    def cache_dir(self) -> Path:
        """Legacy path; PostgreSQL es el almacén principal."""
        return Path(__file__).resolve().parent.parent.parent / "data" / "cache"


settings = Settings()
