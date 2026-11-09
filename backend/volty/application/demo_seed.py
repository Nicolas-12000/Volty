"""Datos de demo para presentación (usuario demo + hilos MATIAS con borradores)."""

from __future__ import annotations

from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from volty.application.account import ensure_demo_user_seeded
from volty.assistant.memory.memory_store import get_thread_store
from volty.assistant.state import ThreadState
from volty.core.config import settings
from volty.core.db.session import check_database_connection
from volty.core.schemas import (
    ChatMessage,
    LoadSpec,
    Objective,
    OptimizationPreferences,
    ParsedIntent,
)

_TZ = ZoneInfo("Europe/Berlin")
_MARKER_THREAD = "00000000-0000-4000-8000-000000009901"
_THREAD_EV = "00000000-0000-4000-8000-000000009902"
_THREAD_HOME = "00000000-0000-4000-8000-000000009903"
_THREAD_WEEKEND = "00000000-0000-4000-8000-000000009904"
_THREAD_HEAT = "00000000-0000-4000-8000-000000009905"


def _berlin_deadline(hour: int, *, days_ahead: int = 1) -> datetime:
    now = datetime.now(_TZ)
    day = (now + timedelta(days=days_ahead)).replace(
        hour=hour, minute=0, second=0, microsecond=0
    )
    return day


def _intent_laundry() -> ParsedIntent:
    return ParsedIntent(
        loads=[
            LoadSpec(
                id="lavadora",
                name="Lavadora",
                energy_kwh=1.2,
                max_power_kw=2.2,
                deadline=_berlin_deadline(8),
            ),
            LoadSpec(
                id="secadora",
                name="Secadora",
                energy_kwh=2.5,
                max_power_kw=2.0,
                deadline=_berlin_deadline(10),
            ),
        ],
        preferences=OptimizationPreferences(objective=Objective.MINIMIZE_COST),
        explanation="Listo para optimizar con precios día siguiente en DE-LU.",
        confidence="rule_based",
    )


def _intent_ev() -> ParsedIntent:
    return ParsedIntent(
        loads=[
            LoadSpec(
                id="coche",
                name="Coche eléctrico",
                energy_kwh=12.0,
                max_power_kw=3.6,
                deadline=_berlin_deadline(7, days_ahead=2),
            ),
        ],
        preferences=OptimizationPreferences(
            objective=Objective.BALANCE_COST_RENEWABLES,
            renewable_weight=0.35,
        ),
        explanation="Ventana nocturna + preferencia por horas con más renovables.",
        confidence="rule_based",
    )


def _intent_weekend_batch() -> ParsedIntent:
    return ParsedIntent(
        loads=[
            LoadSpec(
                id="lavadora-2",
                name="Lavadora (fin de semana)",
                energy_kwh=1.1,
                max_power_kw=2.0,
                deadline=_berlin_deadline(9, days_ahead=3),
            ),
            LoadSpec(
                id="secadora-2",
                name="Secadora (fin de semana)",
                energy_kwh=2.8,
                max_power_kw=2.2,
                deadline=_berlin_deadline(12, days_ahead=3),
            ),
            LoadSpec(
                id="lavavajillas-2",
                name="Lavavajillas",
                energy_kwh=0.9,
                max_power_kw=1.6,
                deadline=_berlin_deadline(21, days_ahead=2),
                must_run=True,
            ),
        ],
        preferences=OptimizationPreferences(objective=Objective.MINIMIZE_COST),
        explanation="Varias cargas domesticas en ventana de fin de semana.",
        confidence="rule_based",
    )


def _intent_heat_pump() -> ParsedIntent:
    return ParsedIntent(
        loads=[
            LoadSpec(
                id="acs",
                name="Bomba de calor / ACS",
                energy_kwh=4.5,
                max_power_kw=3.0,
                deadline=_berlin_deadline(6, days_ahead=1),
            ),
        ],
        preferences=OptimizationPreferences(
            objective=Objective.BALANCE_COST_RENEWABLES,
            renewable_weight=0.5,
        ),
        explanation="Priorizar madrugada con alta producción renovable.",
        confidence="rule_based",
    )


