"use client";

import { useCallback, useState } from "react";
import { optimize, interpret, type OptimizeResponse, type ParsedIntent, type LoadSpec } from "@/lib/api";
import { pushPlanHistory, writeLastPlan } from "@/lib/client-store";
import { useSession } from "@/providers/session-provider";

export function useOptimize() {
  const { user } = useSession();
  const ownerEmail = user?.email ?? null;
  const [result, setResult] = useState<OptimizeResponse | null>(null);
  const [planning, setPlanning] = useState(false);
  const [error, setError] = useState("");

  const runPlan = useCallback(
    async (loads: LoadSpec[], prefs: ParsedIntent["preferences"]) => {
      setPlanning(true);
      setError("");
      try {
        const res = await optimize(loads, prefs);
        setResult(res);
        writeLastPlan(res, ownerEmail);
        pushPlanHistory(
          {
            cost: res.optimized_total_cost_eur,
            savings: res.savings_vs_asap_eur,
            loadNames: res.plans.map((plan) => plan.name),
          },
          ownerEmail,
        );
        return res;
      } catch (e) {
        const msg = String(e);
        setError(
          msg.includes("Imposible") || msg.includes("kW")
            ? msg
            : "No se pudo calcular el plan. Reintenta.",
        );
        return null;
      } finally {
        setPlanning(false);
      }
    },
    [ownerEmail],
  );

  const runInterpret = useCallback(async (text: string) => {
    try {
      return await interpret(text);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      throw new Error(msg || "No encontré cuánta energía necesitas. Indícalo en kWh.");
    }
  }, []);

  const asap = result?.baselines.find((b) => b.strategy === "asap");
  const uniform = result?.baselines.find((b) => b.strategy === "uniform");

  return { result, planning, error, setError, runPlan, runInterpret, asap, uniform };
}

