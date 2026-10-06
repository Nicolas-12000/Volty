import {
  fetchHealth,
  fetchPrices,
  interpret,
  optimize,
  type LoadSpec,
  type OptimizeResponse,
  type ParsedIntent,
  type PricePoint,
} from "./api";
import {
  berlinDayKey,
  decimal,
  formatBerlinDateTimeLocal,
  formatBerlinTime,
  formatCtKwh,
  money,
} from "./lib/format";
import {
  cheapestWindow,
  classifyRelief,
  reliefBgClass,
  reliefLabel,
  type ReliefClass,
} from "./lib/relief";

type DayTab = "today" | "tomorrow";
type Priority = "cost" | "balance" | "renewable";

type DraftChip = { label: string; key: string };

const app = document.querySelector<HTMLDivElement>("#app")!;

const state = {
  theme: (localStorage.getItem("volty-theme") as "system" | "light" | "dark") || "system",
  day: "today" as DayTab,
  priority: "cost" as Priority,
  prices: [] as PricePoint[],
  intervalMinutes: 15,
  pricesLoading: true,
  pricesError: "" as string,
  dbOk: true,
  sliderIndex: 0,
  draftChips: [] as DraftChip[],
  draftConfirmed: false,
  draftLoads: null as LoadSpec[] | null,
  draftPrefs: null as ParsedIntent["preferences"] | null,
  result: null as OptimizeResponse | null,
  planning: false,
  planError: "" as string,
  load: {
    name: "Vehículo eléctrico",
    energy_kwh: 30,
    max_power_kw: 11,
    deadlineLocal: "",
  },
};

function prefsFromPriority(): ParsedIntent["preferences"] {
  if (state.priority === "renewable") {
    return { objective: "balance_cost_renewables", renewable_weight: 0.5 };
  }
  if (state.priority === "balance") {
    return { objective: "balance_cost_renewables", renewable_weight: 0.25 };
  }
  return { objective: "minimize_cost", renewable_weight: 0 };
}

function applyTheme() {
  const root = document.documentElement;
  if (state.theme === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", state.theme);
  }
  localStorage.setItem("volty-theme", state.theme);
}

function todayKey(): string {
  return berlinDayKey(new Date().toISOString());
}

function tomorrowKey(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return berlinDayKey(d.toISOString());
}

function filteredPoints(): PricePoint[] {
  const key = state.day === "today" ? todayKey() : tomorrowKey();
  return state.prices.filter((p) => berlinDayKey(p.timestamp) === key);
}

