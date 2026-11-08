from datetime import datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field, model_validator


class Objective(str, Enum):
    MINIMIZE_COST = "minimize_cost"
    BALANCE_COST_RENEWABLES = "balance_cost_renewables"


class LoadSpec(BaseModel):
    id: str = Field(default="load-1", description="Identificador de la carga")
    name: str = "Vehículo eléctrico"
    energy_kwh: float = Field(gt=0, description="Energía objetivo en kWh")
    max_power_kw: float = Field(gt=0, default=11.0)
    window_start: datetime | None = Field(
        default=None, description="Inicio de ventana (ISO 8601). Por defecto: ahora."
    )
    deadline: datetime = Field(description="Debe completarse antes de esta hora")
    must_run: bool = Field(
        default=False,
        description="Si es true, la carga no puede interrumpirse una vez iniciada (continua).",
    )


class OptimizationPreferences(BaseModel):
    objective: Objective = Objective.MINIMIZE_COST
    renewable_weight: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="0 = solo coste; 1 = máximo peso a renovables en el objetivo compuesto.",
    )


class OptimizeRequest(BaseModel):
    loads: list[LoadSpec] = Field(min_length=1)
    preferences: OptimizationPreferences = Field(default_factory=OptimizationPreferences)
    price_start: datetime | None = None
    price_end: datetime | None = None


class IntervalAssignment(BaseModel):
    timestamp: datetime
    power_kw: float
    energy_kwh: float
    price_eur_per_mwh: float
    renewable_share: float | None = None


class LoadPlan(BaseModel):
    load_id: str
    name: str
    intervals: list[IntervalAssignment]
    total_energy_kwh: float
    total_cost_eur: float


class BaselineComparison(BaseModel):
    strategy: Literal["asap", "uniform"]
    total_cost_eur: float
    total_energy_kwh: float


class OptimizeResponse(BaseModel):
    plans: list[LoadPlan]
    baselines: list[BaselineComparison]
    optimized_total_cost_eur: float
    savings_vs_asap_eur: float
    price_source: str
    bidding_zone: str
    interval_minutes: int


class PricePoint(BaseModel):
    timestamp: datetime
    price_eur_per_mwh: float


class PriceSeriesResponse(BaseModel):
    bidding_zone: str
    interval_minutes: int
    unit: str
    points: list[PricePoint]
    source: str = "energy-charts"


class NaturalLanguageRequest(BaseModel):
    message: str
    context_load_name: str | None = None


class ParsedIntent(BaseModel):
    loads: list[LoadSpec]
    preferences: OptimizationPreferences
    explanation: str
    confidence: Literal["rule_based", "llm"] = "rule_based"


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1)


class MatiasChatRequest(BaseModel):
    thread_id: str | None = None
    message: str | None = None
    messages: list[ChatMessage] | None = None
    context_load_name: str | None = None
    draft: ParsedIntent | None = None

    @model_validator(mode="after")
    def _require_turn_input(self) -> "MatiasChatRequest":
        if self.message and self.message.strip():
            return self
        if self.messages and len(self.messages) >= 1:
            return self
        if self.draft is not None and self.thread_id:
            return self
        raise ValueError("Indica message, messages o draft+thread_id.")


class MatiasAction(BaseModel):
    type: Literal["apply_loads", "open_loads", "run_plan"]
    label: str


class MatiasChatResponse(BaseModel):
    thread_id: str
    reply: str
    messages: list[ChatMessage] = Field(default_factory=list)
    intent: ParsedIntent | None = None
    draft: ParsedIntent | None = None
    actions: list[MatiasAction] = Field(default_factory=list)
    assistant: str = "MATIAS"
    backend: str = "rules"
    rag_used: bool = False


class MatiasThreadSummary(BaseModel):
    thread_id: str
    title: str
    updated_at: datetime | None = None
    message_count: int = 0
    has_draft: bool = False


class MatiasThreadListResponse(BaseModel):
    threads: list[MatiasThreadSummary] = Field(default_factory=list)


class MatiasThreadResponse(BaseModel):
    thread_id: str
    title: str = "Nueva conversación"
    messages: list[ChatMessage]
    draft: ParsedIntent | None = None


class UserOut(BaseModel):
    email: str
    name: str
    assistant: str = "MATIAS"


class ProfilePatchRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=8, max_length=128)
    new_password_confirm: str = Field(min_length=8, max_length=128)


class ServerContextOut(BaseModel):
    """Contexto de mercado/optimización — solo lectura para el cliente."""

    bidding_zone: str
    timezone: str
    assistant: str
    note: str


class MatiasAccountSummary(BaseModel):
    thread_id: str
    title: str
    updated_at: datetime | None = None
    message_count: int = 0
    has_draft: bool = False


class MeMatiasBlock(BaseModel):
    thread_count: int
    threads_with_draft: int
    recent_threads: list[MatiasAccountSummary] = Field(default_factory=list)


class MeSummaryResponse(BaseModel):
    user: UserOut
    matias: MeMatiasBlock
    server: ServerContextOut
    can_change_password: bool
