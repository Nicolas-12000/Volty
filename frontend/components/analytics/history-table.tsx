import type { HistoryEntry } from "@/lib/client-store";
import { money } from "@/lib/format";

type HistoryTableProps = {
  entries: HistoryEntry[];
};

export function HistoryTable({ entries }: HistoryTableProps) {
  if (!entries.length) {
    return (
      <div className="rounded-2xl border border-hairline bg-surface-1 p-8 text-center">
        <p className="text-[15px] font-semibold">Todavía no hay horarios guardados</p>
        <p className="mt-2 text-sm text-ink-muted">
          Cuando calcules un plan desde Cargas, aparecerá aquí en este dispositivo.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-hairline bg-surface-1">
      <table className="w-full min-w-xl text-left">
        <thead className="border-b border-hairline bg-canvas text-[11px] font-semibold uppercase tracking-wide text-ink-dimmed">
          <tr>
            <th className="px-5 py-3">Cuándo</th>
            <th className="px-5 py-3">Cargas</th>
            <th className="px-5 py-3 text-right">Coste</th>
            <th className="px-5 py-3 text-right">Ahorro vs ASAP</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {entries.map((entry) => (
            <tr key={entry.id} className="hover:bg-surface-2">
              <td className="px-5 py-3 text-sm tabular-nums text-ink-muted">{formatWhen(entry.createdAt)}</td>
              <td className="px-5 py-3 text-sm text-ink">{entry.loadNames.join(", ")}</td>
              <td className="px-5 py-3 text-right text-sm text-ink">{money.format(entry.cost)}</td>
              <td className="px-5 py-3 text-right text-sm text-leaf-bright">{money.format(entry.savings)}</td>
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