function avgPrice(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function savingsHeadline(opt: number, asap: number): string {
  const diff = asap - opt;
  if (diff < 0.1 || (asap > 0 && diff / asap < 0.02)) {
    return `Hoy da casi igual: cargar ya cuesta solo ${money.format(Math.max(0, -diff) || 0.06)} más.`;
  }
  return `Ahorras ${money.format(diff)} frente a cargar ya`;
}

function renderStrip(points: PricePoint[], animate: boolean): string {
  if (!points.length) {
    return `<div class="h-[72px] lg:h-[120px] flex gap-px items-end" aria-hidden="true">
      ${Array.from({ length: 96 })
        .map(() => `<div class="flex-1 bg-outline rounded-xs min-h-[8px] opacity-40"></div>`)
        .join("")}
    </div>`;
  }

  const values = points.map((p) => p.price_eur_per_mwh);
  const classes = classifyRelief(values);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const hasNegative = min < 0;
  const range = max - min || 1;

  const bars = points
    .map((p, i) => {
      const stripPx = 72;
      const norm = (p.price_eur_per_mwh - (hasNegative ? min : 0)) / range;
      const heightPx = Math.max(4, Math.round(norm * stripPx));
      const cls = reliefBgClass(classes[i]);
      const anim = animate ? "strip-bar-animate" : "";
      const delay = animate ? `animation-delay:${i * 4}ms;` : "";
      return `<button type="button" data-idx="${i}" class="strip-bar flex-1 min-w-0 rounded-xs ${cls} ${anim} self-end touch-manipulation" style="height:${heightPx}px;${delay}" aria-label="${formatBerlinTime(p.timestamp)}, ${formatCtKwh(p.price_eur_per_mwh)}, ${reliefLabel(classes[i])}"></button>`;
    })
    .join("");

  return `<div class="relative">
    ${hasNegative ? `<div class="absolute left-0 right-0 border-t border-secondary" style="bottom:${((0 - min) / range) * 100}%"></div>` : ""}
    <div class="h-[72px] sm:h-[88px] lg:h-[120px] flex gap-px lg:gap-px items-end" role="slider" aria-valuemin="0" aria-valuemax="${points.length - 1}" aria-valuenow="${state.sliderIndex}" aria-valuetext="${stripAria(points, classes)}">${bars}</div>
  </div>`;
}

function stripAria(points: PricePoint[], classes: ReliefClass[]): string {
  const p = points[state.sliderIndex];
  if (!p) return "";
  return `${formatBerlinTime(p.timestamp)}, ${formatCtKwh(p.price_eur_per_mwh)}, ${reliefLabel(classes[state.sliderIndex])}`;
}

function renderReadout(points: PricePoint[]): string {
  if (state.pricesLoading) {
    return `<p class="type-body-sm text-secondary">Cargando relieve del mercado…</p>`;
  }
  if (state.pricesError) {
    return `<p class="type-body-sm text-error">${escapeHtml(state.pricesError)}</p>`;
  }
  if (!points.length) {
    return `<div class="rounded-md bg-aviso/20 p-3 type-body-sm text-primary">Los precios de mañana salen hacia las 13:00, hora de Berlín.</div>`;
  }

  const values = points.map((p) => p.price_eur_per_mwh);
  const mean = avgPrice(values);
  const win = cheapestWindow(values, state.intervalMinutes);
  const cur = points[state.sliderIndex];
  const cls = classifyRelief(values);

  if (cur) {
    const diffPct = mean ? ((cur.price_eur_per_mwh - mean) / mean) * 100 : 0;
    const sign = diffPct <= 0 ? "−" : "+";
    return `
      <p class="type-label text-secondary">Lectura · hora de Berlín</p>
      <p class="type-num-xl text-primary">${formatCtKwh(cur.price_eur_per_mwh)}</p>
      <p class="type-body-sm text-secondary">${formatBerlinTime(cur.timestamp)} · ${reliefLabel(cls[state.sliderIndex])}</p>
      <p class="type-body-sm text-secondary">${sign}${decimal.format(Math.abs(diffPct))} % frente a la media del día</p>
    `;
  }

  if (win) {
    const a = points[win.startIdx];
    const b = points[win.endIdx];
    return `
      <p class="type-label text-secondary">Lo más barato de ${state.day === "today" ? "hoy" : "mañana"}</p>
      <p class="type-title text-primary">${formatBerlinTime(a.timestamp)}–${formatBerlinTime(b.timestamp)}</p>
      <p class="type-num-xl text-primary">${formatCtKwh(win.avg)}</p>
      <p class="type-body-sm text-secondary">Media de la ventana · hora de Berlín</p>
    `;
  }

  return "";
}

function renderPlanLanes(result: OptimizeResponse): string {
  const plan = result.plans[0];
  if (!plan?.intervals.length) return `<p class="type-body-sm text-secondary">Sin intervalos activos.</p>`;

  const points = filteredPoints();
  if (!points.length) return "";

  const start = new Date(points[0].timestamp).getTime();
  const end = new Date(points[points.length - 1].timestamp).getTime() + state.intervalMinutes * 60_000;
  const span = end - start || 1;

  const bands = plan.intervals
    .map((iv) => {
      const left = ((new Date(iv.timestamp).getTime() - start) / span) * 100;
      const width = Math.max(2, (state.intervalMinutes * 60_000 / span) * 100);
      return `<li class="relative h-7 sm:h-7 pointer-coarse:min-h-11"><span class="absolute top-1/2 -translate-y-1/2 h-7 rounded-sm bg-tertiary text-on-tertiary type-label px-2 flex items-center truncate" style="left:${left}%;width:${width}%">${escapeHtml(plan.name)}</span></li>`;
    })
    .join("");

  return `<ol class="relative space-y-2 min-h-[2rem]" aria-label="Carriles del plan">${bands}</ol>`;
}

function renderComparison(result: OptimizeResponse): string {
  const asap = result.baselines.find((b) => b.strategy === "asap");
  const uniform = result.baselines.find((b) => b.strategy === "uniform");
  const max = Math.max(result.optimized_total_cost_eur, asap?.total_cost_eur ?? 0, uniform?.total_cost_eur ?? 0) || 1;

  const row = (label: string, cost: number, optimal: boolean, muted: boolean) => {
    const w = (cost / max) * 100;
    const bar = muted ? "bg-outline" : "bg-tertiary";
    return `<div class="rounded-md border border-outline bg-surface p-4 ${optimal ? "ring-2 ring-tertiary/30" : ""}">
      <div class="flex justify-between items-baseline gap-2">
        <span class="type-heading text-primary">${label}</span>
        ${optimal ? `<span class="type-label bg-tertiary text-on-tertiary rounded-xs px-1">Óptimo</span>` : ""}
      </div>
      <p class="type-num-lg text-primary mt-2">${money.format(cost)}</p>
      <div class="h-2 mt-2 rounded-sm bg-neutral overflow-hidden"><div class="h-full ${bar}" style="width:${w}%"></div></div>
    </div>`;
  };

  return `
    <h2 class="type-title text-primary">Comparación</h2>
    <p class="type-num-lg text-hoja mt-2">${escapeHtml(savingsHeadline(result.optimized_total_cost_eur, asap?.total_cost_eur ?? result.optimized_total_cost_eur))}</p>
    <div class="grid gap-3 sm:grid-cols-3 mt-4">
      ${row("Plan Volty", result.optimized_total_cost_eur, true, false)}
      ${row("Cargar ya", asap?.total_cost_eur ?? 0, false, true)}
      ${row("Reparto uniforme", uniform?.total_cost_eur ?? 0, false, true)}
    </div>
    <p class="type-body-sm text-secondary mt-4 max-w-prose">Precio de mercado mayorista (day-ahead, ${result.bidding_zone}). Tu factura incluye peajes e impuestos.</p>
  `;
}

function renderChips(): string {
  if (!state.draftChips.length) return "";
  const chipClass = state.draftConfirmed ? "chip-solid bg-neutral" : "chip-draft bg-surface";
  return `
    <p class="type-body-sm text-secondary mt-4">${state.draftConfirmed ? "Restricciones confirmadas." : "Esto es lo que entendí. Revísalo antes de planificar."}</p>
    <div class="flex flex-wrap gap-2 mt-2">
      ${state.draftChips.map((c) => `<span class="type-label ${chipClass} rounded-sm px-2 py-2 text-primary">${escapeHtml(c.label)}</span>`).join("")}
    </div>
    ${!state.draftConfirmed ? `<button type="button" id="btn-confirm-draft" class="mt-3 w-full h-12 rounded-md bg-neutral text-tertiary type-heading">Confirmar y planificar</button>` : ""}
  `;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function render(): void {
  const points = filteredPoints();
  const statusClass = state.pricesError ? "text-error" : state.dbOk ? "text-hoja" : "text-aviso";
  const statusLabel = state.pricesError
    ? "Sin conexión con el mercado"
    : state.dbOk
      ? "Precios al día"
      : "Base de datos no disponible";

  app.innerHTML = `
    <div class="min-h-dvh flex flex-col max-w-[1152px] mx-auto">
      <header class="px-4 sm:px-6 pt-4 pb-2 flex items-center justify-between gap-3 safe-top">
        <div class="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18 V8 q8 10 16 0 v10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="14" r="2.5" class="fill-tertiary stroke-none"/></svg>
          <span class="type-display text-primary lowercase">volty</span>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" id="status-pill" class="type-label rounded-full bg-surface px-3 py-1.5 ${statusClass}">${statusLabel}</button>
          <select id="theme-select" class="type-label h-11 rounded-md border border-outline bg-surface px-2 text-primary" aria-label="Tema">
            <option value="system" ${state.theme === "system" ? "selected" : ""}>Sistema</option>
            <option value="light" ${state.theme === "light" ? "selected" : ""}>Día</option>
            <option value="dark" ${state.theme === "dark" ? "selected" : ""}>Noche</option>
          </select>
        </div>
      </header>

      <nav class="lg:hidden sticky top-0 z-20 bg-neutral/95 backdrop-blur border-b border-outline px-4 flex h-11 gap-4 type-heading text-secondary" aria-label="Secciones">
        <a href="#mercado" class="flex items-center h-full">Mercado</a>
        <a href="#cargas" class="flex items-center h-full">Cargas</a>
        <a href="#plan" class="flex items-center h-full">Plan</a>
      </nav>

      <main class="flex-1 px-4 sm:px-6 pb-32 lg:pb-8 space-y-8 lg:space-y-10">
        <section id="mercado" class="scroll-mt-16 lg:grid lg:grid-cols-12 lg:gap-6">
          <div class="lg:col-span-8">
            <h1 class="type-title text-primary">El precio es un terreno</h1>
            <p class="type-body-md text-secondary mt-2 max-w-prose">Desplaza tus cargas hacia los valles del mercado DE-LU. Hora de Berlín en todos los ejes.</p>
            <div class="flex mt-4 rounded-md bg-neutral p-1 h-11" role="tablist">
              <button type="button" data-day="today" class="flex-1 rounded-md type-heading h-full ${state.day === "today" ? "bg-tertiary text-on-tertiary" : "text-secondary"}">Hoy</button>
              <button type="button" data-day="tomorrow" class="flex-1 rounded-md type-heading h-full ${state.day === "tomorrow" ? "bg-tertiary text-on-tertiary" : "text-secondary"}">Mañana</button>
            </div>
          </div>
          <div class="lg:col-span-4 mt-6 lg:mt-0 rounded-md border border-outline bg-surface p-5">${renderReadout(points)}</div>
          <div class="lg:col-span-12 mt-6 rounded-md border border-outline bg-surface p-4 @container">
            ${renderStrip(points, !state.pricesLoading && points.length > 0)}
            <p class="type-num-sm text-secondary mt-2">Arrastra o pulsa una barra · 96 cuartos de hora</p>
          </div>
        </section>

        <section id="cargas" class="scroll-mt-16 lg:grid lg:grid-cols-12 lg:gap-6">
          <div class="lg:col-span-5 space-y-4">
            <h2 class="type-title text-primary">Cargas</h2>
            <div class="flex rounded-md bg-neutral p-1 h-11 gap-1" role="group" aria-label="Prioridad del hogar">
              ${(["cost", "balance", "renewable"] as Priority[])
                .map((p) => {
                  const labels = { cost: "Coste", balance: "Equilibrado", renewable: "Renovable" };
                  const on = state.priority === p;
                  return `<button type="button" data-priority="${p}" class="flex-1 rounded-md type-heading h-full ${on ? "bg-tertiary text-on-tertiary" : "text-secondary"}">${labels[p]}</button>`;
                })
                .join("")}
            </div>
            <article class="rounded-md border border-outline bg-surface p-5">
              <h3 class="type-heading text-primary">${escapeHtml(state.load.name)}</h3>
              <p class="type-body-sm text-secondary mt-1">${state.load.energy_kwh} kWh · máx. ${decimal.format(state.load.max_power_kw)} kW · antes de ${state.load.deadlineLocal ? formatBerlinTime(new Date(state.load.deadlineLocal).toISOString()) : "—"}</p>
              <form id="load-form" class="mt-4 grid gap-4 sm:grid-cols-2">
                <label class="block"><span class="type-heading text-primary">Nombre</span><input name="name" class="mt-1 w-full h-12 rounded-md border border-outline bg-surface px-3 type-num-md text-primary" value="${escapeHtml(state.load.name)}" /></label>
                <label class="block"><span class="type-heading text-primary">Energía</span><input name="energy" type="number" step="0.1" class="mt-1 w-full h-12 rounded-md border border-outline bg-surface px-3 type-num-md text-primary" value="${state.load.energy_kwh}" /><span class="type-label text-secondary">kWh</span></label>
                <label class="block"><span class="type-heading text-primary">Potencia máx.</span><input name="power" type="number" step="0.1" class="mt-1 w-full h-12 rounded-md border border-outline bg-surface px-3 type-num-md text-primary" value="${state.load.max_power_kw}" /><span class="type-label text-secondary">kW</span></label>
                <label class="block"><span class="type-heading text-primary">Hora límite</span><input name="deadline" type="datetime-local" class="mt-1 w-full h-12 rounded-md border border-outline bg-surface px-3 type-num-md text-primary" value="${state.load.deadlineLocal}" /></label>
              </form>
              ${renderChips()}
              ${state.planError ? `<p class="type-body-sm text-error mt-3">${escapeHtml(state.planError)}</p>` : ""}
              <button type="button" id="btn-plan" class="mt-4 w-full h-12 rounded-md bg-tertiary text-on-tertiary type-heading hover:bg-tertiary-container disabled:opacity-50" ${state.planning ? "disabled" : ""}>${state.planning ? "Calculando…" : "Planificar"}</button>
            </article>
          </div>
          <div class="hidden lg:block lg:col-span-7">
            <div class="rounded-lg border border-outline bg-surface p-4 composer-shadow">
              <label class="type-heading text-primary" for="nl-desktop">Cuéntame qué necesitas</label>
              <textarea id="nl-desktop" rows="3" class="mt-2 w-full rounded-md border border-outline bg-surface p-3 type-body-md text-primary resize-none" placeholder="Necesito cargar el coche antes de las 7 y gastar lo mínimo"></textarea>
              <button type="button" id="btn-interpret-desktop" class="mt-3 h-12 px-4 rounded-md bg-tertiary text-on-tertiary type-heading">Interpretar</button>
            </div>
          </div>
        </section>

        <section id="plan" class="scroll-mt-16 lg:col-span-12 space-y-4">
          <h2 class="type-title text-primary">Plan</h2>
          ${state.result ? `${renderPlanLanes(state.result)}<div class="mt-8">${renderComparison(state.result)}</div>` : `<p class="type-body-md text-secondary">Aún no hay plan. Añade una carga o cuéntame qué necesitas.</p>`}
        </section>
      </main>

      <div class="lg:hidden fixed bottom-0 left-0 right-0 z-30 composer-shadow bg-surface p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <textarea id="nl-mobile" rows="2" class="w-full rounded-lg border border-outline bg-surface p-3 type-body-md text-primary resize-none" placeholder="Necesito cargar el coche antes de las 7…"></textarea>
        <button type="button" id="btn-interpret-mobile" class="mt-2 w-full h-12 rounded-md bg-tertiary text-on-tertiary type-heading">Interpretar</button>
      </div>
    </div>
  `;

  bindEvents();
}

function buildLoad(): LoadSpec {
  return {
    name: state.load.name,
    energy_kwh: state.load.energy_kwh,
    max_power_kw: state.load.max_power_kw,
    window_start: new Date().toISOString(),
    deadline: new Date(state.load.deadlineLocal).toISOString(),
  };
}

function chipsFromIntent(parsed: ParsedIntent): DraftChip[] {
  const load = parsed.loads[0];
  const obj =
    parsed.preferences.objective === "minimize_cost" ? "minimizar coste" : "equilibrar coste y renovables";
  return [
    { key: "name", label: load.name },
    { key: "energy", label: `${load.energy_kwh} kWh` },
    { key: "deadline", label: `antes de ${formatBerlinTime(load.deadline)} (hora de Berlín)` },
    { key: "obj", label: obj },
  ];
}

function syncFormFromState() {
  const form = document.querySelector<HTMLFormElement>("#load-form");
  if (!form) return;
  state.load.name = (form.elements.namedItem("name") as HTMLInputElement).value;
  state.load.energy_kwh = Number((form.elements.namedItem("energy") as HTMLInputElement).value);
  state.load.max_power_kw = Number((form.elements.namedItem("power") as HTMLInputElement).value);
  state.load.deadlineLocal = (form.elements.namedItem("deadline") as HTMLInputElement).value;
}

async function runPlan() {
  syncFormFromState();
  state.planning = true;
  state.planError = "";
  render();
  try {
    const loads = state.draftConfirmed && state.draftLoads ? state.draftLoads : [buildLoad()];
    const prefs = state.draftConfirmed && state.draftPrefs ? state.draftPrefs : prefsFromPriority();
    state.result = await optimize(loads, prefs);
    document.querySelector("#plan")?.scrollIntoView({ behavior: "smooth" });
  } catch (e) {
    state.planError = String(e).includes("Imposible") ? String(e) : "No se pudo calcular el plan. Reintenta.";
  } finally {
    state.planning = false;
    render();
  }
}

async function runInterpret(text: string) {
  if (!text.trim()) return;
  state.planError = "";
  try {
    const parsed = await interpret(text);
    state.draftLoads = parsed.loads;
    state.draftPrefs = parsed.preferences;
    state.draftChips = chipsFromIntent(parsed);
    state.draftConfirmed = false;
    const load = parsed.loads[0];
    state.load.name = load.name;
    state.load.energy_kwh = load.energy_kwh;
    state.load.max_power_kw = load.max_power_kw;
    state.load.deadlineLocal = formatBerlinDateTimeLocal(new Date(load.deadline));
    if (parsed.preferences.objective === "minimize_cost") state.priority = "cost";
    else state.priority = parsed.preferences.renewable_weight > 0.35 ? "renewable" : "balance";
    render();
  } catch {
    state.planError = "No encontré cuánta energía necesitas. Indícalo en kWh.";
    render();
  }
}

function bindEvents() {
  document.querySelector("#theme-select")?.addEventListener("change", (e) => {
    state.theme = (e.target as HTMLSelectElement).value as typeof state.theme;
    applyTheme();
  });

  document.querySelectorAll("[data-day]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.day = (btn as HTMLElement).dataset.day as DayTab;
      state.sliderIndex = 0;
      render();
    });
  });

  document.querySelectorAll("[data-priority]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.priority = (btn as HTMLElement).dataset.priority as Priority;
      render();
    });
  });

  document.querySelectorAll(".strip-bar").forEach((bar) => {
    bar.addEventListener("click", () => {
      state.sliderIndex = Number((bar as HTMLElement).dataset.idx);
      render();
    });
  });

  document.querySelector("#btn-plan")?.addEventListener("click", () => runPlan());
  document.querySelector("#btn-confirm-draft")?.addEventListener("click", () => {
    state.draftConfirmed = true;
    render();
  });

  const interpretHandler = () => {
    const mobile = (document.querySelector("#nl-mobile") as HTMLTextAreaElement | null)?.value;
    const desktop = (document.querySelector("#nl-desktop") as HTMLTextAreaElement | null)?.value;
    runInterpret(mobile || desktop || "");
  };
  document.querySelector("#btn-interpret-mobile")?.addEventListener("click", interpretHandler);
  document.querySelector("#btn-interpret-desktop")?.addEventListener("click", interpretHandler);
}

export async function startApp(): Promise<void> {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(7, 0, 0, 0);
  state.load.deadlineLocal = formatBerlinDateTimeLocal(d);
  applyTheme();

  try {
    const health = await fetchHealth();
    state.dbOk = health.database !== "down";
  } catch {
    state.dbOk = false;
  }

  render();

  try {
    const series = await fetchPrices();
    state.prices = series.points;
    state.intervalMinutes = series.interval_minutes;
    state.pricesError = "";
  } catch (e) {
    state.pricesError = String(e);
  } finally {
    state.pricesLoading = false;
    render();
  }
}
