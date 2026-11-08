"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { SavingsHero } from "@/components/plan/savings-hero";
import { PlanComparison } from "@/components/plan/plan-comparison";
import { PlanTimeline } from "@/components/plan/plan-timeline";
import { PlanDetail } from "@/components/plan/plan-detail";
import { Button } from "@/components/ui/button";
import { readLastPlan } from "@/lib/client-store";
import type { OptimizeResponse } from "@/lib/api";
import { useSession } from "@/providers/session-provider";

export default function PlanPage() {
  const router = useRouter();
  const { user } = useSession();
  const [result, setResult] = useState<OptimizeResponse | null>(null);

  useEffect(() => {
    setResult(readLastPlan(user?.email));
  }, [user?.email]);

  const asap = result?.baselines.find((b) => b.strategy === "asap");
  const uniform = result?.baselines.find((b) => b.strategy === "uniform");

  return (
    <AppShell
      title="Plan recomendado"
      subtitle="Horario del optimizador frente a cargar ya o repartir la energía."
      actions={
        <Button variant="secondary" onClick={() => router.push("/loads")}>
          Modificar cargas
        </Button>
      }
    >
      <div className="mx-auto max-w-6xl space-y-8">
        {!result ? (
          <div className="flex flex-col items-center rounded-lg border border-hairline bg-surface-2 p-12 text-center">
            <h2 className="type-heading text-ink">Todavía no hay un plan</h2>
            <p className="mt-2 max-w-md type-body text-ink-muted">
              Define las cargas y pide el horario. MATIAS puede rellenarlas desde el mercado.
            </p>
            <Button className="mt-6" onClick={() => router.push("/loads")}>
              Ir a cargas
            </Button>
          </div>
        ) : (
          <>
            <SavingsHero
              optimizedCost={result.optimized_total_cost_eur}
              asapCost={asap?.total_cost_eur ?? result.optimized_total_cost_eur}
              savingsVsAsap={result.savings_vs_asap_eur}
            />
            <div className="space-y-3">
              <h2 className="type-heading text-ink">Comparación</h2>
              <PlanComparison
                optimizedCost={result.optimized_total_cost_eur}
                asapCost={asap?.total_cost_eur ?? 0}
                uniformCost={uniform?.total_cost_eur ?? 0}
              />
            </div>
            <PlanTimeline plans={result.plans} intervalMinutes={result.interval_minutes} />
            <div className="space-y-4">
              <h2 className="type-heading text-ink">Detalle por dispositivo</h2>
              {result.plans.map((plan) => (
                <PlanDetail key={plan.load_id} plan={plan} intervalMinutes={result.interval_minutes} />
              ))}
            </div>
            <p className="type-caption text-ink-dimmed">
              Precios mayoristas DE-LU de Energy-Charts. No incluyen impuestos ni peajes.
            </p>
          </>
        )}
      </div>
    </AppShell>
  );
}
