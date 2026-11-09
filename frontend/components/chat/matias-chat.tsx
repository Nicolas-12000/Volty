"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MatiasAvatar } from "@/components/chat/matias-avatar";
import { cn } from "@/lib/cn";
import {
  matiasChat,
  fetchMatiasThread,
  resetMatiasThread,
  patchMatiasDraft,
  listMatiasThreads,
  createMatiasThread,
  type MatiasChatResponse,
  type ParsedIntent,
  type ChatMessageDto,
  type MatiasThreadSummary,
} from "@/lib/api";
import { useLoads } from "@/hooks/use-loads";
import { useSession } from "@/providers/session-provider";
import { IntentDraftEditor } from "./intent-draft-editor";
import { MatiasThreadList } from "./matias-thread-list";
import { clearActiveThreadId, readActiveThreadId, writeActiveThreadId } from "@/lib/matias-thread";

export type ChatLine = ChatMessageDto & {
  intent?: ParsedIntent | null;
  actions?: MatiasChatResponse["actions"];
};

const STARTER: ChatLine = {
  role: "assistant",
  content:
    "Soy MATIAS. Lo que digas en este chat queda en memoria del hilo: puedes ir corrigiendo en varios mensajes antes de guardar en cargas.",
};

function toLines(messages: ChatMessageDto[]): ChatLine[] {
  if (!messages.length) return [STARTER];
  return messages.map((m) => ({ ...m }));
}

function bumpThreadList(
  threads: MatiasThreadSummary[],
  res: MatiasChatResponse,
): MatiasThreadSummary[] {
  const now = new Date().toISOString();
  const idx = threads.findIndex((t) => t.thread_id === res.thread_id);
  const hasDraft = !!(res.draft ?? res.intent);
  const next: MatiasThreadSummary = {
    thread_id: res.thread_id,
    title:
      idx >= 0
        ? threads[idx].title
        : (res.messages.find((m) => m.role === "user")?.content.slice(0, 56) ?? "Nueva conversación"),
    updated_at: now,
    message_count: res.messages.length,
    has_draft: hasDraft,
  };
  if (idx >= 0) {
    const copy = [...threads];
    copy[idx] = { ...copy[idx], ...next };
    copy.sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""));
    return copy;
  }
  return [next, ...threads];
}

