import type { PricePoint } from "@/lib/api";
import { classifyReliefHorizon, reliefLabel, cheapestWindow } from "@/lib/relief";
import { formatBerlinTime, formatCtKwh, decimal } from "@/lib/format";
import { cn } from "@/lib/cn";

interface MarketSummaryProps {
  points: PricePoint[];
  horizonValues: number[];
  renewablePct: number[];
  sliderIndex: number;
  stripTouched: boolean;
  intervalMinutes: number;
  dayLabel: string;
}

export function MarketSummary({
  points,
  horizonValues,
  renewablePct,
  sliderIndex,
  stripTouched,
  intervalMinutes,
  dayLabel,
}: MarketSummaryProps) {
  if (!points.length) {
    return (
      <div className="rounded-md bg-surface-1 p-4">
        <p className="type-body-sm text-ink-dimmed">Sin datos de precios</p>
      </div>
    );
  }

  const prices = points.map((p) => p.price_eur_per_mwh);
  const reliefClasses = classifyReliefHorizon(horizonValues, prices);
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;

  if (stripTouched) {
    /* ── Selected bar view ──────────────────────────────────────────── */
    const point = points[sliderIndex];
    const relief = reliefClasses[sliderIndex];
    const diff = point.price_eur_per_mwh - mean;
    const diffSign = diff > 0 ? "+" : "";
    const renewable = renewablePct[sliderIndex] ?? null;

    return (
      <div className="rounded-md bg-surface-1 p-4" aria-live="polite">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            {/* Price */}
            <span className="type-metric-xl tabular-nums text-ink">
              {formatCtKwh(point.price_eur_per_mwh)}
            </span>

            {/* Time + relief label */}
            <div className="flex items-center gap-2">
              <span className="type-body-sm tabular-nums text-ink-muted">
                {formatBerlinTime(point.timestamp)}
              </span>
              <span
                className={cn(
                  "inline-block rounded-xs px-1.5 py-0.5 type-caption font-medium",
                  reliefChipClass(relief)
                )}
              >
                {reliefLabel(relief)}
              </span>
            </div>
          </div>

          {/* Right column: diff + renewable */}
          <div className="flex flex-col items-end gap-1">
            <span
              className={cn(
                "type-metric-sm tabular-nums",
                diff < 0 ? "text-valley-deep" : diff > 0 ? "text-peak" : "text-ink-muted"
              )}
            >
              {diffSign}{decimal.format(diff / 10)} ct
            </span>
            <span className="type-caption text-ink-dimmed">vs media</span>
            {renewable !== null && (
              <div className="flex items-center gap-1 mt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-leaf" aria-hidden="true" />
                <span className="type-caption tabular-nums text-ink-muted">
                  {decimal.format(renewable)}% renovable
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Default view: cheapest window ───────────────────────────────── */
  const window = cheapestWindow(prices, intervalMinutes);

  return (
    <div className="rounded-md bg-surface-1 p-4" aria-live="polite">
      <p className="type-label text-ink-dimmed mb-2">{dayLabel}</p>

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="type-metric-xl tabular-nums text-ink">
            {formatCtKwh(mean)}
          </span>
          <span className="type-caption text-ink-dimmed">precio medio</span>
        </div>

        {window && (
          <div className="flex flex-col items-end gap-1">
            <span className="type-body-sm font-medium text-valley-deep">
              Ventana más barata
            </span>
            <span className="type-metric-sm tabular-nums text-ink-muted">
              {formatBerlinTime(points[window.startIdx].timestamp)} –{" "}
              {formatBerlinTime(points[window.endIdx].timestamp)}
            </span>
            <span className="type-caption tabular-nums text-ink-dimmed">
              ~{formatCtKwh(window.avg)} media
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Chip color helper ────────────────────────────────────────────────────── */
function reliefChipClass(c: string): string {
  switch (c) {
    case "valle-hondo":
      return "bg-valley-deep-subtle text-valley-deep";
    case "valle":
      return "bg-valley-deep-subtle text-valley";
    case "llano":
      return "bg-surface-2 text-plain";
    case "loma":
      return "bg-hill-subtle text-hill";
    case "cima":
      return "bg-peak-subtle text-peak";
    default:
      return "bg-surface-2 text-ink-muted";
  }
}
