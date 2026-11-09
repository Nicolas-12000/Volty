"use client";

import { Matias } from "@/components/brand/poodle";
import { fmtEuro, ranges, type LocalPlan } from "@/lib/market-demo";

export function PlanCard({ plan }: { plan: LocalPlan }) {
  const save = Math.max(0, plan.base - plan.cost);
  const pct = plan.base > 0 ? Math.round((1 - plan.cost / plan.base) * 100) : 0;
  const rows: [string, string][] = [
    ["Ventana", "hasta las 07:00"],
    ["Cargar", ranges(plan.idx)],
    ["En los valles", `${fmtEuro(plan.cost)} €`],
    ["Cargar ya", `${fmtEuro(plan.base)} €`],
  ];

  return (
    <div>
      <div className="flex items-center gap-3">
        <Matias size={40} />
        <div>
          <p className="text-[15px] font-semibold tracking-[-0.2px]">Valle del mercado</p>
          <p className="text-xs text-ink-muted">2 h a 7,4 kW sobre precios reales</p>
        </div>
      </div>
      <p className="my-3 text-sm text-ink-muted">
        El optimizador coloca 14,8 kWh en los tramos más baratos antes de las 07:00.
      </p>
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4 border-b border-hairline py-2 text-sm text-ink-muted">
          <span>{k}</span>
          <b className="text-right font-medium text-ink">{v}</b>
        </div>
      ))}
      <div className="mt-4 rounded-md border border-leaf/35 bg-leaf/10 px-3.5 py-3">
        <b className="text-[28px] font-semibold tracking-[-1px] text-leaf-bright">{fmtEuro(save)} €</b>
        <small className="block text-[13px] text-ink-soft">{pct}% menos que cargar ya</small>
      </div>
    </div>
  );
}
