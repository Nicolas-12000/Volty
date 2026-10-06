"""Cliente SMARD (Bundesnetzagentur) — series de mercado y generación."""

from __future__ import annotations

from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo

import httpx

from volty.config import settings
from volty.services.cache import PostgresCacheStore

BASE_URL = "https://www.smard.de/app/chart_data"

# Filtros frecuentes (ver documentación SMARD / bundesAPI)
SMARD_FILTERS: dict[int, str] = {
    410: "day_ahead_price",
    1223: "generation_lignite",
    1225: "generation_wind_offshore",
    1226: "generation_wind_onshore",
    1228: "generation_solar",
    4068: "total_consumption",
    4069: "total_generation",
}


class SmardClient:
    def __init__(self) -> None:
        self.cache = PostgresCacheStore(settings.cache_ttl_seconds, source="smard")
        self.tz = ZoneInfo(settings.timezone)

    async def fetch_series(
        self,
        filter_id: int,
        region: str = "DE",
        resolution: str = "quarterhour",
        timestamp_ms: int | None = None,
    ) -> dict[str, Any]:
        if filter_id not in SMARD_FILTERS:
            raise ValueError(f"Filtro SMARD desconocido: {filter_id}")

        cache_key = f"smard:{filter_id}:{region}:{resolution}:{timestamp_ms}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached

        async with httpx.AsyncClient(timeout=60.0) as client:
            if timestamp_ms is None:
                index_url = f"{BASE_URL}/{filter_id}/{region}/index_{resolution}.json"
                index_resp = await client.get(index_url)
                index_resp.raise_for_status()
                timestamps = index_resp.json().get("timestamps") or []
                if not timestamps:
                    raise ValueError("SMARD no devolvió timestamps para esa combinación.")
                timestamp_ms = int(timestamps[-1])

            series_url = (
                f"{BASE_URL}/{filter_id}/{region}/"
                f"{filter_id}_{region}_{resolution}_{timestamp_ms}.json"
            )
            series_resp = await client.get(series_url)
            series_resp.raise_for_status()
            body = series_resp.json()

        points = [
            {
                "timestamp": datetime.fromtimestamp(ts / 1000, tz=self.tz).isoformat(),
                "value": value,
            }
            for ts, value in body.get("series", [])
        ]
        result = {
            "filter_id": filter_id,
            "filter_name": SMARD_FILTERS[filter_id],
            "region": region,
            "resolution": resolution,
            "timestamp_ms": timestamp_ms,
            "unit": "see SMARD metadata",
            "points": points,
            "source": "smard",
        }
        self.cache.set(cache_key, result)
        return result
