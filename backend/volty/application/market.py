"""Lectura de mercado (precios, renovables, SMARD) — un cliente por proceso."""

from __future__ import annotations

from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from volty.core.config import settings
from volty.core.schemas import PriceSeriesResponse
from volty.ingestion import EnergyChartsClient, SMARD_FILTERS, SmardClient

_prices = EnergyChartsClient()
_smard = SmardClient()


def smard_filter_map() -> dict[int, str]:
    return SMARD_FILTERS


async def fetch_prices(
    *,
    start: datetime | None = None,
    end: datetime | None = None,
    bidding_zone: str | None = None,
) -> PriceSeriesResponse:
    return await _prices.fetch_prices(start=start, end=end, bidding_zone=bidding_zone)


async def fetch_renewable_range(start: datetime, end: datetime) -> dict[datetime, float]:
    return await _prices.fetch_renewable_share(start, end)


async def fetch_renewable_share() -> dict:
    tz = ZoneInfo(settings.timezone)
    now = datetime.now(tz)
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=3)
    shares = await _prices.fetch_renewable_share(start, end)
    return {
        "unit": "percent",
        "days": {k.date().isoformat(): v for k, v in shares.items()},
        "source": "energy-charts",
    }


async def fetch_smard_series(
    *,
    filter_id: int,
    region: str = "DE",
    resolution: str = "quarterhour",
    timestamp_ms: int | None = None,
) -> dict:
    return await _smard.fetch_series(
        filter_id=filter_id,
        region=region,
        resolution=resolution,
        timestamp_ms=timestamp_ms,
    )
