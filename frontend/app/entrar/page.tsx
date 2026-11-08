"use client";

import { FormEvent, useEffect, useState } from "react";
import { normalizeAppPath } from "@/lib/redirect";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSession } from "@/providers/session-provider";

export default function EntrarPage() {
  const { login, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = normalizeAppPath(searchParams.get("next"));

  const [email, setEmail] = useState("demo@volty.dev");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(email.trim(), password);
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al entrar");
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(next);
    }
  }, [status, router, next]);

  if (status === "authenticated") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-canvas">
        <p className="type-body text-ink-muted">Ya tienes sesión…</p>
      </main>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-5 py-12">
      <div className="w-full max-w-md rounded-xl border border-hairline bg-surface-1 p-8 shadow-lift">
        <div className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-accent">
            <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="currentColor" />
          </svg>
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-ink lowercase">volty</span>
        </div>
        <h1 className="type-display mt-6 text-ink">Entra en tu hogar</h1>
        <p className="type-body-sm mt-2 text-ink-muted">
          La sesión la valida el backend de Volty. MATIAS y el optimizador usan los mismos precios del mercado.
        </p>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="type-label text-ink-dimmed">Correo</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-hairline bg-surface-2 px-3 py-2.5 type-body text-ink outline-none ring-accent focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="type-label text-ink-dimmed">Contraseña</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-hairline bg-surface-2 px-3 py-2.5 type-body text-ink outline-none ring-accent focus:ring-2"
            />
          </label>
          {error ? <p className="type-body-sm text-peak">{error}</p> : null}
          <Button type="submit" className="w-full" loading={pending}>
            Entrar
          </Button>
        </form>

        <p className="type-caption mt-6 text-ink-dimmed">
          Demo local: <span className="text-ink-muted">demo@volty.dev</span> · contraseña{" "}
          <span className="text-ink-muted">valle-0700</span>
        </p>
      </div>
    </div>
  );
}
