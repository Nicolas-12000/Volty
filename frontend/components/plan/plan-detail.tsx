import { cn } from "@/lib/cn";
import type { OptimizeResponse } from "@/lib/api";
import { formatBerlinTime, formatCtKwh, decimal } from "@/lib/format";

type PlanDetailProps = {
  plan: OptimizeResponse["plans"][0];
  intervalMinutes?: number;
  className?: string;
};

export function PlanDetail({ plan, intervalMinutes = 15, className }: PlanDetailProps) {
  // Only intervals with non-zero consumption or show schedule summary
  const activeIntervals = plan.intervals.filter((i) => i.power_kw > 0.05);

  return (
    <div className={cn("overflow-hidden rounded-lg border border-hairline bg-surface-2", className)}>
      <div className="flex items-center justify-between border-b border-hairline p-5">
        <div>
          <h3 className="type-heading text-ink">{plan.name}</h3>
          <p className="mt-0.5 type-body-sm text-ink-muted">
            {decimal.format(plan.total_energy_kwh)} kWh programados en intervalos de {intervalMinutes} min
          </p>
        </div>
        <div className="text-right">
          <span className="type-label text-ink-dimmed">Total</span>
          <div className="type-metric-md text-ink">
            {new Intl.NumberFormat("es-CO", { style: "currency", currency: "EUR" }).format(
              plan.total_cost_eur,
            )}
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-surface-1 type-label text-ink-dimmed">
            <tr>
              <th className="px-5 py-3">Hora (Berlín)</th>
              <th className="px-5 py-3">Potencia</th>
              <th className="px-5 py-3">Energía</th>
              <th className="px-5 py-3 text-right">Precio Mayorista</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline type-metric-sm text-ink">
            {activeIntervals.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center type-body text-ink-muted">
                  No se registraron intervalos activos en este plan.
                </td>
              </tr>
            ) : (
              activeIntervals.map((interval) => (
                <tr key={interval.timestamp} className="hover:bg-surface-hover transition-colors">
                  <td className="px-5 py-3 font-medium text-ink">
                    {formatBerlinTime(interval.timestamp)}
                  </td>
                  <td className="px-5 py-3 text-ink-muted">
                    {decimal.format(interval.power_kw)} <span className="type-caption">kW</span>
                  </td>
                  <td className="px-5 py-3 text-ink-muted">
                    {decimal.format(interval.energy_kwh)} <span className="type-caption">kWh</span>
                  </td>
                  <td className="px-5 py-3 text-right text-valley-deep font-semibold">
                    {formatCtKwh(interval.price_eur_per_mwh)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

