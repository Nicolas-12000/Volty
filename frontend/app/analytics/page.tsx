"use client";

import { useEffect, useState } from "react";
import { TextLink } from "@/components/ui/button-link";
import { AppShell } from "@/components/layout/app-shell";
import { Chip } from "@/components/ui/chip";
import { MetricCard } from "@/components/ui/card";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { loginHref } from "@/lib/access";
import { TrendChart } from "@/components/analytics/trend-chart";
import { HistoryTable } from "@/components/analytics/history-table";
import { fetchSmardFilters, fetchSmardSeries, type SmardSeriesResponse } from "@/lib/api";
import { readPlanHistory, type HistoryEntry } from "@/lib/client-store";
import { usePrices } from "@/hooks/use-prices";
import { useSession } from "@/providers/session-provider";
import { formatCtKwh } from "@/lib/format";

const FILTER_LABELS: Record<string, string> = {
  day_ahead_price: "Precio day-ahead",
  generation_lignite: "Generación lignito",
  generation_wind_offshore: "Eólica marina",
  generation_wind_onshore: "Eólica terrestre",
  generation_solar: "Solar",
  total_consumption: "Consumo total",
  total_generation: "Generación total",
};

export default function AnalyticsPage() {
  const { user, status } = useSession();
  const signedIn = status === "authenticated";
  const { todayPoints, loading: pricesLoading } = usePrices();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedFilter, setSelectedFilter] = useState(410);
  const [smard, setSmard] = useState<SmardSeriesResponse | null>(null);
  const [loadingSmard, setLoadingSmard] = useState(false);
  const [smardError, setSmardError] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(readPlanHistory(user?.email));
  }, [user?.email]);

  useEffect(() => {
    void fetchSmardFilters()
      .then((next) => {
        setFilters(next);
        const keys = Object.keys(next);
        if (keys.length && !keys.includes("410")) setSelectedFilter(Number(keys[0]));
      })
      .catch(() => setFilters({}));
  }, []);

  useEffect(() => {
    if (!selectedFilter) return;
    setLoadingSmard(true);
    setSmardError("");
    fetchSmardSeries(selectedFilter)
      .then(setSmard)
      .catch((err: unknown) => {
        setSmard(null);
        setSmardError(err instanceof Error ? err.message : "SMARD no respondió.");
      })
      .finally(() => setLoadingSmard(false));
  }, [selectedFilter]);

  const prices = todayPoints.map((point) => point.price_eur_per_mwh);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
  const points = (smard?.points ?? []).filter((point) => point.value != null) as Array<{
    timestamp: string;
    value: number;
  }>;

  return (
    <AppShell
      title="Analítica SMARD"
      subtitle="Series oficiales de la red alemana y el historial de planes de este dispositivo."
    >
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {pricesLoading ? (
            [0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-hairline bg-surface-1 p-5">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="mt-3 h-7 w-28" />
              </div>
            ))
          ) : (
            <>
              <MetricCard label="Valle de hoy" value={formatCtKwh(minPrice)} />
              <MetricCard label="Precio medio" value={formatCtKwh(avgPrice)} />
              <MetricCard label="Cima de hoy" value={formatCtKwh(maxPrice)} />
            </>
          )}
        </div>

        <section className="space-y-4 rounded-2xl border border-hairline bg-surface-1 p-5">
          <div>
            <h2 className="text-[15px] font-semibold tracking-[-0.2px]">Series SMARD</h2>
            <p className="text-sm text-ink-muted">Bundesnetzagentur, zona DE.</p>
          </div>
          {Object.keys(filters).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([id, name]) => (
                <Chip key={id} active={selectedFilter === Number(id)} onClick={() => setSelectedFilter(Number(id))}>
                  {FILTER_LABELS[name] ?? name}
                </Chip>
              ))}
            </div>
          ) : null}
          {loadingSmard ? (
            <SkeletonCard className="h-48" />
          ) : smardError ? (
            <p className="text-sm text-peak">{smardError}</p>
          ) : points.length ? (
            <TrendChart
              points={points}
              unit={smard?.filter_name === "day_ahead_price" ? "EUR/MWh" : "MWh"}
              accent={smard?.filter_name?.includes("wind") || smard?.filter_name?.includes("solar") ? "leaf" : "accent"}
            />
          ) : (
            <p className="text-sm text-ink-muted">Elige una serie. Si el API no responde, no hay gráfico.</p>
          )}
        </section>

        {signedIn ? (
          <section className="space-y-3">
            <h2 className="text-[15px] font-semibold tracking-[-0.2px]">Historial de planes</h2>
            <HistoryTable entries={history} />
          </section>
        ) : (
          <p className="text-sm text-ink-muted">
            El historial de planes es de tu hogar.{" "}
            <TextLink href={loginHref("/analytics")}>Entra</TextLink>{" "}
            para verlo.
          </p>
        )}
      </div>
    </AppShell>
  );
}
