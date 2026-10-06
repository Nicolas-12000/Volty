"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PriceStrip } from "@/components/price-strip";
import {
  fetchHealth,
  fetchPrices,
  fetchRenewableShare,
  interpret,
  optimize,
  type LoadSpec,
  type OptimizeResponse,
  type ParsedIntent,
  type PricePoint,
} from "@/lib/api";
import {
  berlinDayKey,
  decimal,
  formatBerlinDateTimeLocal,
  formatBerlinTime,
  formatCtKwh,
  money,
} from "@/lib/format";
import { cheapestWindow, classifyReliefHorizon, reliefLabel } from "@/lib/relief";
import { validateLoadFeasibility } from "@/lib/validation";

type DayTab = "today" | "tomorrow";
type Priority = "cost" | "balance" | "renewable";
type Theme = "system" | "light" | "dark";

function todayKey() {
  return berlinDayKey(new Date().toISOString());
}

function tomorrowKey() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return berlinDayKey(d.toISOString());
}

function prefsFromPriority(p: Priority): ParsedIntent["preferences"] {
  if (p === "renewable") return { objective: "balance_cost_renewables", renewable_weight: 0.5 };
  if (p === "balance") return { objective: "balance_cost_renewables", renewable_weight: 0.25 };
  return { objective: "minimize_cost", renewable_weight: 0 };
}

function savingsHeadline(opt: number, asap: number): string {
  const diff = asap - opt;
  if (diff < 0.1 || (asap > 0 && diff / asap < 0.02)) {
    return `Hoy da casi igual: cargar ya cuesta solo ${money.format(Math.max(0.06, diff))} más.`;
  }
  return `Ahorras ${money.format(diff)} frente a cargar ya`;
}

