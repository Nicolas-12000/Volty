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

  const field =
    "mt-1 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink focus:border-hairline-strong focus:outline-none";

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
    <div className="rounded-2xl border border-hairline bg-surface-1 p-4">
      <p className="text-[13px] text-ink-muted">
        Borrador editable · {loads.length} {loads.length === 1 ? "carga" : "cargas"}
      </p>
      <ul className="mt-3 space-y-4">
        {loads.map((load, index) => (
          <li
            key={`${load.id ?? load.name}-${index}`}
            className="rounded-xl border border-hairline bg-canvas/40 p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
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
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-xs text-ink-muted">Nombre</span>
                <input
                  value={load.name}
                  onChange={(e) => patchLoadAt(index, { name: e.target.value })}
                  className={field}
                />
              </label>
              <label>
                <span className="text-xs text-ink-muted">Energía (kWh)</span>
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={load.energy_kwh}
                  onChange={(e) => patchLoadAt(index, { energy_kwh: Number(e.target.value) })}
                  className={field}
                />
              </label>
              <label>
                <span className="text-xs text-ink-muted">Potencia máx. (kW)</span>
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={load.max_power_kw}
                  onChange={(e) => patchLoadAt(index, { max_power_kw: Number(e.target.value) })}
                  className={field}
                />
              </label>
              <label className="sm:col-span-2">
                <span className="text-xs text-ink-muted">Listo antes de</span>
                <input
                  type="datetime-local"
                  value={formatBerlinDateTimeLocal(new Date(load.deadline))}
                  onChange={(e) => patchLoadAt(index, { deadline: new Date(e.target.value).toISOString() })}
                  className={field}
                />
              </label>
              <label className="flex items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={!!load.must_run}
                  onChange={(e) => patchLoadAt(index, { must_run: e.target.checked })}
                />
                <span className="text-xs text-ink-muted">No se puede pausar una vez arranca</span>
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
      <label className="mt-4 block">
        <span className="text-xs text-ink-muted">Objetivo global del plan</span>
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
