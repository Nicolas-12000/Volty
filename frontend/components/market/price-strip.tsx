"use client";

import { useCallback, useRef, type KeyboardEvent } from "react";
import type { PricePoint } from "@/lib/api";
import type { ReliefClass } from "@/lib/relief";
import { classifyReliefHorizon, reliefLabel } from "@/lib/relief";
import { formatBerlinTime, formatCtKwh } from "@/lib/format";
import { cn } from "@/lib/cn";
import { RenewableBar } from "./renewable-bar";
import { Tooltip } from "@/components/ui/tooltip";

/* ── Relief → CSS class mapping ──────────────────────────────────────────── */
function reliefBgClass(c: ReliefClass): string {
  const map: Record<ReliefClass, string> = {
    "valle-hondo": "bg-relief-valley-deep",
    valle: "bg-relief-valley",
    llano: "bg-relief-plain",
    loma: "bg-relief-hill",
    cima: "bg-relief-peak",
  };
  return map[c];
}

/* ── Props ───────────────────────────────────────────────────────────────── */
interface PriceStripProps {
  points: PricePoint[];
  horizonValues: number[];
  renewablePct?: number[];
  sliderIndex: number;
  onSelect: (index: number) => void;
  title?: string;
  showNowMarker?: boolean;
}

export function PriceStrip({
  points,
  horizonValues,
  renewablePct,
  sliderIndex,
  onSelect,
  title,
  showNowMarker = false,
}: PriceStripProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const prices = points.map((p) => p.price_eur_per_mwh);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice || 1;

  const reliefClasses = classifyReliefHorizon(horizonValues, prices);

  /* Find "now" index */
  const nowIndex = showNowMarker
    ? (() => {
        const now = Date.now();
        let best = 0;
        let bestDiff = Infinity;
        for (let i = 0; i < points.length; i++) {
          const diff = Math.abs(new Date(points[i].timestamp).getTime() - now);
          if (diff < bestDiff) {
            bestDiff = diff;
            best = i;
          }
        }
        return best;
      })()
    : -1;

  /* Click handler */
  const handleBarClick = useCallback(
    (index: number) => {
      onSelect(index);
    },
    [onSelect]
  );

  /* Keyboard navigation */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowRight" && sliderIndex < points.length - 1) {
        e.preventDefault();
        onSelect(sliderIndex + 1);
      } else if (e.key === "ArrowLeft" && sliderIndex > 0) {
        e.preventDefault();
        onSelect(sliderIndex - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        onSelect(0);
      } else if (e.key === "End") {
        e.preventDefault();
        onSelect(points.length - 1);
      }
    },
    [sliderIndex, points.length, onSelect]
  );

  if (!points.length) return null;

  const selectedPoint = points[sliderIndex];
  const selectedRelief = reliefClasses[sliderIndex];

  return (
    <div className="flex flex-col gap-2">
      {/* Header with title + selected readout */}
      <div className="flex items-baseline justify-between gap-2">
        {title && (
          <span className="type-label text-ink-dimmed">{title}</span>
        )}
        {selectedPoint && (
          <span className="type-caption tabular-nums text-ink-muted">
            {formatBerlinTime(selectedPoint.timestamp)} ·{" "}
            {formatCtKwh(selectedPoint.price_eur_per_mwh)} ·{" "}
            {reliefLabel(selectedRelief)}
          </span>
        )}
      </div>

      {/* Bar chart container */}
      <div
        ref={containerRef}
        role="slider"
        aria-label="Franja de precios por intervalo"
        aria-valuemin={0}
        aria-valuemax={points.length - 1}
        aria-valuenow={sliderIndex}
        aria-valuetext={
          selectedPoint
            ? `${formatBerlinTime(selectedPoint.timestamp)}, ${formatCtKwh(selectedPoint.price_eur_per_mwh)}`
            : undefined
        }
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative flex items-end gap-px rounded-sm",
          "h-18 sm:h-22 lg:h-30",
          "focus-visible:outline-2 focus-visible:outline-focus-ring focus-visible:outline-offset-2"
        )}
      >
        {points.map((point, i) => {
          const heightPct =
            10 + ((point.price_eur_per_mwh - minPrice) / range) * 90;
          const isSelected = i === sliderIndex;
          const isNow = i === nowIndex;

          return (
            <div
              key={point.timestamp}
              className="relative flex flex-1 items-end justify-center"
              style={{ height: "100%" }}
            >
              {/* Now marker */}
              {isNow && (
                <div className="absolute top-0 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center">
                  <span className="type-caption text-accent whitespace-nowrap">
                    Ahora
                  </span>
                  <div className="h-full w-px bg-accent opacity-50" />
                </div>
              )}

              <Tooltip
                className="h-full items-end"
                content={
                  <span className="tabular-nums">
                    {formatBerlinTime(point.timestamp)} · {formatCtKwh(point.price_eur_per_mwh)} ·{" "}
                    {reliefLabel(reliefClasses[i])}
                  </span>
                }
              >
                <button
                  type="button"
                  onClick={() => handleBarClick(i)}
                  aria-label={`${formatBerlinTime(point.timestamp)}: ${formatCtKwh(point.price_eur_per_mwh)}`}
                  className={cn(
                    "w-full min-w-0.5 rounded-t-xs transition-opacity duration-100",
                    reliefBgClass(reliefClasses[i]),
                    isSelected ? "opacity-100 ring-2 ring-accent ring-offset-1 ring-offset-canvas" : "opacity-70 hover:opacity-90",
                  )}
                  style={{ height: `${heightPct}%` }}
                />
              </Tooltip>
            </div>
          );
        })}
      </div>

      {/* Renewable percentage strip */}
      {renewablePct && renewablePct.length > 0 ? <RenewableBar values={renewablePct} /> : null}
    </div>
  );
}
