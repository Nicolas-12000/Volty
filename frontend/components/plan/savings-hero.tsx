import { cn } from "@/lib/cn";
import { money } from "@/lib/format";

type SavingsHeroProps = {
  optimizedCost: number;
  asapCost: number;
  savingsVsAsap: number;
  className?: string;
};

export function SavingsHero({
  optimizedCost,
  asapCost,
  savingsVsAsap,
  className,
}: SavingsHeroProps) {
  const diff = asapCost - optimizedCost;
  const isMinimal = diff < 0.1 || (asapCost > 0 && diff / asapCost < 0.02);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-hairline bg-surface-2 p-6 ring-1 ring-accent-glow md:p-8",
        className,
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="type-label text-ink-muted">Ahorro proyectado</span>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="type-metric-xl text-valley-deep">
              ↓ {money.format(Math.max(0, savingsVsAsap))}
            </span>
            {!isMinimal && asapCost > 0 && (
              <span className="rounded-full bg-valley-deep-subtle px-2.5 py-0.5 type-caption font-semibold text-valley-deep">
                - {Math.round((diff / asapCost) * 100)}%
              </span>
            )}
          </div>
          <p className="mt-2 type-body-sm text-ink-muted">
            {isMinimal
              ? `Cargar ahora apenas costaría ${money.format(Math.max(0.06, diff))} más. Los precios son planos en este horizonte.`
              : "Calculado comparando el horario optimizado frente a carga inmediata sin gestión de demanda."}
          </p>
        </div>

        <div className="flex items-center gap-6 border-t border-hairline pt-4 md:border-l md:border-t-0 md:pl-8 md:pt-0">
          <div>
            <div className="type-label text-ink-dimmed">Coste Óptimo</div>
            <div className="type-metric-lg text-ink">{money.format(optimizedCost)}</div>
          </div>
          <div className="text-ink-dimmed">vs</div>
          <div>
            <div className="type-label text-ink-dimmed">Sin optimizar</div>
            <div className="type-metric-lg text-ink-muted line-through">
              {money.format(asapCost)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

