"""Cliente SMARD (Bundesnetzagentur) — series de mercado y generación."""

from __future__ import annotations

from datetime import datetime
from typing import Any, TypedDict
from zoneinfo import ZoneInfo

import httpx

from volty.core.config import settings
from volty.ingestion.cache import PostgresCacheStore

BASE_URL = "https://www.smard.de/app/chart_data"


class SmardFilterMeta(TypedDict):
    name: str
    unit: str
    region: str


# IDs oficiales de chart_data (bundesAPI / SMARD).
# 410 es la carga de la red, no el precio; el day-ahead DE-LU es 4169.
SMARD_SERIES: dict[int, SmardFilterMeta] = {
    4169: {"name": "day_ahead_price", "unit": "EUR/MWh", "region": "DE-LU"},
    410: {"name": "total_consumption", "unit": "MWh", "region": "DE"},
    4359: {"name": "residual_load", "unit": "MWh", "region": "DE"},
    1223: {"name": "generation_lignite", "unit": "MWh", "region": "DE"},
    1225: {"name": "generation_wind_offshore", "unit": "MWh", "region": "DE"},
    4067: {"name": "generation_wind_onshore", "unit": "MWh", "region": "DE"},
    4068: {"name": "generation_solar", "unit": "MWh", "region": "DE"},
}

SMARD_FILTERS: dict[int, str] = {fid: meta["name"] for fid, meta in SMARD_SERIES.items()}


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
        if filter_id not in SMARD_SERIES:
            raise ValueError(f"Filtro SMARD desconocido: {filter_id}")

        meta = SMARD_SERIES[filter_id]
        region = meta["region"]
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
            "filter_name": meta["name"],
            "region": region,
            "resolution": resolution,
            "timestamp_ms": timestamp_ms,
            "unit": meta["unit"],
            "points": points,
            "source": "smard",
        }
        self.cache.set(cache_key, result)
        return result
