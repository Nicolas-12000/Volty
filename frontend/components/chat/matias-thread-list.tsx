"use client";

import { cn } from "@/lib/cn";
import type { MatiasThreadSummary } from "@/lib/api";

type MatiasThreadListProps = {
  threads: MatiasThreadSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  loading?: boolean;
};

export function MatiasThreadList({
  threads,
  activeId,
  onSelect,
  onNew,
  onDelete,
  loading,
}: MatiasThreadListProps) {
  return (
    <aside className="flex max-h-[20rem] flex-col rounded-2xl border border-hairline bg-surface-1 lg:max-h-none">
      <div className="flex items-center justify-between border-b border-hairline px-3 py-3">
        <p className="text-[13px] text-ink-muted">Tus chats</p>
        <button
          type="button"
          onClick={onNew}
          className="rounded-md px-2 py-1 text-xs font-medium text-accent-bright hover:bg-surface-2"
        >
          Nuevo
        </button>
      </div>
      <ul className="flex-1 overflow-y-auto p-2">
        {loading ? <li className="p-2 text-xs text-ink-dimmed">Cargando…</li> : null}
        {!loading && threads.length === 0 ? (
          <li className="p-3 text-sm text-ink-muted">Sin chats. Crea uno para empezar.</li>
        ) : null}
        {threads.map((t) => (
          <li key={t.thread_id} className="group mb-1">
            <div className="flex items-stretch gap-1">
              <button
                type="button"
                onClick={() => onSelect(t.thread_id)}
                className={cn(
                  "flex-1 rounded-md px-3 py-2 text-left text-sm",
                  activeId === t.thread_id ? "bg-surface-2 text-ink" : "text-ink-muted hover:bg-surface-2",
                )}
              >
                <span className="line-clamp-2">{t.title}</span>
                <span className="text-xs text-ink-dimmed">{t.message_count} mensajes</span>
              </button>
              <button
                type="button"
                title="Eliminar chat"
                onClick={() => onDelete(t.thread_id)}
                className="rounded-md px-2 text-ink-dimmed opacity-0 hover:text-peak group-hover:opacity-100"
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
