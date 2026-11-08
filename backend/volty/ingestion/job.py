"""Job de ingesta programada (local: `make ingest`, AWS: Lambda + EventBridge)."""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from volty.core.config import settings
from volty.ingestion import EnergyChartsClient

logger = logging.getLogger(__name__)


async def run_ingestion() -> dict[str, int]:
    client = EnergyChartsClient()
    tz = ZoneInfo(settings.timezone)
    now = datetime.now(tz)
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=3)

    prices = await client.fetch_prices(start=start, end=end)
    renewable = await client.fetch_renewable_share(start, end)

    logger.info(
        "Ingesta OK: %s puntos de precio, %s días renovables",
        len(prices.points),
        len(renewable),
    )
    return {
        "price_points": len(prices.points),
        "renewable_days": len(renewable),
    }


def run_ingestion_sync() -> dict[str, int]:
    return asyncio.run(run_ingestion())


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print(run_ingestion_sync())
