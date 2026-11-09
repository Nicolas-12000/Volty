import { cn } from "@/lib/cn";
import { money } from "@/lib/format";

type PlanComparisonProps = {
  optimizedCost: number;
  asapCost: number;
  uniformCost: number;
  className?: string;
};

export function PlanComparison({ optimizedCost, asapCost, uniformCost, className }: PlanComparisonProps) {
  const plans = [
    {
      title: "Plan Volty",
      subtitle: "Ventana óptima",
      cost: optimizedCost,
      optimal: true,
      description: "Desplaza potencia hacia los valles del mercado.",
    },
    {
      title: "Cargar ya",
      subtitle: "Sin gestión",
      cost: asapCost,
      optimal: false,
      description: "Inicia a potencia máxima hasta completar la carga.",
    },
    {
      title: "Reparto uniforme",
      subtitle: "Potencia constante",
      cost: uniformCost,
      optimal: false,
      description: "Reparte los kWh a lo largo de toda la ventana.",
    },
  ];

  return (
    <div className={cn("grid gap-3 sm:grid-cols-3", className)}>
      {plans.map((p) => (
        <div
          key={p.title}
          className={cn(
            "flex flex-col justify-between rounded-lg border bg-surface-1 p-5",
            p.optimal ? "border-accent" : "border-hairline",
          )}
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[15px] font-semibold tracking-[-0.2px]">{p.title}</span>
              {p.optimal ? (
                <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-white">Óptimo</span>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-ink-muted">{p.subtitle}</p>
            <p className="mt-3 text-sm text-ink-muted">{p.description}</p>
          </div>
          <div className="mt-5 border-t border-hairline pt-4">
            <span className="text-[13px] text-ink-dimmed">Coste estimado</span>
            <div className={cn("mt-0.5 type-metric-lg", p.optimal ? "text-leaf-bright" : "text-ink")}>
              {money.format(p.cost)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
