"use client";

import type { LoadSpec, ParsedIntent } from "@/lib/api";
import { formatBerlinDateTimeLocal } from "@/lib/format";

type IntentDraftEditorProps = {
  draft: ParsedIntent;
  onChange: (next: ParsedIntent) => void;
  onSaveRemote?: () => void;
  saving?: boolean;
};

export function IntentDraftEditor({ draft, onChange, onSaveRemote, saving }: IntentDraftEditorProps) {
  const loads = draft.loads ?? [];
  if (!loads.length) return null;

  const label = "text-xs leading-snug text-ink-muted";
  const field =
    "h-10 w-full rounded-md border border-hairline bg-canvas px-3 text-sm text-ink tabular-nums focus:border-hairline-strong focus:outline-none";

  const patchLoads = (nextLoads: LoadSpec[]) => {
    onChange({ ...draft, loads: nextLoads });
  };

  const patchLoadAt = (index: number, patch: Partial<LoadSpec>) => {
    patchLoads(loads.map((load, i) => (i === index ? { ...load, ...patch } : load)));
  };

  const patchPrefs = (patch: Partial<ParsedIntent["preferences"]>) => {
    onChange({
      ...draft,
      preferences: { ...draft.preferences, ...patch },
    });
  };

  const addLoad = () => {
    const ref = loads[loads.length - 1];
    const deadline = ref?.deadline ?? new Date().toISOString();
    patchLoads([
      ...loads,
      {
        id: `load-${loads.length + 1}`,
        name: "Nueva carga",
        energy_kwh: 1,
        max_power_kw: 2,
        deadline,
      },
    ]);
  };

  const removeLoad = (index: number) => {
    if (loads.length <= 1) return;
    patchLoads(loads.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <p className="text-[13px] text-ink-muted">
        Borrador editable · {loads.length} {loads.length === 1 ? "carga" : "cargas"}
      </p>
      <ul className="space-y-3">
        {loads.map((load, index) => (
          <li
            key={`${load.id ?? load.name}-${index}`}
            className="rounded-xl border border-hairline bg-canvas/40 p-3"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-ink-muted">Carga {index + 1}</span>
              {loads.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeLoad(index)}
                  className="text-xs text-ink-dimmed hover:text-peak"
                >
                  Quitar
                </button>
              ) : null}
            </div>
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className={label}>Nombre</span>
                <input
                  value={load.name}
                  onChange={(e) => patchLoadAt(index, { name: e.target.value })}
                  className={field}
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex min-w-0 flex-col gap-1">
                  <span className={`${label} flex min-h-8 items-end`}>kWh</span>
                  <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    title="Energía en kWh"
                    aria-label="Energía en kWh"
                    value={load.energy_kwh}
                    onChange={(e) => patchLoadAt(index, { energy_kwh: Number(e.target.value) })}
                    className={field}
                  />
                </label>
                <label className="flex min-w-0 flex-col gap-1">
                  <span className={`${label} flex min-h-8 items-end`}>kW máx.</span>
                  <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    title="Potencia máxima en kW"
                    aria-label="Potencia máxima en kW"
                    value={load.max_power_kw}
                    onChange={(e) => patchLoadAt(index, { max_power_kw: Number(e.target.value) })}
                    className={field}
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1">
                <span className={label}>Listo antes de</span>
                <input
                  type="datetime-local"
                  value={formatBerlinDateTimeLocal(new Date(load.deadline))}
                  onChange={(e) => patchLoadAt(index, { deadline: new Date(e.target.value).toISOString() })}
                  className={field}
                />
              </label>
              <label className="flex cursor-pointer items-start gap-2.5 rounded-md border border-transparent py-0.5">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 shrink-0 accent-accent"
                  checked={!!load.must_run}
                  onChange={(e) => patchLoadAt(index, { must_run: e.target.checked })}
                />
                <span className={`${label} leading-snug`}>Sin pausar cuando arranca</span>
              </label>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={addLoad}
        className="mt-3 text-sm text-accent-bright hover:text-[#a3acff]"
      >
        + Añadir otra carga
      </button>
      <label className="mt-1 flex flex-col gap-1 border-t border-hairline pt-3">
        <span className={label}>Objetivo global del plan</span>
        <select
          value={draft.preferences.objective}
          onChange={(e) =>
            patchPrefs({
              objective: e.target.value as ParsedIntent["preferences"]["objective"],
              renewable_weight:
                e.target.value === "balance_cost_renewables"
                  ? Math.max(draft.preferences.renewable_weight, 0.25)
                  : 0,
            })
          }
          className={field}
        >
          <option value="minimize_cost">Minimizar coste</option>
          <option value="balance_cost_renewables">Coste + renovables</option>
        </select>
        {draft.preferences.objective === "balance_cost_renewables" ? (
          <span className="mt-1 block text-xs text-ink-dimmed">
            Peso a renovables: {Math.round(draft.preferences.renewable_weight * 100)}%
          </span>
        ) : null}
      </label>
      {onSaveRemote ? (
        <button
          type="button"
          onClick={onSaveRemote}
          disabled={saving}
          className="mt-3 text-sm text-accent-bright hover:text-[#a3acff] disabled:opacity-50"
        >
          {saving ? "Guardando borrador…" : "Sincronizar borrador con el servidor"}
        </button>
      ) : null}
    </div>
  );
}
