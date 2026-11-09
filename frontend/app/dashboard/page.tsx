"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Compat: antes el inicio vivía en /dashboard; ahora es solo /. */
export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-canvas">
      <p className="text-sm text-ink-muted">Abriendo inicio…</p>
    </main>
  );
}
