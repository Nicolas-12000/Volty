"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, MetricCard } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button-link";
import { Matias } from "@/components/brand/poodle";
import { fetchMeSummary, type MeSummary } from "@/lib/api";
import { useLoads } from "@/hooks/use-loads";
import { useSession } from "@/providers/session-provider";

export default function HogarPage() {
  const { user, status } = useSession();
  const { loads } = useLoads();
  const [summary, setSummary] = useState<MeSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;
    setError("");
    void fetchMeSummary()
      .then(setSummary)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "No pudimos cargar tu hogar."));
  }, [status]);

  return (
    <AppShell
      title="Tu hogar"
      subtitle="Cargas, chats de MATIAS y el contexto del mercado DE-LU que usa el optimizador."
      actions={
        <ButtonLink href="/hogar/ajustes" variant="secondary" size="sm">
          Ajustes
        </ButtonLink>
      }
    >
      <div className="flex flex-col gap-6">
        {error ? <p className="text-sm text-peak">{error}</p> : null}

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Chats MATIAS" value={summary ? String(summary.matias.thread_count) : "…"} />
          <MetricCard label="Con borrador" value={summary ? String(summary.matias.threads_with_draft) : "…"} />
          <MetricCard label="Cargas en este dispositivo" value={String(loads.length)} />
        </div>

        {summary ? (
          <Card className="space-y-2">
            <p className="text-[13px] text-ink-muted">Contexto del servidor</p>
            <ul className="space-y-1 text-sm text-ink-muted">
              <li>Zona: {summary.server.bidding_zone}</li>
              <li>Huso: {summary.server.timezone}</li>
              <li>{summary.server.note}</li>
            </ul>
          </Card>
        ) : null}

        {summary && summary.matias.recent_threads.length > 0 ? (
          <Card>
            <p className="mb-3 text-[13px] text-ink-muted">Chats recientes</p>
            <ul className="space-y-1">
              {summary.matias.recent_threads.map((t) => (
                <li key={t.thread_id}>
                  <Link
                    href="/matias"
                    className="block rounded-md px-2 py-2 text-sm text-ink hover:bg-surface-2"
                  >
                    {t.title}
                    {t.has_draft ? <span className="ml-2 text-xs text-accent-bright">borrador</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <ButtonLink href="/matias" className="gap-2">
            <Matias size={22} />
            Abrir MATIAS
          </ButtonLink>
          <ButtonLink href="/loads" variant="secondary">
            Cargas
          </ButtonLink>
          <ButtonLink href="/" variant="ghost">
            Ver mercado
          </ButtonLink>
        </div>

        {user ? (
          <p className="text-xs text-ink-dimmed">
            Sesión: {user.name} · {user.email}
          </p>
        ) : null}
      </div>
    </AppShell>
  );
}
