"use client";

import type { ParsedIntent } from "@/lib/api";
import { formatBerlinDateTimeLocal } from "@/lib/format";

type IntentDraftEditorProps = {
  draft: ParsedIntent;
  onChange: (next: ParsedIntent) => void;
  onSaveRemote?: () => void;
  saving?: boolean;
};

export function IntentDraftEditor({ draft, onChange, onSaveRemote, saving }: IntentDraftEditorProps) {
  const load = draft.loads[0];
  if (!load) return null;

  const patchLoad = (patch: Partial<typeof load>) => {
    onChange({
      ...draft,
      loads: [{ ...load, ...patch }],
    });
  };

  const patchPrefs = (patch: Partial<ParsedIntent["preferences"]>) => {
    onChange({
      ...draft,
      preferences: { ...draft.preferences, ...patch },
    });
  };

  const deadlineLocal = formatBerlinDateTimeLocal(new Date(load.deadline));
  const field =
    "mt-1 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink focus:border-hairline-strong focus:outline-none";

  return (
    <div className="rounded-2xl border border-hairline bg-surface-1 p-4">
      <p className="text-[13px] text-ink-muted">Borrador editable</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs text-ink-muted">Nombre</span>
          <input value={load.name} onChange={(e) => patchLoad({ name: e.target.value })} className={field} />
        </label>
        <label>
          <span className="text-xs text-ink-muted">Energía (kWh)</span>
          <input
            type="number"
            min={0.1}
            step={0.1}
            value={load.energy_kwh}
            onChange={(e) => patchLoad({ energy_kwh: Number(e.target.value) })}
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
            onChange={(e) => patchLoad({ max_power_kw: Number(e.target.value) })}
            className={field}
          />
        </label>
        <label className="sm:col-span-2">
          <span className="text-xs text-ink-muted">Listo antes de</span>
          <input
            type="datetime-local"
            value={deadlineLocal}
            onChange={(e) => patchLoad({ deadline: new Date(e.target.value).toISOString() })}
            className={field}
          />
        </label>
        <label className="sm:col-span-2">
          <span className="text-xs text-ink-muted">Objetivo</span>
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
        </label>
      </div>
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
