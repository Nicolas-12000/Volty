"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

interface SiteShellProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  showHeading?: boolean;
}

export function SiteShell({
  children,
  className,
  title,
  subtitle,
  actions,
  showHeading = true,
}: SiteShellProps) {
  return (
    <div className="min-h-dvh bg-canvas text-ink antialiased">
      <SiteHeader />
      <main className={cn("mx-auto max-w-295 px-5 pb-16 pt-8 md:pb-20 md:pt-10", className)}>
        {showHeading && title ? (
          <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="type-display-lg text-ink">{title}</h1>
              {subtitle ? <p className="mt-2 max-w-2xl text-[15px] text-ink-muted">{subtitle}</p> : null}
            </div>
            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>
        ) : null}
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

/** Compat: las páginas internas siguen importando AppShell. */
export function AppShell(props: SiteShellProps) {
  return <SiteShell {...props} />;
}
