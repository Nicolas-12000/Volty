"""Casos de uso: interpretar NL y optimizar cargas (sin HTTP)."""

from __future__ import annotations

from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from volty.core.config import settings
from volty.core.schemas import NaturalLanguageRequest, OptimizeRequest, OptimizeResponse, ParsedIntent
from volty.application import market
from volty.interpreter.service import parse_natural_language
from volty.optimizer import optimize_loads


def interpret_message(body: NaturalLanguageRequest) -> ParsedIntent:
    return parse_natural_language(body)


async def run_optimization(body: OptimizeRequest) -> OptimizeResponse:
    tz = ZoneInfo(settings.timezone)
    horizon_start = body.price_start
    horizon_end = body.price_end
    if horizon_start is None:
        horizon_start = min(
            (load.window_start or datetime.now(tz) for load in body.loads),
            key=lambda d: d.astimezone(tz) if d.tzinfo else d.replace(tzinfo=tz),
        )
    if horizon_end is None:
        horizon_end = max(load.deadline for load in body.loads) + timedelta(hours=1)

    prices = await market.fetch_prices(start=horizon_start, end=horizon_end)
    renewable = None
    if body.preferences.renewable_weight > 0 or body.preferences.objective.value == "balance_cost_renewables":
        renewable = await market.fetch_renewable_range(horizon_start, horizon_end)

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
