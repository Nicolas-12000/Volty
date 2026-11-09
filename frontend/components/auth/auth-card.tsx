"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { VoltyMark } from "@/components/brand/poodle";
import { Button } from "@/components/ui/button";
import { TextLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { normalizeAppPath } from "@/lib/redirect";
import { useSession } from "@/providers/session-provider";

export function AuthCard({
  mode,
}: {
  mode: "entrar" | "registro";
}) {
  const { login, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fallback = mode === "registro" ? "/loads" : "/hogar";
  const next = normalizeAppPath(searchParams.get("next") || fallback);

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
    if (status === "authenticated") router.replace(next);
  }, [status, router, next]);

  if (status === "authenticated") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-canvas">
        <p className="text-sm text-ink-muted">Ya tienes sesión…</p>
      </main>
    );
  }

  const isRegistro = mode === "registro";

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="mx-auto flex h-14 w-full max-w-[1180px] items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 text-[16px] font-semibold tracking-[-0.4px]">
          <VoltyMark size={28} clipId="vm-clip-auth" />
          Volty
        </Link>
        <TextLink href={isRegistro ? "/entrar" : "/registro"} className="text-ink-muted hover:text-ink">
          {isRegistro ? "Ya tengo cuenta" : "Crear mi plan"}
        </TextLink>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md rounded-2xl border border-hairline bg-surface-1 p-6 sm:p-8">
          <h1 className="type-display text-ink">{isRegistro ? "Crea tu plan" : "Entra en tu hogar"}</h1>
          <p className="mt-2 text-sm text-ink-muted">
            {isRegistro
              ? "Entra con tu cuenta para guardar cargas y que el optimizador arme el horario con precios reales."
              : "La sesión la valida el backend de Volty. MATIAS y el optimizador usan los mismos precios del mercado."}
          </p>

          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            <Input
              label="Correo"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error ? (
              <p className="text-sm text-peak" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" loading={pending}>
              {isRegistro ? "Crear mi plan" : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-xs text-ink-dimmed">
            Demo local: <span className="text-ink-muted">demo@volty.dev</span> · contraseña{" "}
            <span className="text-ink-muted">valle-0700</span>
          </p>
        </div>
      </main>
    </div>
  );
}
