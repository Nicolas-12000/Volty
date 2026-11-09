"use client";

import { useEffect, useMemo, useState } from "react";
import { ButtonLink, TextLink } from "@/components/ui/button-link";
import { PriceChart } from "@/components/market/price-chart";
import { PlanCard } from "@/components/home/plan-card";
import {
  DashboardChartSkeleton,
  DashboardKpiSkeleton,
  DashboardLoadsSkeleton,
  DashboardPlanSkeleton,
  DashboardRenewableSkeleton,
} from "@/components/home/dashboard-skeleton";
import { Sparkline } from "@/components/home/sparkline";
import { usePrices } from "@/hooks/use-prices";
import { useLoads } from "@/hooks/use-loads";
import { useSession } from "@/providers/session-provider";
import { berlinNowSlot, localPlan, slotLabel } from "@/lib/market-demo";
import { berlinDayKey, formatBerlinTime } from "@/lib/format";
import { loginHref } from "@/lib/access";
import { cn } from "@/lib/cn";

type DayTab = 0 | 1;

export function Dashboard() {
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const sessionReady = status !== "loading";
  const { loads, ready: loadsReady } = useLoads();
  const {
    todayPoints,
    tomorrowPoints,
    renewableDays,
    loading,
    error,
    biddingZone,
    intervalMinutes,
  } = usePrices();

  const [day, setDay] = useState<DayTab>(0);
  const [nowSlot, setNowSlot] = useState<number | null>(null);

  useEffect(() => {
    setNowSlot(berlinNowSlot());
  }, []);

  const live = day === 0 ? todayPoints : tomorrowPoints;
  const prices = live.map((p) => p.price_eur_per_mwh);
  const hasPrices = prices.length > 0;
  const marketPending = loading || !hasPrices;
  const plan = useMemo(() => localPlan(prices), [prices]);

  const mn = hasPrices ? Math.min(...prices) : 0;
  const mx = hasPrices ? Math.max(...prices) : 0;
  const ns = nowSlot == null ? -1 : day === 0 ? Math.min(nowSlot, Math.max(prices.length - 1, 0)) : -1;
  const cur = hasPrices ? prices[day === 0 && ns >= 0 ? ns : 0] ?? 0 : 0;

  const dayStamp = live[0]?.timestamp;
  const liveRenew = dayStamp ? renewableDays[berlinDayKey(dayStamp)] : undefined;
  const rn = liveRenew && liveRenew > 0 ? Math.round(liveRenew) : null;
  const renewPending = marketPending || rn == null;

  const minIdx = hasPrices ? prices.indexOf(mn) : -1;
  const maxIdx = hasPrices ? prices.indexOf(mx) : -1;
  const renewSpark = live.map((p) => renewableDays[berlinDayKey(p.timestamp)] ?? 0);

  const kpis = hasPrices
    ? [
        {
          label: day === 0 ? "Precio ahora" : "Primer tramo",
          value: String(Math.round(cur)),
          unit: "€/MWh",
          spark: prices,
          green: false,
        },
        {
          label: "Mínimo del día",
          value: String(Math.round(mn)),
          unit: minIdx >= 0 ? `a las ${slotLabel(minIdx)}` : "",
          spark: prices.map((v) => -v),
          green: true,
        },
        {
          label: "Máximo del día",
          value: String(Math.round(mx)),
          unit: maxIdx >= 0 ? `a las ${slotLabel(maxIdx)}` : "",
          spark: prices,
          green: false,
        },
        {
          label: "Renovables",
          value: rn != null ? `${rn}%` : "—",
          unit: "del mix",
          spark: renewSpark.some((v) => v > 0) ? renewSpark : prices,
          green: false,
        },
      ]
    : [];

  return (
    <div id="mercado" className="panel">
      {error ? (
        <p className="sr-only" role="status">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 border-b border-hairline px-5 py-3">
        <div className="flex gap-1 rounded-full border border-hairline bg-canvas p-0.75" role="tablist">
          {([["Hoy", 0], ["Mañana", 1]] as const).map(([label, d]) => (
            <button
              key={label}
              role="tab"
              aria-selected={day === d}
              onClick={() => setDay(d)}
              className={cn(
                "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                day === d ? "bg-surface-3 text-ink" : "text-ink-muted hover:text-ink-soft",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="chip text-ink-dimmed">
          {biddingZone} · {intervalMinutes} min
        </span>
        <span className="flex-1" />
        {hasPrices && !error ? (
          <span className="chip">
            <span className="size-1.5 rounded-full bg-leaf shadow-[0_0_0_3px_rgba(39,166,68,.22)]" />
            Precios al día
          </span>
        ) : (
          <span className="chip text-ink-dimmed">{loading ? "Consultando mercado…" : "Esperando mercado"}</span>
        )}
        <ButtonLink href="/analytics" variant="secondary" size="sm" className="bg-canvas text-ink-soft hover:bg-surface-2 hover:text-ink">
          Analítica SMARD
        </ButtonLink>
      </div>

      <div className="grid grid-cols-2 border-b border-hairline lg:grid-cols-4">
        {marketPending ? (
          <DashboardKpiSkeleton />
        ) : (
          kpis.map((k, i) => (
            <div
              key={k.label}
              className={cn(
                "flex items-end justify-between gap-2 border-hairline px-5 py-5",
                i % 2 === 0 && "border-r",
                i < 2 && "border-b lg:border-b-0",
                "lg:border-r lg:last:border-r-0",
              )}
            >
              <div>
                <small className="block text-[13px] text-ink-muted">{k.label}</small>
                <b className="text-[26px] font-semibold tracking-[-0.8px] text-ink">{k.value}</b>
                <i className="ml-1 text-[13px] not-italic text-ink-dimmed">{k.unit}</i>
              </div>
              <Sparkline data={k.spark} color={k.green ? "#3ddc84" : "#8b93ff"} />
            </div>
          ))
        )}
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="px-5 pb-4 pt-5">
          {marketPending ? <DashboardChartSkeleton /> : <PriceChart prices={prices} planIdx={plan.idx} nowSlot={ns} />}
        </div>
        <aside id="matias-plan" className="border-t border-hairline bg-canvas p-5 lg:border-l lg:border-t-0">
          {marketPending ? <DashboardPlanSkeleton /> : <PlanCard plan={plan} />}
        </aside>
      </div>

      <div id="hogar" className="grid border-t border-hairline lg:grid-cols-2">
        <div className="border-b border-hairline p-5 lg:border-b-0 lg:border-r">
          <h3 className="text-[15px] font-semibold tracking-[-0.2px] text-ink">Mix renovable</h3>
          {renewPending ? (
            <DashboardRenewableSkeleton />
          ) : (
            <>
              <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-surface-3">
                <i style={{ width: `${rn}%` }} className="bg-accent-bright" />
              </div>
              <p className="mt-3 text-sm text-ink-muted">{rn}% del mix</p>
            </>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[15px] font-semibold tracking-[-0.2px] text-ink">Mis cargas</h3>
            {signedIn ? (
              <TextLink href="/loads">Añadir carga</TextLink>
            ) : null}
          </div>
          {!sessionReady || (signedIn && !loadsReady) ? (
            <DashboardLoadsSkeleton />
          ) : signedIn ? (
            <ul className="mt-3">
              {loads.length === 0 ? (
                <DashboardLoadsSkeleton rows={2} />
              ) : (
                loads.slice(0, 4).map((l) => (
                  <li
                    key={l.name}
                    className="flex items-center justify-between gap-3 border-b border-hairline py-2.5 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">{l.name}</p>
                      <p className="text-xs text-ink-muted">
                        {l.energy_kwh} kWh · antes de{" "}
                        {l.deadlineLocal ? formatBerlinTime(new Date(l.deadlineLocal).toISOString()) : "—"}
                      </p>
                    </div>
                    <span className="chip border-leaf/40 text-leaf-bright">En hogar</span>
                  </li>
                ))
              )}
            </ul>
          ) : (
            <div className="mt-2">
              <DashboardLoadsSkeleton rows={3} />
              <TextLink href={loginHref("/loads")} className="mt-4 inline-flex">
                Entrar para planificar →
              </TextLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
