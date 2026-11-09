"use client";

import { useState } from "react";
import { slotLabel } from "@/lib/market-demo";
import { decimal, formatCtKwh } from "@/lib/format";
import { cn } from "@/lib/cn";

type PriceChartProps = {
  prices: number[];
  planIdx?: number[];
  nowSlot?: number;
  /** Fin del plazo (cuartos de hora desde medianoche del día mostrado). */
  deadlineSlot?: number | null;
  deadlineLabel?: string | null;
};

export function PriceChart({
  prices,
  planIdx = [],
  nowSlot = -1,
  deadlineSlot = null,
  deadlineLabel = null,
}: PriceChartProps) {
  const [selected, setSelected] = useState<number | null>(null);

  if (!prices.length) {
    return <div className="h-full min-h-112 animate-pulse rounded-lg bg-surface-2" />;
  }

  const peak = Math.max(...prices);
  const max = niceCeil(peak * 1.04);
  const width = 960;
  const height = 520;
  const padL = 48;
  const padR = 10;
  const padT = 44;
  const padB = 30;
  const plotH = height - padT - padB;
  const plotW = width - padL - padR;
  const n = prices.length;
  const barW = plotW / n;
  const inner = Math.max(2, barW * 0.74);
  const sorted = [...prices].sort((a, b) => a - b);
  const q = sorted[Math.floor(n * 0.25)] ?? sorted[0];
  const planSet = new Set(planIdx);
  const showGuide = deadlineSlot != null && deadlineSlot > 0 && deadlineSlot <= n;
  const guideEnd = showGuide ? deadlineSlot : 0;
  const ticks = yTicks(max);
  const active = selected != null && selected >= 0 && selected < n ? selected : null;
  const activePrice = active != null ? prices[active] : null;
  const nowX = nowSlot >= 0 && nowSlot < n ? padL + nowSlot * barW + inner / 2 : null;
  const ahoraY = padT + 16;
  const ahoraALaDerecha = nowX != null && nowX < padL + 56;

  return (
    <div className="flex h-full min-h-112 flex-col">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="block min-h-88 w-full flex-1"
        role="img"
        aria-label="Precio de la luz por cuarto de hora. Toca una barra para ver el detalle."
      >
        {ticks.map((v) => {
          const y = padT + (1 - v / max) * plotH;
          return (
            <g key={v}>
              <line x1={padL} x2={padL + plotW} y1={y} y2={y} stroke="#23252a" vectorEffect="non-scaling-stroke" />
              <text x={padL - 8} y={y + 4} textAnchor="end" fill="#62666d" fontSize="13">
                {v}
              </text>
            </g>
          );
        })}
        {showGuide ? (
          <g>
            <rect x={padL} y={padT} width={barW * guideEnd} height={plotH} fill="#5e6ad2" opacity=".08" />
            <line
              x1={padL + barW * guideEnd}
              x2={padL + barW * guideEnd}
              y1={padT}
              y2={padT + plotH}
              stroke="#5e6ad2"
              strokeDasharray="3 4"
              vectorEffect="non-scaling-stroke"
            />
            <text x={padL + 8} y={20} fill="#828fff" fontSize="13">
              Plazo{deadlineLabel ? ` antes de las ${deadlineLabel}` : ""}
            </text>
          </g>
        ) : null}
        {prices.map((v, i) => {
          const h = Math.max(2, (v / max) * plotH);
          const inPlan = showGuide && planSet.has(i);
          const isSel = active === i;
          const x = padL + i * barW;
          return (
            <rect
              key={i}
              className="price-bar cursor-pointer"
              style={{ animationDelay: `${i * 6}ms`, transformOrigin: `${x}px ${padT + plotH}px` }}
              x={x}
              y={padT + plotH - h}
              width={inner}
              height={h}
              rx="1.5"
              fill={isSel ? "#c5caff" : inPlan ? "#828fff" : v <= q ? "#4a4f5c" : "#25272c"}
              onClick={() => setSelected((prev) => (prev === i ? null : i))}
            >
              <title>{`${slotLabel(i)}  ${decimal.format(v)} €/MWh`}</title>
            </rect>
          );
        })}
        {nowX != null ? (
          <g>
            <line x1={nowX} x2={nowX} y1={padT} y2={padT + plotH} stroke="#f7f8f8" vectorEffect="non-scaling-stroke" />
            <text
              x={ahoraALaDerecha ? nowX + 10 : nowX}
              y={ahoraY}
              textAnchor={ahoraALaDerecha ? "start" : "middle"}
              fill="#f7f8f8"
              fontSize="12"
            >
              ahora
            </text>
          </g>
        ) : null}
        {[0, 6, 12, 18, 24].map((h) => (
          <text
            key={h}
            x={padL + Math.min(h * 4 * barW, plotW)}
            y={height - 8}
            fill="#62666d"
            fontSize="13"
            textAnchor={h === 24 ? "end" : h === 0 ? "start" : "middle"}
          >
            {String(h).padStart(2, "0")}:00
          </text>
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <i className="size-2 rounded-sm bg-[#25272c]" />
          Precio
        </span>
        <span className="flex items-center gap-1.5">
          <i className="size-2 rounded-sm bg-[#4a4f5c]" />
          Horas baratas
        </span>
        {showGuide ? (
          <span className="flex items-center gap-1.5">
            <i className="size-2 rounded-sm bg-[#828fff]" />
            Tramos baratos dentro del plazo
          </span>
        ) : null}
      </div>

      <div
        className={cn(
          "mt-3 rounded-md border px-3 py-2.5",
          active != null ? "border-hairline-strong bg-surface-2" : "border-dashed border-hairline bg-transparent",
        )}
      >
        {active != null && activePrice != null ? (
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="text-[13px] font-medium text-ink">
                {slotLabel(active)}–{slotLabel(active + 1)}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {activePrice <= q ? "Hora barata" : "Hora más cara"}
                {planSet.has(active) ? " · te conviene cargar aquí" : ""}
                {nowSlot === active ? " · es ahora" : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[15px] font-semibold tabular-nums tracking-[-0.2px] text-ink">
                {decimal.format(activePrice)} €/MWh
              </p>
              <p className="text-xs tabular-nums text-ink-muted">{formatCtKwh(activePrice)}</p>
            </div>
          </div>
        ) : (
          <p className="text-[13px] text-ink-muted">Toca una barra para ver a qué hora es y cuánto cuesta.</p>
        )}
      </div>
    </div>
  );
}

function niceCeil(value: number): number {
  if (value <= 50) return 50;
  const step = value <= 200 ? 25 : 50;
  return Math.ceil(value / step) * step;
}

function yTicks(max: number): number[] {
  const step = max <= 100 ? 25 : max <= 200 ? 50 : 100;
  const ticks: number[] = [];
  for (let v = 0; v <= max; v += step) ticks.push(v);
  return ticks;
}
