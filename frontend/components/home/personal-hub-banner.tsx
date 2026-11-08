"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchMeSummary, type MeSummary } from "@/lib/api";

export function PersonalHubBanner() {
  const [summary, setSummary] = useState<MeSummary | null>(null);

  useEffect(() => {
    void fetchMeSummary()
      .then(setSummary)
      .catch(() => setSummary(null));
  }, []);

  return (
    <Card className="border-accent/20 bg-accent-subtle/40">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="type-label text-accent">Tu hogar</p>
          <p className="type-body-sm mt-1 text-ink-muted">
            {summary
              ? `${summary.matias.thread_count} chats · ${summary.matias.threads_with_draft} con borrador`
              : "Sesión activa — chats y ajustes en el servidor"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/hogar">
            <Button type="button" variant="secondary" className="h-9 text-[0.8125rem]">
              Panel personal
            </Button>
          </Link>
          <Link href="/matias">
            <Button type="button" className="h-9 text-[0.8125rem]">
              MATIAS
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
