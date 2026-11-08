"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { loginHref } from "@/lib/access";
import { useSession } from "@/providers/session-provider";

const STEPS = [
  { n: "1", title: "Mercado", href: "/", cta: "Ver precios", personal: false },
  { n: "2", title: "Hogar", href: "/hogar", cta: "Tu panel", personal: true },
  { n: "3", title: "Cargas", href: "/loads", cta: "Configurar", personal: true },
  { n: "4", title: "Plan", href: "/plan", cta: "Horario", personal: true },
] as const;

export function FlowStrip({ onHome = false }: { onHome?: boolean }) {
  const { status } = useSession();
  const signedIn = status === "authenticated";

  return (
    <div className="rounded-xl border border-hairline bg-surface-1 p-5 shadow-lift sm:p-6">
      <p className="type-label text-ink-dimmed">Ruta completa</p>
      <p className="type-body-sm mt-1 text-ink-muted">
        Mercado y analítica son públicos. Hogar, MATIAS, cargas y plan requieren sesión.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => {
          const isHere = onHome && step.n === "1";
          const href = step.personal && !signedIn ? loginHref(step.href) : step.href;
          return (
            <div key={step.n} className="flex flex-col gap-3 rounded-lg bg-surface-2 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="type-label text-accent">{step.n}</span>
                {isHere ? (
                  <span className="type-caption rounded-md bg-accent-subtle px-2 py-0.5 text-accent">
                    Estás aquí
                  </span>
                ) : step.personal && !signedIn ? (
                  <span className="type-caption rounded-md bg-surface-3 px-2 py-0.5 text-ink-dimmed">
                    Sesión
                  </span>
                ) : null}
              </div>
              <p className="type-heading text-ink">{step.title}</p>
              {isHere ? (
                <span className="type-body-sm mt-auto text-ink-muted">Precios arriba</span>
              ) : (
                <Link
                  href={href}
                  className={cn(
                    "type-button mt-auto inline-flex h-9 items-center rounded-md border border-hairline-strong",
                    "bg-surface-2 px-4 text-[0.8125rem] text-ink transition-colors hover:bg-surface-3",
                  )}
                >
                  {step.personal && !signedIn ? "Entrar" : step.cta}
                </Link>
              )}
            </div>
          );
        })}
      </div>
      {signedIn ? (
        <p className="type-caption mt-4 text-ink-dimmed">
          <Link href="/matias" className="text-accent hover:underline">
            MATIAS
          </Link>{" "}
          vive en el menú — chat con memoria en el servidor.
        </p>
      ) : null}
    </div>
  );
}
