import type { HistoryEntry } from "@/lib/client-store";
import { money } from "@/lib/format";

type HistoryTableProps = {
  entries: HistoryEntry[];
};

export function HistoryTable({ entries }: HistoryTableProps) {
  if (!entries.length) {
    return (
      <div className="rounded-lg border border-hairline bg-surface-2 p-8 text-center">
        <p className="type-heading text-ink">Sin historial todavía</p>
        <p className="mt-2 type-body-sm text-ink-muted">
          Las optimizaciones que calcules desde Cargas aparecerán aquí en este dispositivo.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-hairline bg-surface-2">
      <table className="w-full text-left">
        <thead className="border-b border-hairline bg-surface-1 type-label text-ink-dimmed">
          <tr>
            <th className="px-5 py-3">Cuándo</th>
            <th className="px-5 py-3">Cargas</th>
            <th className="px-5 py-3 text-right">Coste</th>
            <th className="px-5 py-3 text-right">Ahorro vs ASAP</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {entries.map((entry) => (
            <tr key={entry.id} className="hover:bg-surface-hover">
              <td className="px-5 py-3 type-body-sm tabular-nums text-ink-muted">
                {formatWhen(entry.createdAt)}
              </td>
              <td className="px-5 py-3 type-body-sm text-ink">{entry.loadNames.join(", ")}</td>
              <td className="px-5 py-3 text-right type-metric-sm text-ink">
                {money.format(entry.cost)}
              </td>
              <td className="px-5 py-3 text-right type-metric-sm text-valley-deep">
                {money.format(entry.savings)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: "Europe/Berlin",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}
