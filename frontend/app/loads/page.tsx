"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { LoadForm } from "@/components/loads/load-form";
import { LoadList } from "@/components/loads/load-list";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prefsFromPriority, useLoads } from "@/hooks/use-loads";
import { useOptimize } from "@/hooks/use-optimize";

export default function LoadsPage() {
  const router = useRouter();
  const { loads, priority, setPriority, addLoad, updateLoad, removeLoad, buildLoadSpecs, clock } =
    useLoads();
  const { runPlan, planning, error } = useOptimize();
  const [active, setActive] = useState(0);
  const [submitError, setSubmitError] = useState("");

  const index = Math.min(active, Math.max(loads.length - 1, 0));
  const current = loads[index];

  const handleOptimize = async () => {
    setSubmitError("");
    try {
      const specs = buildLoadSpecs();
      if (!specs.length) {
        setSubmitError("Agrega al menos una carga para optimizar.");
        return;
      }
      const res = await runPlan(specs, prefsFromPriority(priority));
      if (res) router.push("/plan");
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Error al procesar las cargas.");
    }
  };

  return (
    <AppShell
      title="Tus cargas"
      subtitle="Energía, potencia y hora límite. El optimizador coloca cada dispositivo en los valles del mercado."
      actions={
        <Button type="button" onClick={() => void handleOptimize()} loading={planning} disabled={planning || loads.length === 0}>
          {planning ? "Calculando…" : "Optimizar plan"}
        </Button>
      }
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <Card>
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-[13px] text-ink-muted">Dispositivo</p>
              <h2 className="mt-1 text-[15px] font-semibold tracking-[-0.2px]">Datos de la carga</h2>
            </div>
            {current ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  removeLoad(index);
                  setActive(0);
                }}
                disabled={loads.length <= 1}
              >
                Quitar
              </Button>
            ) : null}
          </div>
          {current ? (
            <LoadForm load={current} clock={clock} onChange={(data) => updateLoad(index, data)} />
          ) : (
            <p className="text-sm text-ink-muted">Añade un dispositivo para empezar.</p>
          )}
        </Card>

        <LoadList
          loads={loads}
          clock={clock}
          activeIndex={index}
          onSelect={setActive}
          onUpdate={updateLoad}
          onRemove={(item) => {
            removeLoad(item);
            setActive(0);
          }}
          onAdd={() => {
            setActive(loads.length);
            addLoad();
          }}
        />

        <Card>
          <p className="text-[13px] text-ink-muted">Qué debe cuidar el plan</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Chip active={priority === "cost"} onClick={() => setPriority("cost")}>
              Minimizar coste
            </Chip>
            <Chip active={priority === "balance"} onClick={() => setPriority("balance")}>
              Coste y renovable
            </Chip>
            <Chip active={priority === "renewable"} onClick={() => setPriority("renewable")}>
              Energía verde
            </Chip>
          </div>
        </Card>

        {error || submitError ? (
          <div className="rounded-lg border border-peak/30 bg-peak-subtle p-4">
            <p className="text-sm text-peak">{error || submitError}</p>
          </div>
        ) : null}

        <Button
          type="button"
          fullWidth
          size="lg"
          onClick={() => void handleOptimize()}
          loading={planning}
          disabled={planning || loads.length === 0}
        >
          {planning ? "Calculando…" : "Ver el plan"}
        </Button>
      </div>
    </AppShell>
  );
}
