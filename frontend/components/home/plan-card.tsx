"use client";

import { Matias } from "@/components/brand/poodle";
import { fmtEuro, slotLabel, type LocalPlan } from "@/lib/market-demo";
import { cn } from "@/lib/cn";

export function PlanCard({ plan }: { plan: LocalPlan }) {
  const save = Math.max(0, plan.base - plan.cost);
  const pct = plan.base > 0 ? Math.round((1 - plan.cost / plan.base) * 100) : 0;
  const windows = planWindows(plan.idx);
  const isMinimal = save < 0.1 || (plan.base > 0 && save / plan.base < 0.02);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <Matias size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold tracking-[-0.2px] text-ink">Mejor momento para cargar</p>
          <p className="mt-0.5 text-xs text-ink-muted">Antes de las 07:00 · 14,8 kWh</p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-ink-muted">
        En estos tramos la luz cuesta menos; el optimizador los usa primero.
      </p>

      <div className="rounded-lg border border-hairline bg-surface-2/50 px-3 py-3">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-dimmed">
          Horarios sugeridos
        </p>
        {windows.length ? (
          <ul className="mt-2 flex flex-wrap justify-center gap-1">
            {windows.map((w) => (
              <li
                key={w}
                className="rounded-full border border-accent/35 bg-accent-subtle/50 px-2 py-0.5 text-center text-[11px] font-medium tabular-nums leading-snug text-accent-soft"
              >
                {w}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-center text-sm text-ink-muted">Aún no hay tramos recomendados.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <MetricTile label="En horas baratas" value={`${fmtEuro(plan.cost)} €`} />
        <MetricTile label="Si cargas ya" value={`${fmtEuro(plan.base)} €`} muted />
      </div>

      <div className="mt-2 rounded-lg border border-leaf/35 bg-leaf/10 px-4 py-4 pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-leaf-bright/90">
          Ahorro estimado
        </p>
        <p className="mt-2 text-[28px] font-semibold leading-none tracking-[-1px] text-leaf-bright tabular-nums">
          {fmtEuro(save)} €
        </p>
        <p className="mt-2.5 text-[13px] leading-snug text-ink-soft">
          {isMinimal
            ? "Hoy apenas cambia el coste; igual conviene esperar al valle."
            : `${pct}% menos que enchufar ahora mismo`}
        </p>
      </div>
    </div>
  );
}

function MetricTile({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="rounded-md border border-hairline bg-surface-2/80 px-3 py-3">
      <p className="text-[11px] leading-tight text-ink-dimmed">{label}</p>
      <p className={cn("mt-1.5 text-sm font-semibold tabular-nums", muted ? "text-ink-muted" : "text-ink")}>
        {value}
      </p>
    </div>
  );
}

function planWindows(idx: number[]): string[] {
  if (!idx.length) return [];
  const out: string[] = [];
  let start = idx[0];
  let prev = idx[0];
  for (let k = 1; k <= idx.length; k++) {
    const x = idx[k];
    if (x !== prev + 1) {
      out.push(`${slotLabel(start)}–${slotLabel(prev + 1)}`);
      start = x;
    }
    prev = x;
  }
  return out;
}
