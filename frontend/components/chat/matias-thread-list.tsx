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
    <aside className="flex max-h-[32rem] flex-col rounded-xl border border-hairline bg-surface-1 shadow-lift lg:max-h-none">
      <div className="flex items-center justify-between border-b border-hairline px-3 py-3">
        <p className="type-label text-ink-dimmed">Tus chats</p>
        <button
          type="button"
          onClick={onNew}
          className="type-caption rounded-md bg-accent-subtle px-2 py-1 text-accent hover:bg-accent/20"
        >
          Nuevo
        </button>
      </div>
      <ul className="flex-1 overflow-y-auto p-2">
        {loading ? <li className="type-caption p-2 text-ink-dimmed">Cargando…</li> : null}
        {!loading && threads.length === 0 ? (
          <li className="type-body-sm p-3 text-ink-muted">Sin chats. Crea uno para empezar.</li>
        ) : null}
        {threads.map((t) => (
          <li key={t.thread_id} className="group mb-1">
            <div className="flex items-stretch gap-1">
              <button
                type="button"
                onClick={() => onSelect(t.thread_id)}
                className={cn(
                  "type-body-sm flex-1 rounded-md px-3 py-2 text-left",
                  activeId === t.thread_id ? "bg-accent-subtle text-ink" : "text-ink-muted hover:bg-surface-2",
                )}
              >
                <span className="line-clamp-2">{t.title}</span>
                <span className="type-caption text-ink-dimmed">{t.message_count} mensajes</span>
              </button>
              <button
                type="button"
                title="Eliminar chat"
                onClick={() => onDelete(t.thread_id)}
                className="type-caption rounded-md px-2 text-ink-dimmed opacity-0 hover:text-peak group-hover:opacity-100"
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
