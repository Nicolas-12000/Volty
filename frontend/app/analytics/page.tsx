"use client";

import { useEffect, useMemo, useState } from "react";
import { TextLink } from "@/components/ui/button-link";
import { AppShell } from "@/components/layout/app-shell";
import { Chip } from "@/components/ui/chip";
import { SkeletonCard } from "@/components/ui/skeleton";
import { loginHref } from "@/lib/access";
import { TrendChart } from "@/components/analytics/trend-chart";
import { PriceKpis } from "@/components/analytics/price-kpis";
import { HistoryTable } from "@/components/analytics/history-table";
import { fetchSmardFilters, fetchSmardSeries, type SmardSeriesResponse } from "@/lib/api";
import { readPlanHistory, type HistoryEntry } from "@/lib/client-store";
import { usePrices } from "@/hooks/use-prices";
import { useSession } from "@/providers/session-provider";
import { orderedFilterIds, pickDefaultFilter, seriesMeta } from "@/lib/smard";

export default function AnalyticsPage() {
  const { user, status } = useSession();
  const signedIn = status === "authenticated";
  const { todayPoints, loading: pricesLoading, biddingZone } = usePrices();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedFilter, setSelectedFilter] = useState(4169);
  const [smard, setSmard] = useState<SmardSeriesResponse | null>(null);
  const [loadingSmard, setLoadingSmard] = useState(false);
  const [smardError, setSmardError] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const filterIds = useMemo(
    () => orderedFilterIds(Object.keys(filters).map(Number).filter((id) => Number.isFinite(id))),
    [filters],
  );
  const selectedMeta = seriesMeta(selectedFilter, smard?.filter_name ?? filters[String(selectedFilter)]);

  useEffect(() => {
    setHistory(readPlanHistory(user?.email));
  }, [user?.email]);

  useEffect(() => {
    void fetchSmardFilters()
      .then((next) => {
        setFilters(next);
        const ids = Object.keys(next).map(Number).filter((id) => Number.isFinite(id));
        setSelectedFilter((current) => (ids.includes(current) ? current : pickDefaultFilter(ids)));
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
        setSmardError(err instanceof Error ? err.message : "No pudimos cargar esta serie. Prueba otra o vuelve en un momento.");
      })
      .finally(() => setLoadingSmard(false));
  }, [selectedFilter]);

  const points = (smard?.points ?? []).filter((point) => point.value != null) as Array<{
    timestamp: string;
    value: number;
  }>;

  return (
    <AppShell
      title="Analítica"
      subtitle="El precio de hoy para decidir cuándo cargar, y cómo se mueve la red alemana."
    >
      <div className="space-y-6">
        <PriceKpis points={todayPoints} loading={pricesLoading} zone={biddingZone} />

        <section className="panel p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-semibold tracking-[-0.2px] text-ink">Red alemana</h2>
              <p className="mt-0.5 text-sm text-ink-muted">
                {selectedMeta.hint}. Datos oficiales de la red alemana.
              </p>
            </div>
            <span className="chip">{selectedMeta.unit}</span>
          </div>

          {filterIds.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {filterIds.map((id) => {
                const meta = seriesMeta(id, filters[String(id)]);
                return (
                  <Chip key={id} active={selectedFilter === id} onClick={() => setSelectedFilter(id)}>
                    {meta.label}
                  </Chip>
                );
              })}
            </div>
          ) : null}

          <div className="mt-5">
            {loadingSmard ? (
              <SkeletonCard className="h-56" />
            ) : smardError ? (
              <p className="text-sm text-peak">{smardError}</p>
            ) : points.length ? (
              <TrendChart
                points={points}
                unit={smard?.unit || selectedMeta.unit}
                accent={selectedMeta.accent}
                kind={selectedMeta.kind === "price" ? "price" : "energy"}
              />
            ) : (
              <p className="text-sm text-ink-muted">Elige una serie para verla. Si no carga, prueba otra o vuelve en un momento.</p>
            )}
          </div>
        </section>

        {signedIn ? (
          <section className="space-y-3">
            <div>
              <h2 className="text-[15px] font-semibold tracking-[-0.2px]">Historial de planes</h2>
              <p className="mt-0.5 text-sm text-ink-muted">Los horarios que ya calculaste en este dispositivo.</p>
            </div>
            <HistoryTable entries={history} />
          </section>
        ) : (
          <p className="text-sm text-ink-muted">
            El historial de horarios es de tu hogar.{" "}
            <TextLink href={loginHref("/analytics")}>Entra</TextLink> para verlo.
          </p>
        )}
      </div>
    </AppShell>
  );
}