def _intent_dishwasher() -> ParsedIntent:
    return ParsedIntent(
        loads=[
            LoadSpec(
                id="lavavajillas",
                name="Lavavajillas",
                energy_kwh=1.0,
                max_power_kw=1.8,
                deadline=_berlin_deadline(22),
                must_run=True,
            ),
        ],
        preferences=OptimizationPreferences(objective=Objective.MINIMIZE_COST),
        explanation="Falta confirmar si puede interrumpirse (must_run).",
        confidence="rule_based",
    )


def ensure_demo_presentation_seed() -> None:
    if not check_database_connection():
        return
    ensure_demo_user_seeded()
    owner = settings.demo_user_email.lower()
    store = get_thread_store()
    if store.get(_MARKER_THREAD) is not None:
        return

    now = datetime.now(_TZ)
    threads = [
        ThreadState(
            thread_id=_MARKER_THREAD,
            owner_email=owner,
            title="Presentación · lavado mañana",
            messages=[
                ChatMessage(
                    role="user",
                    content="Quiero lavar y secar antes de las 10:00, priorizando el precio más bajo.",
                ),
                ChatMessage(
                    role="assistant",
                    content="Anotado: lavadora ~1,2 kWh y secadora ~2,5 kWh para mañana. El borrador ya está listo para el optimizador.",
                ),
            ],
            draft=_intent_laundry(),
            created_at=now - timedelta(hours=5),
        ),
        ThreadState(
            thread_id=_THREAD_EV,
            owner_email=owner,
            title="Coche · carga fin de semana",
            messages=[
                ChatMessage(
                    role="user",
                    content="El sábado necesito 12 kWh antes de las 07:00, máximo 3,6 kW, equilibrio coste y renovables.",
                ),
                ChatMessage(
                    role="assistant",
                    content="Perfecto. Guardé la ventana y el objetivo mixto en el borrador.",
                ),
            ],
            draft=_intent_ev(),
            created_at=now - timedelta(hours=20),
        ),
        ThreadState(
            thread_id=_THREAD_HOME,
            owner_email=owner,
            title="Lavavajillas esta noche",
            messages=[
                ChatMessage(
                    role="user",
                    content="Lavavajillas 1 kWh, antes de las 22:00, solo busco ahorrar.",
                ),
                ChatMessage(
                    role="assistant",
                    content="Casi listo: en el borrador del plan puedes marcar si debe correr sin pausas.",
                ),
                ChatMessage(
                    role="user",
                    content="Sí, que no se pueda pausar una vez empiece.",
                ),
                ChatMessage(
                    role="assistant",
                    content="Perfecto, dejé must_run activado en el borrador. Ya puedes lanzar el optimizador.",
                ),
            ],
            draft=_intent_dishwasher(),
            created_at=now - timedelta(hours=2),
        ),
        ThreadState(
            thread_id=_THREAD_WEEKEND,
            owner_email=owner,
            title="Fin de semana · colada + cocina",
            messages=[
                ChatMessage(
                    role="user",
                    content=(
                        "El domingo quiero lavadora, secadora y lavavajillas, "
                        "todo lo más barato posible."
                    ),
                ),
                ChatMessage(
                    role="assistant",
                    content="Anoté las tres cargas con plazos distintos. Revisa el borrador y optimiza cuando quieras.",
                ),
            ],
            draft=_intent_weekend_batch(),
            created_at=now - timedelta(days=1, hours=3),
        ),
        ThreadState(
            thread_id=_THREAD_HEAT,
            owner_email=owner,
            title="ACS · madrugada verde",
            messages=[
                ChatMessage(
                    role="user",
                    content="4,5 kWh de ACS antes de las 06:00, me importa equilibrar precio y renovables.",
                ),
                ChatMessage(
                    role="assistant",
                    content="Objetivo mixto al 50 % renovables. El horario saldrá al comparar precios y curva verde.",
                ),
            ],
            draft=_intent_heat_pump(),
            created_at=now - timedelta(hours=8),
        ),
    ]
    for state in threads:
        store.save(state)