export function VoltyApp() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem("volty-theme") as Theme) || "system";
  });
  const [day, setDay] = useState<DayTab>("today");
  const [priority, setPriority] = useState<Priority>("cost");
  const [prices, setPrices] = useState<PricePoint[]>([]);
  const [intervalMinutes, setIntervalMinutes] = useState(15);
  const [biddingZone, setBiddingZone] = useState("DE-LU");
  const [pricesLoading, setPricesLoading] = useState(true);
  const [pricesError, setPricesError] = useState("");
  const [pricesUpdatedAt, setPricesUpdatedAt] = useState("");
  const [dbOk, setDbOk] = useState(true);
  const [renewableDays, setRenewableDays] = useState<Record<string, number>>({});
  const [sliderIndex, setSliderIndex] = useState(0);
  const [stripTouched, setStripTouched] = useState(false);
  const [nlText, setNlText] = useState("");
  const [mobileComposer, setMobileComposer] = useState(false);
  const [draftChips, setDraftChips] = useState<string[]>([]);
  const [draftConfirmed, setDraftConfirmed] = useState(false);
  const [draftLoads, setDraftLoads] = useState<LoadSpec[] | null>(null);
  const [draftPrefs, setDraftPrefs] = useState<ParsedIntent["preferences"] | null>(null);
  const [load, setLoad] = useState({
    name: "Vehículo eléctrico",
    energy_kwh: 30,
    max_power_kw: 11,
    deadlineLocal: "",
  });
  const [result, setResult] = useState<OptimizeResponse | null>(null);
  const [planning, setPlanning] = useState(false);
  const [planError, setPlanError] = useState("");
  const [statusSheet, setStatusSheet] = useState(false);

  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(7, 0, 0, 0);
    setLoad((l) => ({ ...l, deadlineLocal: formatBerlinDateTimeLocal(d) }));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
    localStorage.setItem("volty-theme", theme);
  }, [theme]);

  useEffect(() => {
    void (async () => {
      try {
        const health = await fetchHealth();
        setDbOk(health.database !== "down");
      } catch {
        setDbOk(false);
      }
      const [series, ren] = await Promise.all([
        fetchPrices().catch((e) => {
          setPricesError(String(e));
          return null;
        }),
        fetchRenewableShare(),
      ]);
      if (series) {
        setPrices(series.points);
        setIntervalMinutes(series.interval_minutes);
        setBiddingZone(series.bidding_zone);
        setPricesUpdatedAt(formatBerlinTime(new Date().toISOString()));
      }
      setRenewableDays(ren.days);
      setPricesLoading(false);
    })();
  }, []);

  const pointsForDay = useCallback(
    (key: string) => prices.filter((p) => berlinDayKey(p.timestamp) === key),
    [prices],
  );

  const filteredPoints = day === "today" ? pointsForDay(todayKey()) : pointsForDay(tomorrowKey());
  const tomorrowPts = pointsForDay(tomorrowKey());
  const horizonValues = useMemo(
    () => [...pointsForDay(todayKey()), ...pointsForDay(tomorrowKey())].map((p) => p.price_eur_per_mwh),
    [pointsForDay],
  );

  const renewableFor = (pts: PricePoint[]) =>
    pts.map((p) => renewableDays[berlinDayKey(p.timestamp)] ?? 0);

  const validationWarning = validateLoadFeasibility(
    load.energy_kwh,
    load.max_power_kw,
    new Date(load.deadlineLocal).toISOString(),
  );

  const buildLoad = (): LoadSpec => ({
    name: load.name,
    energy_kwh: load.energy_kwh,
    max_power_kw: load.max_power_kw,
    window_start: new Date().toISOString(),
    deadline: new Date(load.deadlineLocal).toISOString(),
  });

  const runPlan = async () => {
    if (validationWarning) return;
    setPlanning(true);
    setPlanError("");
    try {
      const loads = draftConfirmed && draftLoads ? draftLoads : [buildLoad()];
      const prefs = draftConfirmed && draftPrefs ? draftPrefs : prefsFromPriority(priority);
      const res = await optimize(loads, prefs);
      setResult(res);
      setDraftConfirmed(true);
      if (!window.matchMedia("(min-width: 1024px)").matches) {
        document.querySelector("#plan")?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (e) {
      const msg = String(e);
      setPlanError(
        msg.includes("Imposible") || msg.includes("kW") ? msg : "No se pudo calcular el plan. Reintenta.",
      );
    } finally {
      setPlanning(false);
    }
  };

  const runInterpret = async () => {
    if (!nlText.trim()) return;
    setPlanError("");
    try {
      const parsed = await interpret(nlText);
      setDraftLoads(parsed.loads);
      setDraftPrefs(parsed.preferences);
      const l = parsed.loads[0];
      setLoad({
        name: l.name,
        energy_kwh: l.energy_kwh,
        max_power_kw: l.max_power_kw,
        deadlineLocal: formatBerlinDateTimeLocal(new Date(l.deadline)),
      });
      setDraftChips([
        l.name,
        `${l.energy_kwh} kWh`,
        `antes de ${formatBerlinTime(l.deadline)} (hora de Berlín)`,
        parsed.preferences.objective === "minimize_cost" ? "minimizar coste" : "equilibrar coste y renovables",
      ]);
      setDraftConfirmed(false);
      setMobileComposer(false);
      if (parsed.preferences.objective === "minimize_cost") setPriority("cost");
      else setPriority(parsed.preferences.renewable_weight > 0.35 ? "renewable" : "balance");
    } catch {
      setPlanError("No encontré cuánta energía necesitas. Indícalo en kWh.");
    }
  };

  const readout = () => {
    if (pricesLoading) {
      return <p className="type-body-sm text-secondary">Cargando relieve del mercado…</p>;
    }
    if (pricesError) {
      return <p className="type-body-sm text-error">{pricesError}</p>;
    }
    if (!filteredPoints.length) {
      return (
        <p className="notice-warning">
          Los precios de mañana salen hacia las 13:00, hora de Berlín.
        </p>
      );
    }
    const values = filteredPoints.map((p) => p.price_eur_per_mwh);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const classes = classifyReliefHorizon(horizonValues, values);
    const ren = renewableFor(filteredPoints);

    if (stripTouched) {
      const cur = filteredPoints[sliderIndex] ?? filteredPoints[0];
      const i = sliderIndex;
      const diffPct = mean ? ((cur.price_eur_per_mwh - mean) / mean) * 100 : 0;
      const sign = diffPct <= 0 ? "−" : "+";
      return (
        <>
          <p className="type-label text-secondary">Lectura · hora de Berlín</p>
          <p className="type-num-xl text-primary">{formatCtKwh(cur.price_eur_per_mwh)}</p>
          <p className="type-body-sm text-secondary">
            {formatBerlinTime(cur.timestamp)} · {reliefLabel(classes[i])}
            {ren[i] ? ` · ${decimal.format(ren[i])} % renovable` : ""}
          </p>
          <p className="type-body-sm text-secondary">
            {sign}
            {decimal.format(Math.abs(diffPct))} % frente a la media del día
          </p>
        </>
      );
    }

    const win = cheapestWindow(values, intervalMinutes);
    if (!win) return null;
    const a = filteredPoints[win.startIdx];
    const b = filteredPoints[win.endIdx];
    const label = day === "today" ? "hoy" : "mañana";
    return (
      <>
        <p className="type-label text-secondary">Lo más barato de {label}</p>
        <p className="type-title text-primary">
          {formatBerlinTime(a.timestamp)}–{formatBerlinTime(b.timestamp)}
        </p>
        <p className="type-num-xl text-primary">{formatCtKwh(win.avg)}</p>
        <p className="type-body-sm text-secondary">Media de la ventana · ct/kWh · hora de Berlín</p>
      </>
    );
  };

  const statusLabel = pricesError
    ? "Sin conexión con el mercado"
    : !tomorrowPts.length && day === "tomorrow"
      ? "Mañana aún no publicado"
      : `Precios al día${pricesUpdatedAt ? ` · ${pricesUpdatedAt}` : ""}`;

  const primaryLabel =
    draftChips.length && !draftConfirmed ? "Confirmar y planificar" : "Planificar";

  const asap = result?.baselines.find((b) => b.strategy === "asap");
  const uniform = result?.baselines.find((b) => b.strategy === "uniform");

  return (
    <div className="mx-auto flex min-h-dvh max-w-[1152px] w-full flex-col px-4 pb-36 sm:px-6 md:pb-8">
      <header
        className="flex items-center justify-between gap-2 pt-4 pb-2"
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 24 24" className="shrink-0 text-primary" aria-hidden>
            <path
              d="M4 18 V8 q8 10 16 0 v10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="14" r="2.5" className="fill-tertiary stroke-none" />
          </svg>
          <span className="type-display truncate lowercase text-primary">volty</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusSheet(true)}
            className={`type-label min-h-11 rounded-full bg-surface px-3 py-1.5 ${pricesError ? "text-error" : dbOk ? "text-hoja" : "text-secondary"}`}
          >
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-current" aria-hidden />
            {statusLabel}
          </button>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
            className="type-label h-11 rounded-md border border-outline bg-surface px-2 text-primary"
            aria-label="Tema"
          >
            <option value="system">Sistema</option>
            <option value="light">Día</option>
            <option value="dark">Noche</option>
          </select>
        </div>
      </header>

      <nav className="sticky top-0 z-20 flex gap-4 border-b border-outline bg-neutral/95 backdrop-blur lg:hidden" aria-label="Secciones">
        {(["mercado", "cargas", "plan"] as const).map((id) => (
          <a key={id} href={`#${id}`} className="type-heading flex h-11 items-center capitalize text-secondary">
            {id}
          </a>
        ))}
      </nav>

      <main className="flex-1 space-y-10">
        <section id="mercado" className="scroll-mt-16 lg:grid lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-8">
            <h1 className="type-title text-primary">El precio es un terreno</h1>
            <p className="type-body-md mt-2 max-w-prose text-secondary">
              La IA interpreta; el optimizador calcula. Hora de Berlín en todos los ejes.
            </p>
            <div className="mt-4 flex h-11 max-w-md rounded-md bg-neutral p-1" role="tablist">
              {(["today", "tomorrow"] as DayTab[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  role="tab"
                  onClick={() => {
                    setDay(d);
                    setSliderIndex(0);
                  }}
                  className={`type-heading min-h-11 flex-1 rounded-md ${day === d ? "bg-tertiary text-on-tertiary" : "text-secondary"}`}
                >
                  {d === "today" ? "Hoy" : "Mañana"}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 rounded-md border border-outline bg-surface p-5 lg:col-span-4 lg:mt-0">
            {readout()}
          </div>
          <div className="mt-6 rounded-md border border-outline bg-surface p-4 lg:col-span-12">
            <PriceStrip
              points={filteredPoints}
              horizonValues={horizonValues}
              renewablePct={renewableFor(filteredPoints)}
              sliderIndex={sliderIndex}
              onSelect={(i) => {
                setStripTouched(true);
                setSliderIndex(i);
              }}
              title={day === "today" ? "Hoy" : "Mañana"}
              showNowMarker={day === "today"}
            />
            {day === "today" && tomorrowPts.length > 0 && (
              <div className="mt-8 border-t border-outline pt-6">
                <PriceStrip
                  points={tomorrowPts}
                  horizonValues={horizonValues}
                  renewablePct={renewableFor(tomorrowPts)}
                  sliderIndex={0}
                  onSelect={() => {}}
                  title="Mañana (vista previa)"
                />
              </div>
            )}
          </div>
        </section>

        <section id="cargas" className="scroll-mt-16 lg:grid lg:grid-cols-12 lg:gap-6">
          <div className="space-y-4 lg:col-span-5">
            <h2 className="type-title text-primary">Cargas</h2>
            <div className="flex h-11 gap-1 rounded-md bg-neutral p-1">
              {(
                [
                  ["cost", "Coste"],
                  ["balance", "Equilibrado"],
                  ["renewable", "Renovable"],
                ] as [Priority, string][]
              ).map(([p, label]) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`type-heading min-h-11 flex-1 rounded-md ${priority === p ? "bg-tertiary text-on-tertiary" : "text-secondary"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <article className="rounded-md border border-outline bg-surface p-5">
              <h3 className="type-title text-primary">{load.name}</h3>
              <p className="type-body-sm mt-1 text-secondary">
                {decimal.format(load.energy_kwh)} kWh · máx. {decimal.format(load.max_power_kw)} kW
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <label className="block">
                  <span className="type-heading">Nombre</span>
                  <input
                    className="mt-1 h-12 w-full rounded-md border border-outline bg-surface px-3 text-base type-num-md"
                    value={load.name}
                    onChange={(e) => setLoad({ ...load, name: e.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="type-heading">Energía (kWh)</span>
                  <input
                    inputMode="decimal"
                    className="mt-1 h-12 w-full rounded-md border border-outline bg-surface px-3 text-base type-num-md"
                    value={load.energy_kwh}
                    onChange={(e) =>
                      setLoad({ ...load, energy_kwh: Number(e.target.value.replace(",", ".")) })
                    }
                  />
                </label>
                <label className="block">
                  <span className="type-heading">Potencia máx. (kW)</span>
                  <input
                    inputMode="decimal"
                    className="mt-1 h-12 w-full rounded-md border border-outline bg-surface px-3 text-base type-num-md"
                    value={load.max_power_kw}
                    onChange={(e) =>
                      setLoad({ ...load, max_power_kw: Number(e.target.value.replace(",", ".")) })
                    }
                  />
                </label>
                <label className="block">
                  <span className="type-heading">Hora límite (Berlín)</span>
                  <input
                    type="datetime-local"
                    className="mt-1 h-12 w-full rounded-md border border-outline bg-surface px-3 text-base type-num-md"
                    value={load.deadlineLocal}
                    onChange={(e) => setLoad({ ...load, deadlineLocal: e.target.value })}
                  />
                </label>
              </div>
              {validationWarning && <div className="notice-warning mt-3">{validationWarning}</div>}
              {draftChips.length > 0 && (
                <div className="mt-4">
                  <p className="type-label text-secondary">Interpretado por IA</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {draftChips.map((c) => (
                      <span
                        key={c}
                        className={`type-label rounded-sm px-2 py-2 ${draftConfirmed ? "chip-solid bg-neutral" : "chip-draft bg-surface text-secondary"}`}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {planError && <p className="type-body-sm mt-3 text-error">{planError}</p>}
              <button
                type="button"
                disabled={planning}
                onClick={() => {
                  if (draftChips.length && !draftConfirmed) {
                    setDraftConfirmed(true);
                  }
                  void runPlan();
                }}
                className="type-heading mt-4 h-12 w-full rounded-md bg-tertiary text-on-tertiary disabled:opacity-50"
              >
                {planning ? "Calculando…" : primaryLabel}
              </button>
            </article>
          </div>
          <div className="hidden md:block lg:col-span-7">
            <div className="rounded-lg border border-outline bg-surface p-4">
              <label className="type-heading" htmlFor="nl-desktop">Cuéntame qué necesitas</label>
              <textarea
                id="nl-desktop"
                rows={3}
                value={nlText}
                onChange={(e) => setNlText(e.target.value)}
                className="mt-2 w-full resize-none rounded-lg border border-outline bg-surface p-3 text-base type-body-md"
                placeholder="Necesito cargar el coche antes de las 7 y gastar lo mínimo"
              />
              <button
                type="button"
                onClick={() => void runInterpret()}
                className="type-heading mt-3 h-12 rounded-md bg-tertiary px-4 text-on-tertiary"
              >
                Interpretar
              </button>
            </div>
          </div>
        </section>

        <section id="plan" className="scroll-mt-16 md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            {result ? (
              <div className="rounded-md border border-outline bg-surface p-4">
                <p className="type-body-sm text-secondary">
                  {result.plans[0]?.name} · {money.format(result.plans[0]?.total_cost_eur ?? 0)}
                </p>
              </div>
            ) : (
              <p className="type-body-md text-secondary">
                Aún no tienes cargas. Añade la primera o cuéntame qué necesitas.
              </p>
            )}
          </div>
          <div className="mt-6 md:col-span-1 md:mt-0 lg:col-span-7">
            {result && asap && (
              <>
                <p className="type-title text-primary">
                  {savingsHeadline(result.optimized_total_cost_eur, asap.total_cost_eur)}
                </p>
                <p className="type-num-lg mt-1 text-hoja">↓ {money.format(result.savings_vs_asap_eur)}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Plan Volty", result.optimized_total_cost_eur, true],
                    ["Cargar ya", asap.total_cost_eur, false],
                    ["Reparto uniforme", uniform?.total_cost_eur ?? 0, false],
                  ].map(([label, cost, optimal]) => (
                    <div
                      key={String(label)}
                      className={`rounded-md border border-outline bg-surface p-4 ${optimal ? "ring-2 ring-tertiary/30" : ""}`}
                    >
                      <div className="flex justify-between gap-2">
                        <span className="type-heading">{label}</span>
                        {optimal && (
                          <span className="type-label rounded-xs bg-tertiary px-1 text-on-tertiary">Óptimo</span>
                        )}
                      </div>
                      <p className="type-num-lg mt-2 text-right">{money.format(cost as number)}</p>
                    </div>
                  ))}
                </div>
                <p className="type-body-sm mt-4 max-w-prose text-secondary">
                  Precio de mercado mayorista (day-ahead, {result.bidding_zone}). Tu factura incluye peajes e
                  impuestos.
                </p>
              </>
            )}
          </div>
        </section>
      </main>

      <div
        className="composer-shadow fixed bottom-0 left-0 right-0 z-30 bg-surface md:hidden"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        {mobileComposer ? (
          <div className="p-3">
            <textarea
              rows={4}
              value={nlText}
              onChange={(e) => setNlText(e.target.value)}
              className="w-full resize-none rounded-lg border border-outline bg-surface p-3 text-base"
              placeholder="Necesito cargar el coche antes de las 7…"
            />
            <button
              type="button"
              onClick={() => void runInterpret()}
              className="type-heading mt-2 h-12 w-full rounded-md bg-tertiary text-on-tertiary"
            >
              Interpretar
            </button>
            <button
              type="button"
              onClick={() => setMobileComposer(false)}
              className="type-heading mt-2 h-11 w-full rounded-md bg-neutral text-tertiary"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setMobileComposer(true)}
            className="type-body-md h-14 w-full px-4 text-left text-secondary"
          >
            Cuéntame qué necesitas…
          </button>
        )}
      </div>

      {statusSheet && (
        <div
          className="fixed inset-0 z-40 bg-primary/20"
          onClick={() => setStatusSheet(false)}
          role="presentation"
        >
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-lg border-t border-outline bg-surface p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="type-title">Estado de datos</h2>
            <p className="type-body-sm mt-2 text-secondary">
              Fuente: Energy-Charts (day-ahead, {biddingZone}).
            </p>
            <p className="type-body-sm text-secondary">Última actualización: {pricesUpdatedAt || "—"}</p>
            <button
              type="button"
              onClick={() => setStatusSheet(false)}
              className="type-heading mt-4 h-11 w-full rounded-md bg-neutral text-tertiary"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
