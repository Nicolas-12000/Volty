"use client";

import { slotLabel } from "@/lib/market-demo";

type PriceChartProps = {
  prices: number[];
  planIdx?: number[];
  nowSlot?: number;
  withPlan?: boolean;
};

export function PriceChart({ prices, planIdx = [], nowSlot = -1, withPlan = true }: PriceChartProps) {
  if (!prices.length) {
    return <div className="h-48 animate-pulse rounded-lg bg-surface-2" />;
  }

  const max = Math.max(...prices) * 1.08 || 1;
  const H = 200;
  const n = prices.length;
  const barW = 960 / n;
  const inner = Math.max(2, barW * 0.74);
  const sorted = [...prices].sort((a, b) => a - b);
  const q = sorted[Math.floor(n * 0.25)] ?? sorted[0];
  const planSet = new Set(planIdx);

  return (
    <div>
      <svg
        viewBox="0 0 960 250"
        className="block h-auto w-full"
        role="img"
        aria-label="Precio day-ahead por cuarto de hora"
      >
        {[0, 50, 100, 150].map((v) => {
          const y = H - (v / max) * H + 10;
          return (
            <g key={v}>
              <line x1="0" x2="960" y1={y} y2={y} stroke="#23252a" />
              <text x="0" y={y - 4} fill="#62666d" fontSize="11">
                {v}
              </text>
            </g>
          );
        })}
        {withPlan ? (
          <g>
            <rect x="0" y="4" width={barW * 28} height={H + 8} fill="#5e6ad2" opacity=".08" />
            <line x1={barW * 28} x2={barW * 28} y1="4" y2={H + 12} stroke="#5e6ad2" strokeDasharray="3 4" />
            <text x="8" y="20" fill="#828fff" fontSize="12">
              Ventana hasta las 07:00
            </text>
          </g>
        ) : null}
        {prices.map((v, i) => {
          const h = Math.max(2, (v / max) * H);
          const inPlan = withPlan && planSet.has(i);
          return (
            <rect
              key={i}
              className="price-bar"
              style={{ animationDelay: `${i * 6}ms`, transformOrigin: `${i * barW}px ${H + 10}px` }}
              x={i * barW}
              y={H - h + 10}
              width={inner}
              height={h}
              rx="1.5"
              fill={inPlan ? "#828fff" : v <= q ? "#4a4f5c" : "#25272c"}
            >
              <title>{`${slotLabel(i)}  ${v} €/MWh`}</title>
            </rect>
          );
        })}
        {nowSlot >= 0 && nowSlot < n ? (
          <g>
            <line
              x1={nowSlot * barW + inner / 2}
              x2={nowSlot * barW + inner / 2}
              y1="4"
              y2={H + 12}
              stroke="#f7f8f8"
            />
            <text x={Math.min(nowSlot * barW + 8, 900)} y="16" fill="#f7f8f8" fontSize="11">
              ahora
            </text>
          </g>
        ) : null}
        {[0, 6, 12, 18, 24].map((h) => (
          <text
            key={h}
            x={Math.min(h * 4 * barW, 960)}
            y="240"
            fill="#62666d"
            fontSize="11"
            textAnchor={h === 24 ? "end" : h === 0 ? "start" : "middle"}
          >
            {String(h).padStart(2, "0")}:00
          </text>
        ))}
      </svg>
      <div className="mt-1.5 flex flex-wrap gap-4 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <i className="size-2 rounded-sm bg-[#25272c]" />
          Precio
        </span>
        <span className="flex items-center gap-1.5">
          <i className="size-2 rounded-sm bg-[#4a4f5c]" />
          Valles del mercado
        </span>
        {withPlan ? (
          <span className="flex items-center gap-1.5">
            <i className="size-2 rounded-sm bg-[#828fff]" />
            Carga recomendada
          </span>
        ) : null}
      </div>
    </div>
  );
}
