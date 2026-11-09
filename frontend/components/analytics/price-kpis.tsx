import { Sparkline } from "@/components/home/sparkline";
import { Skeleton } from "@/components/ui/skeleton";
import { decimal, formatBerlinTime, formatCtKwh, formatEurMwh } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { PricePoint } from "@/lib/api";

type PriceKpisProps = {
  points: PricePoint[];
  loading?: boolean;
  zone?: string;
};

export function PriceKpis({ points, loading = false, zone = "DE-LU" }: PriceKpisProps) {
  if (loading) {
    return (
      <section className="panel">
        <div className="border-b border-hairline px-5 py-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mt-2 h-3 w-56" />
        </div>
        <div className="grid sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border-hairline px-5 py-5 sm:border-r sm:last:border-r-0">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-3 h-8 w-28" />
              <Skeleton className="mt-2 h-3 w-32" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const prices = points.map((p) => p.price_eur_per_mwh);
  if (!prices.length) {
    return (
      <section className="panel px-5 py-6">
        <p className="text-sm text-ink-muted">Todavía no tenemos los precios de hoy.</p>
      </section>
    );
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const minIdx = prices.indexOf(min);
  const maxIdx = prices.indexOf(max);
  const minAt = points[minIdx]?.timestamp;
  const maxAt = points[maxIdx]?.timestamp;
  const span = max - min || 1;
  const avgPct = ((avg - min) / span) * 100;
  const spreadCt = (max - min) / 10;

  const cards = [
    {
      key: "valley",
      label: "Valle",
      hint: minAt ? `Mejor momento para cargar · ${formatBerlinTime(minAt)}` : "El tramo más barato de hoy",
      value: min,
      tone: "text-leaf-bright",
      dot: "bg-leaf",
      sparkColor: "#3ddc84",
    },
    {
      key: "avg",
      label: "Media",
      hint: "El precio medio de hoy",
      value: avg,
      tone: "text-ink",
      dot: "bg-accent-bright",
      sparkColor: "#8b93ff",
    },
    {
      key: "peak",
      label: "Cima",
      hint: maxAt ? `Evita este tramo · ${formatBerlinTime(maxAt)}` : "El tramo más caro de hoy",
      value: max,
      tone: "text-peak",
      dot: "bg-peak",
      sparkColor: "#e5484d",
    },
  ] as const;

  return (
    <section className="panel">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline px-5 py-3">
        <div>
          <h2 className="text-[15px] font-semibold tracking-[-0.2px] text-ink">Precio de hoy</h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            Precio de la luz hoy, en céntimos por kWh.
          </p>
        </div>
        <span className="chip">{zone} · ct/kWh</span>
      </header>

      <div className="grid sm:grid-cols-3">
        {cards.map((card, i) => (
          <div
            key={card.key}
            className={cn(
              "flex items-end justify-between gap-3 px-5 py-5",
              i < cards.length - 1 && "border-b border-hairline sm:border-b-0 sm:border-r",
            )}
          >
            <div className="min-w-0">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
                <i className={cn("size-1.5 rounded-full", card.dot)} aria-hidden="true" />
                {card.label}
              </span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className={cn("type-metric-lg tabular-nums", card.tone)}>
                  {decimal.format(card.value / 10)}
                </span>
                <span className="text-[13px] text-ink-dimmed">ct/kWh</span>
              </div>
              <p className="mt-1 text-xs tabular-nums text-ink-dimmed">{formatEurMwh(card.value)}</p>
              <p className="mt-2 text-[13px] text-ink-muted">{card.hint}</p>
            </div>
            <Sparkline data={prices} color={card.sparkColor} />
          </div>
        ))}
      </div>

      <div className="border-t border-hairline px-5 py-4">
        <div className="relative h-1.5 rounded-full bg-linear-to-r from-leaf via-hill to-peak">
          <span
            className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-canvas bg-ink"
            style={{ left: `${avgPct}%` }}
            title={`Media ${formatCtKwh(avg)}`}
          />
        </div>
        <p className="mt-3 text-sm text-ink-muted">
          Hoy hay{" "}
          <span className="font-medium text-ink tabular-nums">{decimal.format(spreadCt)} ct/kWh</span>{" "}
          de diferencia entre valle y cima.
          {minAt ? ` Si puedes esperar, carga hacia las ${formatBerlinTime(minAt)}.` : null}
        </p>
      </div>
    </section>
  );
}
