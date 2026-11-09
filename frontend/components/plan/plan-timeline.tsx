import type { OptimizeResponse } from "@/lib/api";
import { decimal, formatBerlinTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Tooltip } from "@/components/ui/tooltip";

type PlanTimelineProps = {
  plans: OptimizeResponse["plans"];
  intervalMinutes: number;
};

export function PlanTimeline({ plans, intervalMinutes }: PlanTimelineProps) {
  const timestamps = plans[0]?.intervals.map((interval) => interval.timestamp) ?? [];
  if (!timestamps.length) return null;

  const prices = plans[0].intervals.map((interval) => interval.price_eur_per_mwh);
  const sorted = [...prices].sort((a, b) => a - b);
  const q = sorted[Math.floor(sorted.length * 0.25)] ?? sorted[0];
  const hourMarks = hourLabels(timestamps);

  return (
    <div className="space-y-5 rounded-2xl border border-hairline bg-surface-1 p-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold tracking-[-0.2px]">Timeline del plan</h2>
          <p className="text-sm text-ink-muted">
            Potencia programada cada {intervalMinutes} min sobre los precios del mercado.
          </p>
        </div>
        <span className="text-xs text-ink-dimmed">{timestamps.length} intervalos</span>
      </div>

      <div className="space-y-4">
        {plans.map((plan) => {
          const maxPower = Math.max(...plan.intervals.map((interval) => interval.power_kw), 0.01);
          return (
            <div key={plan.load_id} className="space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-ink">{plan.name}</span>
                <span className="text-xs tabular-nums text-ink-muted">
                  {decimal.format(plan.total_energy_kwh)} kWh
                </span>
              </div>
              <div className="flex h-9 items-end gap-px">
                {plan.intervals.map((interval) => {
                  const active = interval.power_kw > 0.05;
                  const height = active ? 22 + (interval.power_kw / maxPower) * 78 : 8;
                  return (
                    <Tooltip
                      key={interval.timestamp}
                      content={
                        <span className="tabular-nums">
                          {formatBerlinTime(interval.timestamp)} · {decimal.format(interval.power_kw)} kW
                        </span>
                      }
                    >
                      <div
                        className={cn("w-full min-w-0.5 rounded-t-xs", active ? "bg-accent-bright" : "bg-hairline")}
                        style={{ height: `${height}%` }}
                      />
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <span className="text-[13px] text-ink-dimmed">Precio</span>
        <div className="flex h-2 gap-px overflow-hidden rounded-xs">
          {prices.map((price, i) => (
            <div
              key={timestamps[i]}
              className={cn("flex-1", price <= q ? "bg-[#4a4f5c]" : "bg-[#25272c]")}
              title={`${formatBerlinTime(timestamps[i])} · ${price} €/MWh`}
            />
          ))}
        </div>
        <div className="relative h-4">
          {hourMarks.map((mark) => (
            <span
              key={mark.label}
              className="absolute text-[11px] tabular-nums text-ink-dimmed"
              style={{ left: `${mark.pct}%`, transform: "translateX(-50%)" }}
            >
              {mark.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function hourLabels(timestamps: string[]): Array<{ label: string; pct: number }> {
  const marks: Array<{ label: string; pct: number }> = [];
  timestamps.forEach((ts, i) => {
    const date = new Date(ts);
    if (date.getMinutes() !== 0) return;
    if (date.getHours() % 6 !== 0) return;
    marks.push({
      label: formatBerlinTime(ts),
      pct: timestamps.length === 1 ? 0 : (i / (timestamps.length - 1)) * 100,
    });
  });
  return marks.slice(0, 6);
}
