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
  creating?: boolean;
};

function sortThreads(threads: MatiasThreadSummary[]): MatiasThreadSummary[] {
  return [...threads].sort((a, b) => {
    const aEmpty = a.message_count === 0 ? 1 : 0;
    const bEmpty = b.message_count === 0 ? 1 : 0;
    if (aEmpty !== bEmpty) return aEmpty - bEmpty;
    return (b.updated_at ?? "").localeCompare(a.updated_at ?? "");
  });
}

export function MatiasThreadList({
  threads,
  activeId,
  onSelect,
  onNew,
  onDelete,
  loading,
  creating,
}: MatiasThreadListProps) {
  const sorted = sortThreads(threads);
  const withMessages = sorted.filter((t) => t.message_count > 0);
  const empty = sorted.filter((t) => t.message_count === 0);

  return (
    <aside className="flex max-h-80 flex-col rounded-2xl border border-hairline bg-surface-1 lg:max-h-[calc(100dvh-8rem)]">
      <div className="flex items-center justify-between gap-2 border-b border-hairline px-3 py-3">
        <p className="text-[13px] font-medium text-ink">Chats</p>
        <button
          type="button"
          onClick={onNew}
          disabled={loading || creating}
          className={cn(
            "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
            loading || creating
              ? "cursor-not-allowed text-ink-dimmed"
              : "bg-accent text-white hover:bg-accent-bright",
          )}
        >
          {creating ? "Creando…" : "Nuevo"}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? <p className="px-2 py-3 text-xs text-ink-dimmed">Cargando…</p> : null}
        {!loading && threads.length === 0 ? (
          <p className="px-2 py-3 text-sm text-ink-muted">Sin chats. Pulsa Nuevo para empezar.</p>
        ) : null}

        {withMessages.length > 0 ? (
          <ul className="space-y-0.5">
            {withMessages.map((t) => (
              <ThreadRow
                key={t.thread_id}
                thread={t}
                active={activeId === t.thread_id}
                onSelect={onSelect}
                onDelete={onDelete}
              />
            ))}
          </ul>
        ) : null}

        {empty.length > 0 ? (
          <section className="mt-3 border-t border-hairline pt-2">
            <p className="mb-1 px-2 text-[11px] font-medium uppercase tracking-wide text-ink-dimmed">
              Sin mensajes ({empty.length})
            </p>
            <ul className="space-y-0.5">
              {empty.map((t) => (
                <ThreadRow
                  key={t.thread_id}
                  thread={t}
                  active={activeId === t.thread_id}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  dimmed
                />
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </aside>
  );
}

function ThreadRow({
  thread,
  active,
  onSelect,
  onDelete,
  dimmed,
}: {
  thread: MatiasThreadSummary;
  active: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  dimmed?: boolean;
}) {
  return (
    <li className="group">
      <div className="flex items-stretch gap-0.5">
        <button
          type="button"
          onClick={() => onSelect(thread.thread_id)}
          className={cn(
            "flex min-w-0 flex-1 items-start gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors",
            active
              ? "border-accent/40 bg-surface-2 text-ink"
              : "border-transparent text-ink-muted hover:border-hairline hover:bg-surface-2",
            dimmed && !active && "opacity-70",
          )}
        >
          <span
            className={cn(
              "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
              thread.has_draft ? "bg-accent" : "bg-transparent",
            )}
            aria-hidden
          />
          <span className="min-w-0 flex-1">
            <span className="line-clamp-2 text-[13px] leading-snug">{thread.title}</span>
            <span className="mt-0.5 block text-[11px] text-ink-dimmed">
              {thread.message_count} mensaje{thread.message_count === 1 ? "" : "s"}
              {thread.has_draft ? " · borrador" : ""}
            </span>
          </span>
        </button>
        <button
          type="button"
          title="Eliminar chat"
          onClick={() => onDelete(thread.thread_id)}
          className="shrink-0 self-center rounded-md px-2 py-2 text-sm text-ink-dimmed opacity-0 hover:bg-surface-3 hover:text-peak group-hover:opacity-100"
        >
          ×
        </button>
      </div>
    </li>
  );
}
