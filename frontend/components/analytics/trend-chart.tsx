"use client";

import { useId, useMemo, useState, type MouseEvent } from "react";
import {
  decimal,
  formatBerlinTime,
  formatBerlinWeekday,
  formatCtKwh,
  formatEnergyMwh,
  formatEurMwh,
  formatSeriesWindow,
} from "@/lib/format";
import type { SmardAccent } from "@/lib/smard";

type TrendPoint = {
  timestamp: string;
  value: number;
};

type TrendChartProps = {
  points: TrendPoint[];
  unit?: string;
  accent?: SmardAccent;
  kind?: "price" | "energy";
};

const STROKE: Record<SmardAccent, string> = {
  accent: "var(--v-accent-bright)",
  leaf: "var(--v-leaf)",
  hill: "var(--v-hill)",
};

const compact = new Intl.NumberFormat("es-CO", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function TrendChart({ points, unit = "", accent = "accent", kind }: TrendChartProps) {
  const gradId = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);

  const usable = useMemo(
    () => points.filter((point) => Number.isFinite(point.value)),
    [points],
  );

  const layout = useMemo(() => {
    if (usable.length < 2) return null;
    const values = usable.map((point) => point.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const range = max - min || 1;
    const width = 800;
    const height = 220;
    const padL = 52;
    const padR = 16;
    const padT = 18;
    const padB = 32;
    const innerW = width - padL - padR;
    const innerH = height - padT - padB;
    const t0 = new Date(usable[0].timestamp).getTime();
    const t1 = new Date(usable[usable.length - 1].timestamp).getTime();
    const span = t1 - t0 || 1;

    const xy = usable.map((point) => {
      const t = new Date(point.timestamp).getTime();
      const x = padL + ((t - t0) / span) * innerW;
      const y = padT + (1 - (point.value - min) / range) * innerH;
      return { x, y, ...point };
    });

    const ticks = [0, 0.25, 0.5, 0.75, 1].map((p) => min + range * (1 - p));
    const xTicks = pickTimeTicks(usable);
    const minPt = xy.reduce((a, b) => (b.value < a.value ? b : a));
    const maxPt = xy.reduce((a, b) => (b.value > a.value ? b : a));
    const meanY = padT + (1 - (mean - min) / range) * innerH;
    const line = xy.map((p) => `${p.x},${p.y}`).join(" ");
    const area = `${padL},${padT + innerH} ${line} ${padL + innerW},${padT + innerH}`;
    const isPrice = kind === "price" || unit === "EUR/MWh";

    return {
      width,
      height,
      padL,
      padT,
      innerW,
      innerH,
      min,
      max,
      mean,
      ticks,
      xTicks,
      xy,
      minPt,
      maxPt,
      meanY,
      line,
      area,
      isPrice,
      spanHours: span / 3_600_000,
    };
  }, [kind, unit, usable]);

  if (!layout) {
    return (
      <p className="text-sm text-ink-muted">Esta serie no tiene datos suficientes para dibujarla.</p>
    );
  }

  const {
    width,
    height,
    padL,
    padT,
    innerW,
    innerH,
    min,
    max,
    mean,
    ticks,
    xTicks,
    xy,
    minPt,
    maxPt,
    meanY,
    line,
    area,
    isPrice,
    spanHours,
  } = layout;

  const stroke = STROKE[accent];
  const hovered = hover != null ? xy[hover] : null;

  function onMove(e: MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * width;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < xy.length; i++) {
      const d = Math.abs(xy[i].x - svgX);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    setHover(best);
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-56 w-full"
          role="img"
          aria-label="Serie temporal SMARD"
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id={`fill-${gradId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>

          {ticks.map((value, i) => {
            const y = padT + (i / (ticks.length - 1)) * innerH;
            return (
              <g key={i}>
                <line
                  x1={padL}
                  x2={padL + innerW}
                  y1={y}
                  y2={y}
                  stroke="var(--v-hairline)"
                />
                <text
                  x={padL - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="var(--v-ink-dimmed)"
                  fontSize="10"
                >
                  {formatTick(value, isPrice)}
                </text>
              </g>
            );
          })}

          <line
            x1={padL}
            x2={padL + innerW}
            y1={meanY}
            y2={meanY}
            stroke="var(--v-ink-dimmed)"
            strokeDasharray="3 4"
            opacity="0.7"
          />

          <polygon points={area} fill={`url(#fill-${gradId})`} />
          <polyline
            points={line}
            fill="none"
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          <circle cx={minPt.x} cy={minPt.y} r="3.5" fill="var(--v-leaf)" />
          <circle cx={maxPt.x} cy={maxPt.y} r="3.5" fill="var(--v-peak)" />

          {xTicks.map((point) => {
            const x = xy.find((p) => p.timestamp === point.timestamp)?.x ?? padL;
            return (
              <text
                key={point.timestamp}
                x={x}
                y={height - 8}
                textAnchor="middle"
                fill="var(--v-ink-dimmed)"
                fontSize="10"
              >
                {spanHours > 36 ? formatBerlinWeekday(point.timestamp) : formatBerlinTime(point.timestamp)}
              </text>
            );
          })}

          {hovered ? (
            <g>
              <line
                x1={hovered.x}
                x2={hovered.x}
                y1={padT}
                y2={padT + innerH}
                stroke="var(--v-ink-soft)"
                strokeDasharray="2 3"
                opacity="0.6"
              />
              <circle cx={hovered.x} cy={hovered.y} r="4" fill={stroke} />
            </g>
          ) : null}
        </svg>

        {hovered ? (
          <div
            className="pointer-events-none absolute z-10 w-max rounded-md border border-hairline-strong bg-surface-3 px-2.5 py-1.5 text-xs text-ink shadow-lift"
            style={{
              left: `${Math.min(Math.max((hovered.x / width) * 100, 12), 88)}%`,
              top: 8,
              transform: "translateX(-50%)",
            }}
          >
            <p className="tabular-nums text-ink-muted">
              {formatBerlinWeekday(hovered.timestamp)} · {formatBerlinTime(hovered.timestamp)}
            </p>
            <p className="mt-0.5 font-medium tabular-nums">
              {isPrice ? formatEurMwh(hovered.value) : formatEnergyMwh(hovered.value)}
            </p>
            {isPrice ? (
              <p className="tabular-nums text-ink-muted">{formatCtKwh(hovered.value)}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs tabular-nums text-ink-dimmed">
        <span>
          mín {formatValue(min, isPrice)}
          <span className="ml-1.5 text-leaf-bright">{formatBerlinTime(minPt.timestamp)}</span>
        </span>
        <span className="text-center">
          {formatSeriesWindow(usable[0].timestamp, usable[usable.length - 1].timestamp)}
          <span className="mx-1.5">·</span>
          media {formatValue(mean, isPrice)}
        </span>
        <span>
          máx {formatValue(max, isPrice)}
          <span className="ml-1.5 text-peak">{formatBerlinTime(maxPt.timestamp)}</span>
        </span>
      </div>
      <p className="text-[11px] text-ink-dimmed">
        El gráfico está ampliado para que se vea el vaivén del día (no empieza en cero)
        {unit ? ` · ${isPrice ? "€/MWh" : unit}` : ""}.
      </p>
    </div>
  );
}

function formatTick(value: number, isPrice: boolean): string {
  if (isPrice) return decimal.format(value);
  if (Math.abs(value) >= 1000) return compact.format(value);
  return decimal.format(value);
}

function formatValue(value: number, isPrice: boolean): string {
  return isPrice ? formatEurMwh(value) : formatEnergyMwh(value);
}

function pickTimeTicks(points: TrendPoint[]): TrendPoint[] {
  if (points.length <= 4) return points;
  const last = points.length - 1;
  const idx = [0, Math.round(last / 3), Math.round((2 * last) / 3), last];
  const unique = [...new Set(idx)];
  return unique.map((i) => points[i]);
}
