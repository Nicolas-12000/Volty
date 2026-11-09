"use client";

import { cn } from "@/lib/cn";
import type { LoadFormData } from "@/lib/client-store";

type LoadCardProps = {
  load: LoadFormData;
  selected?: boolean;
  onSelect: () => void;
  onRemove: () => void;
};

export function LoadCard({ load, selected = false, onSelect, onRemove }: LoadCardProps) {
  const deadlineDisplay = load.deadlineLocal
    ? new Date(load.deadlineLocal).toLocaleString("es-CO", {
        timeZone: "Europe/Berlin",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "sin hora";

  return (
    <div className={cn("rounded-lg border bg-surface-1 p-4", selected ? "border-accent" : "border-hairline")}>
      <button type="button" onClick={onSelect} className="w-full text-left">
        <h3 className="text-[15px] font-semibold tracking-[-0.2px] text-ink">{load.name}</h3>
        <p className="mt-2 text-sm text-ink-muted">
          {load.energy_kwh} kWh · {load.max_power_kw} kW
        </p>
        <p className="mt-1 text-xs text-ink-dimmed">
          Antes de {deadlineDisplay}
          {load.must_run ? " · sin pausas" : ""}
        </p>
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="mt-3 text-xs text-ink-dimmed hover:text-peak"
        aria-label={`Quitar ${load.name}`}
      >
        Quitar de la lista
      </button>
    </div>
  );
}
