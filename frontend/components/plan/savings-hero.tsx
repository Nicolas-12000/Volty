import { cn } from "@/lib/cn";
import { money } from "@/lib/format";

type SavingsHeroProps = {
  optimizedCost: number;
  asapCost: number;
  savingsVsAsap: number;
  className?: string;
};

export function SavingsHero({ optimizedCost, asapCost, savingsVsAsap, className }: SavingsHeroProps) {
  const diff = asapCost - optimizedCost;
  const isMinimal = diff < 0.1 || (asapCost > 0 && diff / asapCost < 0.02);
  const pct = asapCost > 0 ? Math.round((diff / asapCost) * 100) : 0;

  return (
    <div className={cn("rounded-2xl border border-hairline bg-surface-1 p-5 sm:p-6", className)}>
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="rounded-md border border-leaf/35 bg-leaf/10 p-4">
          <b className="text-[28px] font-semibold tracking-[-1px] text-leaf-bright">
            {money.format(Math.max(0, savingsVsAsap))}
          </b>
          <small className="block text-[13px] text-ink-soft">
            {isMinimal
              ? `Cargar ahora apenas costaría ${money.format(Math.max(0.06, diff))} más.`
              : `${pct}% menos que cargar ya`}
          </small>
        </div>
        <div className="flex items-center gap-6 border-t border-hairline pt-4 md:border-l md:border-t-0 md:pl-8 md:pt-0">
          <div>
            <div className="text-[13px] text-ink-dimmed">Coste del plan</div>
            <div className="type-metric-lg text-ink">{money.format(optimizedCost)}</div>
          </div>
          <div className="text-ink-dimmed">vs</div>
          <div>
            <div className="text-[13px] text-ink-dimmed">Cargar ya</div>
            <div className="type-metric-lg text-ink-muted line-through">{money.format(asapCost)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
