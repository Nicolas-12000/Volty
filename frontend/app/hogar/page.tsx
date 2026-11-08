"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, MetricCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchMeSummary, type MeSummary } from "@/lib/api";
import { useLoads } from "@/hooks/use-loads";
import { useSession } from "@/providers/session-provider";

export default function HogarPage() {
  const { user } = useSession();
  const { loads } = useLoads();
  const [summary, setSummary] = useState<MeSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetchMeSummary()
      .then(setSummary)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "No se cargó tu hogar."));
  }, []);

  return (
    <AppShell
      title="Tu hogar"
      subtitle="Panel personal (JWT). Mercado público en / · analítica en /analytics."
      actions={
        <Link
          href="/hogar/ajustes"
          className="type-body-sm rounded-md border border-hairline bg-surface-2 px-3 py-1.5 text-ink hover:bg-surface-hover"
        >
          Ajustes
        </Link>
      }
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        {error ? <p className="type-body-sm text-peak">{error}</p> : null}
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Chats MATIAS" value={summary ? String(summary.matias.thread_count) : "…"} />
          <MetricCard
            label="Con borrador"
            value={summary ? String(summary.matias.threads_with_draft) : "…"}
          />
          <MetricCard label="Cargas en este dispositivo" value={String(loads.length)} />
        </div>

        {summary ? (
          <Card className="space-y-3">
            <p className="type-label text-ink-muted">Contexto del servidor (solo lectura)</p>
            <ul className="type-body-sm space-y-1 text-ink-muted">
              <li>Zona: {summary.server.bidding_zone}</li>
              <li>Huso: {summary.server.timezone}</li>
              <li>{summary.server.note}</li>
            </ul>
          </Card>
        ) : null}

        {summary && summary.matias.recent_threads.length > 0 ? (
          <Card>
            <p className="type-label mb-3 text-ink-muted">Chats recientes</p>
            <ul className="space-y-2">
              {summary.matias.recent_threads.map((t) => (
                <li key={t.thread_id}>
                  <Link
                    href="/matias"
                    className="type-body-sm block rounded-md px-2 py-1.5 text-ink hover:bg-surface-2"
                  >
                    {t.title}
                    {t.has_draft ? (
                      <span className="type-caption ml-2 text-accent">borrador</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Link href="/matias">
            <Button type="button">Abrir MATIAS</Button>
          </Link>
          <Link href="/loads">
            <Button type="button" variant="secondary">
              Cargas
            </Button>
          </Link>
          <Link href="/">
            <Button type="button" variant="ghost">
              Ver mercado (API)
            </Button>
          </Link>
        </div>

        {user ? (
          <p className="type-caption text-ink-dimmed">
            Sesión: {user.name} · {user.email}
          </p>
        ) : null}
      </div>
    </AppShell>
  );
}
