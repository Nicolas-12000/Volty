"use client";

import { useEffect, useState } from "react";
import { fetchHealth } from "@/lib/api";

export function useApiHealth() {
  const [status, setStatus] = useState<"loading" | "ok" | "degraded" | "down">("loading");
  const [database, setDatabase] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchHealth()
      .then((h) => {
        if (cancelled) return;
        setStatus(h.status === "ok" ? "ok" : "degraded");
        setDatabase(h.database === "up" ? "up" : "down");
      })
      .catch(() => {
        if (!cancelled) setStatus("down");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { status, database };
}
