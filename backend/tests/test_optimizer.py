from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

import pytest

from volty.core.schemas import LoadSpec, Objective, OptimizationPreferences, PricePoint
from volty.optimizer import optimize_loads


def test_optimizer_picks_cheapest_slots():
    tz = ZoneInfo("Europe/Berlin")
    start = datetime(2026, 4, 5, 0, 0, tzinfo=tz)
    values = [100.0, 10.0, 200.0, 50.0]
    prices = [
        PricePoint(timestamp=start + timedelta(minutes=15 * i), price_eur_per_mwh=v)
        for i, v in enumerate(values)
    ]
    load = LoadSpec(
        name="VE",
        energy_kwh=5.5,
        max_power_kw=11.0,
        window_start=start,
        deadline=start + timedelta(hours=1),
    )
    plans, baselines, savings = optimize_loads(
        loads=[load],
        prices=prices,
        interval_minutes=15,
        preferences=OptimizationPreferences(objective=Objective.MINIMIZE_COST),
        renewable_by_day=None,
        tz=tz,
    )
    assert len(plans) == 1
    assert plans[0].total_energy_kwh == pytest.approx(5.5)
    assert plans[0].total_cost_eur < baselines[0].total_cost_eur
    assert savings > 0
