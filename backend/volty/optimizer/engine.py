from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta

import numpy as np
from scipy.optimize import linprog

from volty.core.schemas import (
    BaselineComparison,
    IntervalAssignment,
    LoadPlan,
    LoadSpec,
    Objective,
    OptimizationPreferences,
    PricePoint,
)


@dataclass
class Slot:
    index: int
    timestamp: datetime
    price_eur_per_mwh: float
    renewable_share: float | None
    dt_hours: float


def _build_slots(
    prices: list[PricePoint],
    interval_minutes: int,
    renewable_by_day: dict[datetime, float] | None,
    tz,
) -> list[Slot]:
    dt_hours = interval_minutes / 60.0
    slots: list[Slot] = []
    for i, p in enumerate(prices):
        ren = None
        if renewable_by_day:
            day_key = p.timestamp.astimezone(tz).replace(hour=0, minute=0, second=0, microsecond=0)
            ren = renewable_by_day.get(day_key)
        slots.append(
            Slot(
                index=i,
                timestamp=p.timestamp,
                price_eur_per_mwh=p.price_eur_per_mwh,
                renewable_share=ren,
                dt_hours=dt_hours,
            )
        )
    return slots


def _slot_allowed(load: LoadSpec, slot: Slot, tz) -> bool:
    ts = slot.timestamp.astimezone(tz)
    if load.window_start and ts < load.window_start.astimezone(tz):
        return False
    if ts >= load.deadline.astimezone(tz):
        return False
    return True


def _cost_coefficient(
    slot: Slot,
    preferences: OptimizationPreferences,
) -> float:
    price_per_kwh = slot.price_eur_per_mwh / 1000.0
    if preferences.objective == Objective.MINIMIZE_COST or not slot.renewable_share:
        return price_per_kwh
    w = preferences.renewable_weight
    ren_norm = slot.renewable_share / 100.0
    return (1 - w) * price_per_kwh + w * (1.0 - ren_norm)


def optimize_loads(
    loads: list[LoadSpec],
    prices: list[PricePoint],
    interval_minutes: int,
    preferences: OptimizationPreferences,
    renewable_by_day: dict[datetime, float] | None,
    tz,
) -> tuple[list[LoadPlan], list[BaselineComparison], float]:
    if not prices:
        raise ValueError("No hay datos de precios para el horizonte solicitado.")

    slots = _build_slots(prices, interval_minutes, renewable_by_day, tz)
    plans: list[LoadPlan] = []

    for load in loads:
        allowed = [s for s in slots if _slot_allowed(load, s, tz)]
        if not allowed:
            raise ValueError(f"La carga '{load.name}' no tiene intervalos dentro de la ventana.")

        max_energy = load.max_power_kw * allowed[0].dt_hours
        if load.energy_kwh > len(allowed) * max_energy + 1e-6:
            raise ValueError(
                f"Imposible entregar {load.energy_kwh} kWh antes del deadline con "
                f"{load.max_power_kw} kW."
            )

        if load.must_run:
            plan = _optimize_continuous(load, allowed, preferences)
        else:
            plan = _optimize_interruptible(load, allowed, preferences)
        plans.append(plan)

    optimized_total = sum(p.total_cost_eur for p in plans)
    baselines: list[BaselineComparison] = []
    asap_total = 0.0
    for load in loads:
        allowed = [s for s in slots if _slot_allowed(load, s, tz)]
        asap = _baseline_asap(load, allowed)
        uniform = _baseline_uniform(load, allowed)
        baselines.append(asap)
        baselines.append(uniform)
        asap_total += asap.total_cost_eur

    savings = max(0.0, asap_total - optimized_total)
    return plans, baselines, savings


def _optimize_interruptible(
    load: LoadSpec,
    allowed: list[Slot],
    preferences: OptimizationPreferences,
) -> LoadPlan:
    n = len(allowed)
    c = np.array([_cost_coefficient(s, preferences) for s in allowed])
    max_e = allowed[0].dt_hours * load.max_power_kw
    A_ub = np.eye(n)
    b_ub = np.full(n, max_e)
    A_eq = np.ones((1, n))
    b_eq = np.array([load.energy_kwh])
    bounds = [(0, max_e) for _ in range(n)]

    result = linprog(c, A_ub=A_ub, b_ub=b_ub, A_eq=A_eq, b_eq=b_eq, bounds=bounds, method="highs")
    if not result.success:
        raise ValueError(f"Optimización fallida para '{load.name}': {result.message}")

    return _plan_from_energy(load, allowed, result.x)


def _optimize_continuous(
    load: LoadSpec,
    allowed: list[Slot],
    preferences: OptimizationPreferences,
) -> LoadPlan:
    duration_h = load.energy_kwh / load.max_power_kw
    block_slots = int(np.ceil(duration_h / allowed[0].dt_hours))
    if block_slots > len(allowed):
        raise ValueError(f"Ventana demasiado corta para carga continua de '{load.name}'.")

    best_cost = float("inf")
    best_x: np.ndarray | None = None
    max_e = allowed[0].dt_hours * load.max_power_kw

    for start in range(0, len(allowed) - block_slots + 1):
        x = np.zeros(len(allowed))
        for j in range(block_slots):
            idx = start + j
            if j == block_slots - 1:
                remaining = load.energy_kwh - load.max_power_kw * allowed[0].dt_hours * (block_slots - 1)
                x[idx] = max(0.0, min(max_e, remaining))
            else:
                x[idx] = max_e
        cost = float(np.dot(x, [_cost_coefficient(s, preferences) for s in allowed]))
        if cost < best_cost:
            best_cost = cost
            best_x = x

    assert best_x is not None
    return _plan_from_energy(load, allowed, best_x)


def _plan_from_energy(load: LoadSpec, allowed: list[Slot], energy: np.ndarray) -> LoadPlan:
    intervals: list[IntervalAssignment] = []
    total_cost = 0.0
    total_energy = 0.0
    for slot, e in zip(allowed, energy, strict=True):
        if e <= 1e-9:
            continue
        power = e / slot.dt_hours
        cost = e * (slot.price_eur_per_mwh / 1000.0)
        total_cost += cost
        total_energy += e
        intervals.append(
            IntervalAssignment(
                timestamp=slot.timestamp,
                power_kw=power,
                energy_kwh=float(e),
                price_eur_per_mwh=slot.price_eur_per_mwh,
                renewable_share=slot.renewable_share,
            )
        )
    return LoadPlan(
        load_id=load.id,
        name=load.name,
        intervals=intervals,
        total_energy_kwh=total_energy,
        total_cost_eur=total_cost,
    )


def _baseline_asap(load: LoadSpec, allowed: list[Slot]) -> BaselineComparison:
    remaining = load.energy_kwh
    cost = 0.0
    for slot in allowed:
        if remaining <= 0:
            break
        chunk = min(remaining, load.max_power_kw * slot.dt_hours)
        cost += chunk * (slot.price_eur_per_mwh / 1000.0)
        remaining -= chunk
    return BaselineComparison(strategy="asap", total_cost_eur=cost, total_energy_kwh=load.energy_kwh)


def _baseline_uniform(load: LoadSpec, allowed: list[Slot]) -> BaselineComparison:
    if not allowed:
        return BaselineComparison(strategy="uniform", total_cost_eur=0.0, total_energy_kwh=0.0)
    per_slot = load.energy_kwh / len(allowed)
    cost = sum(per_slot * (s.price_eur_per_mwh / 1000.0) for s in allowed)
    return BaselineComparison(strategy="uniform", total_cost_eur=cost, total_energy_kwh=load.energy_kwh)
