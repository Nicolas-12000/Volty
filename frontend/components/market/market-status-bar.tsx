"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import type { UsePricesReturn } from "@/hooks/use-prices";
import { useApiHealth } from "@/hooks/use-api-health";

export function MarketStatusBar({
  biddingZone,
  updatedAt,
  error,
  loading,
}: Pick<UsePricesReturn, "biddingZone" | "updatedAt" | "error" | "loading">) {
  const { status, database } = useApiHealth();

  const marketOk = !error && !loading;
  const dot = !marketOk ? "bg-peak" : status === "down" ? "bg-peak" : status === "degraded" ? "bg-hill" : "bg-valley-deep";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-hairline bg-surface-1 px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 type-caption text-ink-dimmed">
        <span className="flex items-center gap-2">
          <span className={cn("h-1.5 w-1.5 rounded-full", dot)} aria-hidden />
          {error
            ? "Mercado sin datos"
            : loading
              ? "Cargando precios…"
              : `Precios ${biddingZone}${updatedAt ? ` · ${updatedAt} Berlín` : ""}`}
        </span>
        {status !== "loading" ? (
          <span>
            API {status === "ok" ? "en línea" : status === "degraded" ? "degradada" : "caída"}
            {database !== null ? ` · BD ${database === "up" ? "OK" : "off"}` : ""}
          </span>
        ) : null}
      </div>
      <Link href="/analytics" className="type-body-sm font-medium text-accent hover:text-accent-dim">
        Analítica SMARD →
      </Link>
    </div>
  );
}
