import type { PricePoint } from "@/lib/api";
import { classifyReliefHorizon } from "@/lib/relief";
import { formatBerlinTime, formatCtKwh } from "@/lib/format";

type PriceChartProps = {
  points: PricePoint[];
  horizonValues?: number[];
};

export function PriceChart({ points, horizonValues }: PriceChartProps) {
  if (points.length < 2) return null;

  const prices = points.map((p) => p.price_eur_per_mwh);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const width = 800;
  const height = 168;
  const padX = 8;
  const padY = 12;

  const coords = prices.map((price, i) => {
    const x = padX + (i / (prices.length - 1)) * (width - padX * 2);
    const y = padY + (1 - (price - min) / range) * (height - padY * 2);
    return { x, y };
  });

  const line = coords.map((c) => `${c.x},${c.y}`).join(" ");
  const area = `${padX},${height - padY} ${line} ${width - padX},${height - padY}`;
  const relief = classifyReliefHorizon(horizonValues?.length ? horizonValues : prices, prices);

  const first = points[0];
  const last = points[points.length - 1];
  const cheapest = points.reduce((a, b) =>
    a.price_eur_per_mwh <= b.price_eur_per_mwh ? a : b,
  );

  return (
    <div className="space-y-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-40 w-full"
        role="img"
        aria-label="Evolución de precios day-ahead"
      >
        <defs>
          <linearGradient id="price-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--v-accent)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--v-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#price-fill)" />
        <polyline
          points={line}
          fill="none"
          stroke="var(--v-accent)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <div className="flex items-center justify-between type-caption text-ink-dimmed">
        <span>{formatBerlinTime(first.timestamp)}</span>
        <span className="tabular-nums text-valley-deep">
          valle {formatCtKwh(cheapest.price_eur_per_mwh)}
        </span>
        <span>{formatBerlinTime(last.timestamp)}</span>
      </div>
      <div className="flex h-1.5 gap-px overflow-hidden rounded-xs" aria-hidden="true">
        {relief.map((cls, i) => (
          <div key={points[i].timestamp} className={`flex-1 ${reliefTone(cls)}`} />
        ))}
      </div>
    </div>
  );
}

function reliefTone(cls: string): string {
  switch (cls) {
    case "valle-hondo":
      return "bg-valley-deep";
    case "valle":
      return "bg-valley";
    case "loma":
      return "bg-hill";
    case "cima":
      return "bg-peak";
    default:
      return "bg-plain";
  }
}
