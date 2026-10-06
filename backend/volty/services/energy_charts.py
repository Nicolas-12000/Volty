from __future__ import annotations

from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

import httpx

from volty.config import settings
from volty.models.schemas import PricePoint, PriceSeriesResponse
from volty.services.cache import PostgresCacheStore

BASE_URL = "https://api.energy-charts.info"


class EnergyChartsClient:
    def __init__(self) -> None:
        self.cache = PostgresCacheStore(settings.cache_ttl_seconds, source="energy-charts")
        self.tz = ZoneInfo(settings.timezone)

    async def fetch_prices(
        self,
        start: datetime | None = None,
        end: datetime | None = None,
        bidding_zone: str | None = None,
    ) -> PriceSeriesResponse:
        bzn = bidding_zone or settings.bidding_zone
        now = datetime.now(self.tz)
        if start is None:
            start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        if end is None:
            end = start + timedelta(days=2)
        start = self._ensure_tz(start)
        end = self._ensure_tz(end)

        cache_key = f"price:v2:{bzn}:{start.isoformat()}:{end.isoformat()}"
        cached = self.cache.get(cache_key)
        if cached:
            return PriceSeriesResponse.model_validate(cached)

        params = {
            "bzn": bzn,
            "start": start.isoformat(timespec="seconds"),
            "end": end.isoformat(timespec="seconds"),
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(f"{BASE_URL}/v2/price", params=params)
            response.raise_for_status()
            body = response.json()

        points: list[PricePoint] = []
        for row in body.get("data", []):
            ts = datetime.fromisoformat(row["timestamp"])
            price = row["values"]["day_ahead_price"]
            points.append(PricePoint(timestamp=ts, price_eur_per_mwh=float(price)))

        result = PriceSeriesResponse(
            bidding_zone=body.get("bidding_zone", bzn),
            interval_minutes=int(body.get("interval_minutes", 15)),
            unit=body.get("unit", "EUR / MWh"),
            points=points,
            source="energy-charts",
        )
        self.cache.set(cache_key, result.model_dump(mode="json"))
        return result

    async def fetch_renewable_share(
        self,
        start: datetime,
        end: datetime,
        country: str = "de",
    ) -> dict[datetime, float]:
        """Renewable share of load (0–100) keyed by interval start."""
        start = self._ensure_tz(start)
        end = self._ensure_tz(end)
        cache_key = f"ren:v2:{country}:{start.date()}:{end.date()}"
        cached = self.cache.get(cache_key)
        if cached:
            return {datetime.fromisoformat(k): v for k, v in cached.items()}

        params = {"country": country, "start": start.date().isoformat(), "end": end.date().isoformat()}
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(f"{BASE_URL}/v2/ren_share_daily_avg", params=params)
            if response.status_code >= 400:
                return {}
            body = response.json()

        shares: dict[datetime, float] = {}
        series_id = None
        for s in body.get("series", []):
            if "renewable" in s.get("id", "").lower() or s.get("id") == "ren_share":
                series_id = s["id"]
                break
        if series_id is None and body.get("series"):
            series_id = body["series"][0]["id"]

        for row in body.get("data", []):
            ts = datetime.fromisoformat(row["timestamp"])
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=self.tz)
            val = row.get("values", {}).get(series_id or "ren_share")
            if val is not None:
                shares[ts] = float(val)

        serializable = {k.isoformat(): v for k, v in shares.items()}
        if serializable:
            self.cache.set(cache_key, serializable)
        return shares

    def _ensure_tz(self, dt: datetime) -> datetime:
        if dt.tzinfo is None:
            return dt.replace(tzinfo=self.tz)
        return dt.astimezone(self.tz)


def utc_now() -> datetime:
    return datetime.now(timezone.utc)
