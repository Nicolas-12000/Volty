"use client";

import { ButtonLink } from "@/components/ui/button-link";
import { useSession } from "@/providers/session-provider";

export function Hero() {
  const { status } = useSession();
  const signedIn = status === "authenticated";

  return (
    <section className="mx-auto max-w-[1180px] px-5 pb-8 pt-10 md:pb-10 md:pt-16">
      <h1 className="type-hero max-w-[960px]">
        Precios reales para decidir cuándo consumir.{" "}
        <span className="text-ink-dimmed">
          Dile a MATIAS qué necesitas y planifica tu hogar en los valles del mercado.
        </span>
      </h1>
      <div className="mt-6 flex flex-wrap gap-2.5 md:mt-8">
        {signedIn ? (
          <>
            <ButtonLink href="/loads" variant="primary">
              Ir a cargas
            </ButtonLink>
            <ButtonLink href="/matias" variant="secondary">
              Hablar con MATIAS
            </ButtonLink>
          </>
        ) : (
          <>
            <ButtonLink href="/registro" variant="primary">
              Crear mi plan
            </ButtonLink>
            <ButtonLink href="#matias" variant="secondary">
              Conocer a MATIAS
            </ButtonLink>
          </>
        )}
      </div>
    </section>
  );
}
