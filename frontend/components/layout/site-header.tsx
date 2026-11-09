"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { VoltyMark } from "@/components/brand/poodle";
import { UserMenu } from "@/components/layout/user-menu";
import { getNavItems, navHref, pathIsActive } from "@/lib/navigation";
import { useSession } from "@/providers/session-provider";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/cn";

export function SiteHeader() {
  const pathname = usePathname();
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const links = getNavItems(signedIn);
  const [open, setOpen] = useState(false);
  const planHref = signedIn ? "/loads" : "/registro";
  const planLabel = signedIn ? "Tus cargas" : "Crear mi plan";

  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-canvas/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1180px] items-center gap-3 px-5 md:gap-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-[16px] font-semibold tracking-[-0.4px]">
          <VoltyMark size={28} clipId="vm-clip-header" />
          Volty
        </Link>

        <nav className="hidden flex-1 items-center gap-0.5 md:flex" aria-label="Principal">
          {links.map((item) => {
            const href = navHref(item.href, signedIn);
            const active = pathIsActive(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={href}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-surface-2 hover:text-ink",
                  active ? "bg-surface-2 text-ink" : "text-ink-muted",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <UserMenu compact />
          <ButtonLink
            href={planHref}
            variant="white"
            size="sm"
            className="hidden min-[420px]:inline-flex"
          >
            {planLabel}
          </ButtonLink>
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-md text-ink-muted hover:bg-surface-2 hover:text-ink md:hidden"
            aria-expanded={open}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              {open ? (
                <path d="M4 4l10 10M14 4 4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              ) : (
                <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-hairline bg-canvas px-5 py-2 md:hidden">
          <nav className="flex flex-col gap-0.5" aria-label="Móvil">
            {links.map((item) => {
              const href = navHref(item.href, signedIn);
              const active = pathIsActive(pathname, item.href);
              return (
                <Link
                  key={item.label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-sm font-medium",
                    active ? "bg-surface-2 text-ink" : "text-ink-muted",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            {!signedIn ? (
              <Link
                href="/entrar"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-ink-soft"
              >
                Entrar
              </Link>
            ) : null}
            <Link
              href={planHref}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-ink min-[420px]:hidden"
            >
              {planLabel}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
