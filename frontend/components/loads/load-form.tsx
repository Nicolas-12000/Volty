"use client";

import type { LoadFormData } from "@/lib/client-store";
import type { ClientClock } from "@/lib/use-client-clock";
import { validateLoadFeasibility } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

type LoadFormProps = {
  load: LoadFormData;
  clock: ClientClock | null;
  onChange: (data: Partial<LoadFormData>) => void;
  className?: string;
};

export function LoadForm({ load, clock, onChange, className }: LoadFormProps) {
  const windowStart = clock ? new Date(clock.nowIso) : undefined;
  const validationError = validateLoadFeasibility(
    load.energy_kwh,
    load.max_power_kw,
    load.deadlineLocal,
    windowStart,
  );

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            label="Nombre del dispositivo"
            variant="text"
            value={load.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Vehículo eléctrico, batería, lavadora"
          />
        </div>
        <Input
          label="Energía necesaria"
          variant="number"
          suffix="kWh"
          step="0.1"
          min="0.1"
          inputMode="decimal"
          value={Number.isNaN(load.energy_kwh) ? "" : load.energy_kwh}
          onChange={(e) => onChange({ energy_kwh: parseFloat(e.target.value) || 0 })}
        />
        <Input
          label="Potencia máxima"
          variant="number"
          suffix="kW"
          step="0.1"
          min="0.1"
          inputMode="decimal"
          value={Number.isNaN(load.max_power_kw) ? "" : load.max_power_kw}
          onChange={(e) => onChange({ max_power_kw: parseFloat(e.target.value) || 0 })}
        />
        <div className="sm:col-span-2">
          <Input
            label="Hora límite de carga (Berlín)"
            variant="datetime"
            value={load.deadlineLocal}
            onChange={(e) => onChange({ deadlineLocal: e.target.value })}
          />
        </div>
      </div>
      {validationError ? (
        <div className="rounded-md border border-hill/30 bg-hill-subtle p-3">
          <p className="type-body-sm text-hill">{validationError}</p>
        </div>
      ) : null}
    </div>
  );
}
