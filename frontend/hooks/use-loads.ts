"use client";

import { useCallback, useEffect, useState } from "react";
import type { LoadSpec, ParsedIntent } from "@/lib/api";
import {
  readStoredLoads,
  writeStoredLoads,
  type LoadFormData,
  type Priority,
} from "@/lib/client-store";
import { formatBerlinDateTimeLocal } from "@/lib/format";
import { useClientClock } from "@/lib/use-client-clock";
import { useSession } from "@/providers/session-provider";

export type { LoadFormData, Priority };

const DEFAULT_LOAD: LoadFormData = {
  name: "Vehículo eléctrico",
  energy_kwh: 30,
  max_power_kw: 11,
  deadlineLocal: "",
};

export function prefsFromPriority(p: Priority): ParsedIntent["preferences"] {
  if (p === "renewable") return { objective: "balance_cost_renewables", renewable_weight: 0.5 };
  if (p === "balance") return { objective: "balance_cost_renewables", renewable_weight: 0.25 };
  return { objective: "minimize_cost", renewable_weight: 0 };
}

function priorityFromPrefs(prefs: ParsedIntent["preferences"]): Priority {
  if (prefs.renewable_weight >= 0.4) return "renewable";
  if (prefs.renewable_weight > 0 || prefs.objective === "balance_cost_renewables") return "balance";
  return "cost";
}

export function useLoads() {
  const { user, status } = useSession();
  const ownerEmail = user?.email ?? null;
  const clock = useClientClock();
  const [loads, setLoads] = useState<LoadFormData[]>([DEFAULT_LOAD]);
  const [priority, setPriority] = useState<Priority>("cost");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    setReady(false);
    const stored = readStoredLoads(ownerEmail);
    if (stored?.loads.length) {
      setLoads(stored.loads);
      setPriority(stored.priority);
    } else {
      setLoads([DEFAULT_LOAD]);
      setPriority("cost");
    }
    setReady(true);
  }, [ownerEmail, status]);

  useEffect(() => {
    if (!clock) return;
    setLoads((prev) =>
      prev.map((load) =>
        load.deadlineLocal ? load : { ...load, deadlineLocal: clock.defaultDeadlineLocal },
      ),
    );
  }, [clock]);

  useEffect(() => {
    if (!ready || status !== "authenticated") return;
    writeStoredLoads({ loads, priority }, ownerEmail);
  }, [ready, loads, priority, ownerEmail, status]);

  const addLoad = useCallback(() => {
    const deadline = clock
      ? clock.defaultDeadlineLocal
      : formatBerlinDateTimeLocal(new Date(Date.now() + 86_400_000));
    setLoads((prev) => [
      ...prev,
      { name: "Nueva carga", energy_kwh: 10, max_power_kw: 3.7, deadlineLocal: deadline },
    ]);
  }, [clock]);

  const updateLoad = useCallback((index: number, data: Partial<LoadFormData>) => {
    setLoads((prev) => prev.map((load, i) => (i === index ? { ...load, ...data } : load)));
  }, []);

  const removeLoad = useCallback((index: number) => {
    setLoads((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const applyIntent = useCallback((parsed: ParsedIntent) => {
    const next = parsed.loads.map((load) => ({
      name: load.name,
      energy_kwh: load.energy_kwh,
      max_power_kw: load.max_power_kw,
      deadlineLocal: formatBerlinDateTimeLocal(new Date(load.deadline)),
      must_run: !!load.must_run,
    }));
    if (next.length) setLoads(next);
    setPriority(priorityFromPrefs(parsed.preferences));
  }, []);

  const buildLoadSpecs = useCallback((): LoadSpec[] => {
    return loads.map((load) => {
      const deadline = load.deadlineLocal.trim() ? new Date(load.deadlineLocal).toISOString() : null;
      if (!deadline) throw new Error("Indica una hora límite válida.");
      return {
        name: load.name,
        energy_kwh: load.energy_kwh,
        max_power_kw: load.max_power_kw,
        window_start: clock?.nowIso ?? deadline,
        deadline,
        must_run: !!load.must_run,
      };
    });
  }, [loads, clock]);

  return {
    loads,
    setLoads,
    priority,
    setPriority,
    addLoad,
    updateLoad,
    removeLoad,
    applyIntent,
    buildLoadSpecs,
    clock,
    ready,
  };
}
