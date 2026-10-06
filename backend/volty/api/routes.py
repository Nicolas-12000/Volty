from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from fastapi import APIRouter, HTTPException

from volty.config import settings
from volty.models.schemas import (
    NaturalLanguageRequest,
    OptimizeRequest,
    OptimizeResponse,
    ParsedIntent,
    PriceSeriesResponse,
)
from volty.services.energy_charts import EnergyChartsClient
from volty.services.nl_interpreter import parse_natural_language
from volty.services.optimizer import optimize_loads
from volty.services.smard import SMARD_FILTERS, SmardClient

router = APIRouter()
client = EnergyChartsClient()
smard = SmardClient()


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "volty"}


@router.get("/smard/filters")
async def smard_filters() -> dict[int, str]:
    return SMARD_FILTERS


@router.get("/smard/series")
async def smard_series(
    filter_id: int,
    region: str = "DE",
    resolution: str = "quarterhour",
    timestamp_ms: int | None = None,
) -> dict:
    try:
        return await smard.fetch_series(
            filter_id=filter_id,
            region=region,
            resolution=resolution,
            timestamp_ms=timestamp_ms,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/prices", response_model=PriceSeriesResponse)
async def get_prices(
    start: datetime | None = None,
    end: datetime | None = None,
    bidding_zone: str | None = None,
) -> PriceSeriesResponse:
    try:
        return await client.fetch_prices(start=start, end=end, bidding_zone=bidding_zone)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.post("/interpret", response_model=ParsedIntent)
async def interpret(body: NaturalLanguageRequest) -> ParsedIntent:
    try:
        return parse_natural_language(body)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/optimize", response_model=OptimizeResponse)
async def optimize(body: OptimizeRequest) -> OptimizeResponse:
    tz = ZoneInfo(settings.timezone)
    try:
        horizon_start = body.price_start
        horizon_end = body.price_end
        if horizon_start is None:
            horizon_start = min(
                (load.window_start or datetime.now(tz) for load in body.loads),
                key=lambda d: d.astimezone(tz) if d.tzinfo else d.replace(tzinfo=tz),
            )
        if horizon_end is None:
            horizon_end = max(load.deadline for load in body.loads) + timedelta(hours=1)

        prices = await client.fetch_prices(start=horizon_start, end=horizon_end)
        renewable = None
        if body.preferences.renewable_weight > 0 or body.preferences.objective.value == "balance_cost_renewables":
            renewable = await client.fetch_renewable_share(horizon_start, horizon_end)

        plans, baselines, savings = optimize_loads(
            loads=body.loads,
            prices=prices.points,
            interval_minutes=prices.interval_minutes,
            preferences=body.preferences,
            renewable_by_day=renewable,
            tz=tz,
        )
        optimized_total = sum(p.total_cost_eur for p in plans)
        return OptimizeResponse(
            plans=plans,
            baselines=baselines,
            optimized_total_cost_eur=optimized_total,
            savings_vs_asap_eur=savings,
            price_source=prices.source,
            bidding_zone=prices.bidding_zone,
            interval_minutes=prices.interval_minutes,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