export function MatiasChat({ className }: { className?: string }) {
  const router = useRouter();
  const { user, status } = useSession();
  const { applyIntent } = useLoads();
  const [threads, setThreads] = useState<MatiasThreadSummary[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [lines, setLines] = useState<ChatLine[]>([STARTER]);
  const [draft, setDraft] = useState<ParsedIntent | null>(null);
  const [draftSaving, setDraftSaving] = useState(false);
  const [draftInput, setDraftInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ backend?: string; rag?: boolean }>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  const email = user?.email?.toLowerCase();

  const refreshThreads = useCallback(async () => {
    if (!email) return;
    const list = await listMatiasThreads();
    setThreads(list);
  }, [email]);

  const openThread = useCallback(
    async (id: string) => {
      if (!email) return;
      setThreadId(id);
      writeActiveThreadId(email, id);
      try {
        const thread = await fetchMatiasThread(id);
        setLines(toLines(thread.messages));
        setDraft(thread.draft);
      } catch {
        setLines([STARTER]);
        setDraft(null);
      }
    },
    [email],
  );

  useEffect(() => {
    if (status !== "authenticated" || !email) return;
    let cancelled = false;
    (async () => {
      setThreadsLoading(true);
      try {
        await refreshThreads();
        const stored = readActiveThreadId(email);
        if (stored) {
          if (!cancelled) await openThread(stored);
        } else {
          const created = await createMatiasThread();
          if (!cancelled) {
            await refreshThreads();
            await openThread(created.thread_id);
          }
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "No pudimos cargar tus conversaciones.");
      } finally {
        if (!cancelled) setThreadsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, email, openThread, refreshThreads]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines, loading, draft]);

  async function send() {
    const text = draftInput.trim();
    if (!text || loading || !threadId) return;
    setError(null);
    setLines((prev) => [...prev, { role: "user", content: text }]);
    setDraftInput("");
    setLoading(true);
    try {
      const res = await matiasChat({ thread_id: threadId, message: text });
      if (email) writeActiveThreadId(email, res.thread_id);
      setThreadId(res.thread_id);
      setLines(toLines(res.messages));
      setDraft(res.draft ?? res.intent);
      setMeta({ backend: res.backend, rag: res.rag_used });
      setThreads((prev) => bumpThreadList(prev, res));
    } catch (err) {
      setError(err instanceof Error ? err.message : "MATIAS no respondió.");
    } finally {
      setLoading(false);
    }
  }

  async function nuevaConversacion() {
    if (!email) return;
    const created = await createMatiasThread();
    await refreshThreads();
    await openThread(created.thread_id);
    setMeta({});
  }

  async function eliminarChat(id: string) {
    if (!email) return;
    await resetMatiasThread(id);
    await refreshThreads();
    if (threadId === id) {
      clearActiveThreadId(email);
      const created = await createMatiasThread();
      await refreshThreads();
      await openThread(created.thread_id);
    }
  }

  async function syncDraft() {
    if (!threadId || !draft) return;
    setDraftSaving(true);
    try {
      await patchMatiasDraft(threadId, draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos guardar el borrador.");
    } finally {
      setDraftSaving(false);
    }
  }

  function applyDraft() {
    if (!draft) return;
    applyIntent(draft);
    router.push("/loads");
  }

  if (status !== "authenticated") {
    return (
      <div className="rounded-2xl border border-hairline bg-surface-1 p-5">
        <p className="text-sm text-ink-muted">
          MATIAS con memoria por hilo es de tu hogar. Entra para continuar conversaciones y guardar el borrador.
        </p>
        <a href="/entrar?next=/matias" className="mt-3 inline-flex text-sm font-medium text-accent-bright hover:text-[#a3acff]">
          Entrar →
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr_320px] lg:gap-6">
      <MatiasThreadList
        threads={threads}
        activeId={threadId}
        onSelect={(id) => void openThread(id)}
        onNew={() => void nuevaConversacion()}
        onDelete={(id) => void eliminarChat(id)}
        loading={threadsLoading}
      />

      <div className={cn("flex min-h-128 flex-col rounded-2xl border border-hairline bg-surface-1", className)}>
        <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-3">
          <MetaCaption backend={meta.backend} rag={meta.rag} />
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          {lines.map((line, i) => (
            <ChatBubble key={`${line.role}-${i}`} line={line} thinking={loading && i === lines.length - 1} />
          ))}
          {loading ? <p className="text-xs text-ink-dimmed">MATIAS escribe…</p> : null}
          {error ? <p className="text-sm text-peak">{error}</p> : null}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-hairline p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <textarea
              rows={2}
              value={draftInput}
              onChange={(e) => setDraftInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder="Ej.: mañana el coche 38 kwh para las 7"
              className="min-h-11 flex-1 resize-none rounded-md border border-hairline bg-canvas px-4 py-3 text-[15px] leading-normal text-ink placeholder:text-ink-dimmed focus:border-hairline-strong focus:outline-none"
            />
            <Button
              type="button"
              size="lg"
              className="w-full shrink-0 sm:w-auto"
              onClick={() => void send()}
              disabled={!draftInput.trim() || loading}
              loading={loading}
            >
              Enviar
            </Button>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        {draft ? (
          <>
            <IntentDraftEditor
              draft={draft}
              onChange={setDraft}
              onSaveRemote={() => void syncDraft()}
              saving={draftSaving}
            />
            <p className="text-xs text-ink-dimmed">
              El borrador se guarda en este hilo hasta que lo apliques o borres el chat.
            </p>
            <Button type="button" className="w-full" onClick={applyDraft}>
              Guardar en cargas
            </Button>
          </>
        ) : (
          <p className="rounded-lg border border-dashed border-hairline p-4 text-sm text-ink-muted">
            MATIAS irá completando el borrador con todo lo que digas en esta conversación.
          </p>
        )}
      </aside>
    </div>
  );
}

function MetaCaption({ backend, rag }: { backend?: string; rag?: boolean }) {
  return (
    <p className="text-xs text-ink-dimmed">
      Motor: {backend ?? "gemini/rules"} · memoria por hilo
      {rag ? " · RAG" : ""}
    </p>
  );
}

function ChatBubble({ line, thinking }: { line: ChatLine; thinking?: boolean }) {
  if (line.role === "user") {
    return (
      <div className="ml-auto max-w-[88%] rounded-xl rounded-br-sm border border-hairline-strong bg-surface-3 px-4 py-3 text-[15px]">
        <p className="whitespace-pre-wrap">{line.content}</p>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3">
      <MatiasAvatar size={36} thinking={thinking} />
      <div className="max-w-[88%] rounded-xl rounded-tl-sm border border-hairline bg-canvas px-4 py-3 text-[15px]">
        <p className="whitespace-pre-wrap">{line.content}</p>
      </div>
    </div>
  );
}
