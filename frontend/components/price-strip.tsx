"use client";

import type { PricePoint } from "@/lib/api";
import { berlinDayKey, decimal, formatBerlinTime, formatCtKwh } from "@/lib/format";
import {
  classifyReliefHorizon,
  reliefBgClass,
  reliefLabel,
} from "@/lib/relief";

type Props = {
  points: PricePoint[];
  horizonValues: number[];
  renewablePct: number[];
  sliderIndex: number;
  onSelect: (i: number) => void;
  title: string;
  showNowMarker?: boolean;
};

function nowIndex(points: PricePoint[]): number | null {
  const key = berlinDayKey(new Date().toISOString());
  const now = Date.now();
  for (let i = 0; i < points.length; i++) {
    if (berlinDayKey(points[i].timestamp) !== key) continue;
    const t = new Date(points[i].timestamp).getTime();
    const next = i + 1 < points.length ? new Date(points[i + 1].timestamp).getTime() : t + 900_000;
    if (now >= t && now < next) return i;
  }
  return null;
}

export function PriceStrip({
  points,
  horizonValues,
  renewablePct,
  sliderIndex,
  onSelect,
  title,
  showNowMarker,
}: Props) {
  if (!points.length) {
    return (
      <div>
        <h3 className="type-heading text-primary">{title}</h3>
        <p className="notice-warning mt-3">
          Los precios de mañana salen hacia las 13:00, hora de Berlín.
        </p>
      </div>
    );
  }

  const values = points.map((p) => p.price_eur_per_mwh);
  const classes = classifyReliefHorizon(horizonValues, values);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const hasNegative = min < 0;
  const range = max - min || 1;
  const stripPx = 120;
  const ni = showNowMarker ? nowIndex(points) : null;

  const ariaText = (() => {
    const p = points[sliderIndex];
    if (!p) return "";
    const r = renewablePct[sliderIndex] ? `, ${decimal.format(renewablePct[sliderIndex])} % renovable` : "";
    return `${formatBerlinTime(p.timestamp)}, ${formatCtKwh(p.price_eur_per_mwh)}, ${reliefLabel(classes[sliderIndex])}${r}`;
  })();

  return (
    <div>
      <h3 className="type-heading text-primary">
        {title} <span className="type-label text-secondary">· hora de Berlín</span>
      </h3>
      <div
        className="relative mt-2 flex h-[72px] items-end gap-px sm:h-[88px] lg:h-[120px]"
        role="slider"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={points.length - 1}
        aria-valuenow={sliderIndex}
        aria-valuetext={ariaText}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            onSelect(Math.min(points.length - 1, sliderIndex + (e.shiftKey ? 4 : 1)));
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            onSelect(Math.max(0, sliderIndex - (e.shiftKey ? 4 : 1)));
          }
        }}
        onPointerDown={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
          onSelect(Math.min(points.length - 1, Math.floor(ratio * points.length)));
        }}
      >
        {hasNegative && (
          <div
            className="pointer-events-none absolute left-0 right-0 border-t border-secondary"
            style={{ bottom: `${((0 - min) / range) * 100}%` }}
          />
        )}
        {ni !== null && (
          <div
            className="pointer-events-none absolute top-0 bottom-0 z-10 w-0.5 bg-primary"
            style={{ left: `${((ni + 0.5) / points.length) * 100}%` }}
          >
            <span className="type-label absolute -top-5 -translate-x-1/2 whitespace-nowrap">Ahora</span>
          </div>
        )}
        {points.map((p, i) => {
          const norm = (p.price_eur_per_mwh - (hasNegative ? min : 0)) / range;
          const heightPx = Math.max(4, Math.round(norm * stripPx));
          const cls = reliefBgClass(classes[i]);
          const selected = i === sliderIndex ? "ring-2 ring-tertiary ring-offset-1" : "";
          return (
            <button
              key={p.timestamp}
              type="button"
              data-clase={classes[i]}
              className={`min-w-0 flex-1 touch-manipulation rounded-xs self-end ${cls} ${selected}`}
              style={{ height: heightPx }}
              aria-label={`${formatBerlinTime(p.timestamp)}, ${formatCtKwh(p.price_eur_per_mwh)}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(i);
              }}
            />
          );
        })}
      </div>
      <div className="mt-1 flex h-1.5 gap-px" aria-hidden>
        {points.map((_, i) => {
          const pct = renewablePct[i] ?? 0;
          const op = 0.25 + (pct / 100) * 0.75;
          return (
            <div key={i} className="min-w-0 flex-1 rounded-xs bg-hoja" style={{ opacity: op }} />
          );
        })}
      </div>
      <p className="type-label mt-1 text-secondary">% renovable (opacidad)</p>
    </div>
  );
}
