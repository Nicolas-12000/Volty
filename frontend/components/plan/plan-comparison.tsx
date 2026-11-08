import { cn } from "@/lib/cn";
import { money } from "@/lib/format";

type PlanComparisonProps = {
  optimizedCost: number;
  asapCost: number;
  uniformCost: number;
  className?: string;
};

export function PlanComparison({
  optimizedCost,
  asapCost,
  uniformCost,
  className,
}: PlanComparisonProps) {
  const plans = [
    {
      title: "Plan Volty",
      subtitle: "Ventana óptima",
      cost: optimizedCost,
      optimal: true,
      description: "Desplaza potencia hacia valles y ventanas con mayor porcentaje renovable.",
    },
    {
      title: "Cargar de inmediato (ASAP)",
      subtitle: "Sin gestión",
      cost: asapCost,
      optimal: false,
      description: "Inicia a potencia máxima hasta completar la carga sin considerar el mercado.",
    },
    {
      title: "Reparto uniforme",
      subtitle: "Potencia constante",
      cost: uniformCost,
      optimal: false,
      description: "Distribuye los kWh equitativamente a lo largo de toda la ventana disponible.",
    },
  ];

  return (
    <div className={cn("grid gap-4 sm:grid-cols-3", className)}>
      {plans.map((p) => (
        <div
          key={p.title}
          className={cn(
            "relative flex flex-col justify-between rounded-lg border bg-surface-2 p-5 transition-colors",
            p.optimal
              ? "border-accent ring-1 ring-accent-glow"
              : "border-hairline",
          )}
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="type-heading text-ink">{p.title}</span>
              {p.optimal && (
                <span className="rounded-pill bg-accent px-2 py-0.5 type-caption font-semibold text-white">
                  Óptimo
                </span>
              )}
            </div>
            <p className="mt-1 type-caption text-ink-muted">{p.subtitle}</p>
            <p className="mt-3 type-body-sm text-ink-muted">{p.description}</p>
          </div>

          <div className="mt-6 border-t border-hairline pt-4">
            <span className="type-label text-ink-dimmed">Coste total estimado</span>
            <div
              className={cn(
                "mt-0.5 type-metric-lg",
                p.optimal ? "text-valley-deep" : "text-ink",
              )}
            >
              {money.format(p.cost)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

