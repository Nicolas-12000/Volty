"use client";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Hero } from "@/components/home/hero";
import { Dashboard } from "@/components/home/dashboard";
import { ChatDemo } from "@/components/home/chat-demo";
import { HowItWorks } from "@/components/home/how-it-works";
import { Matias } from "@/components/brand/poodle";
import { useSession } from "@/providers/session-provider";

export function HomePage() {
  const { status } = useSession();
  const signedIn = status === "authenticated";

  return (
    <div className="min-h-dvh bg-canvas text-ink antialiased">
      <SiteHeader />
      <main>
        <Hero />
        <section className="mx-auto max-w-295 px-5">
          <Dashboard />
          <p className="mt-4 text-xs text-ink-dimmed">
            {signedIn
              ? "Tus cargas y planes quedan en este dispositivo y en tu sesión."
              : "Sin cuenta ves el mercado público. Con cuenta, cargas y planes quedan guardados."}
          </p>
        </section>
        <section
          id="matias"
          className="mx-auto grid max-w-295 items-start gap-8 px-5 py-16 md:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-12"
        >
          <div>
            <div className="mb-5 inline-flex rounded-2xl border border-hairline bg-surface-1 p-2.5">
              <Matias size={64} />
            </div>
            <h2 className="type-display-xl">Háblale a MATIAS como hablarías con una persona.</h2>
            <p className="mt-4 max-w-110 text-[17px] leading-relaxed text-ink-muted">
              MATIAS entiende tu mensaje y lo convierte en condiciones claras. El horario final lo calcula el
              optimizador con precios reales, así que siempre puedes comprobarlo.
            </p>
          </div>
          <ChatDemo />
        </section>
        <HowItWorks />
      </main>
      <SiteFooter />
    </div>
  );
}
