"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { getNavItems, pathIsActive, navHref } from "./nav";
import { UserMenu } from "./user-menu";
import { useSession } from "@/providers/session-provider";

export function Sidebar() {
  const pathname = usePathname();
  const { status } = useSession();
  const signedIn = status === "authenticated";

  return (
    <aside
      className="fixed left-0 top-0 hidden h-screen w-58 flex-col border-r border-hairline bg-surface-1 shadow-lift min-[1025px]:flex"
      aria-label="Navegación principal"
    >
      <div className="flex h-14 items-center gap-2 px-5">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-accent">
          <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="currentColor" />
        </svg>
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-ink lowercase">volty</span>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
        {getNavItems(signedIn).map((item) => {
          const isActive = pathIsActive(pathname, item.href);
          const href = navHref(item.href, signedIn);
          return (
            <Link
              key={item.href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 type-body transition-colors",
                isActive
                  ? "bg-accent-subtle text-ink"
                  : "text-ink-muted hover:bg-surface-hover hover:text-ink",
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-4 px-4 pb-6">
        <UserMenu />
        <div className="flex items-center gap-2 px-1">
          <span className="h-1.5 w-1.5 rounded-full bg-valley-deep" aria-hidden="true" />
          <span className="type-caption text-ink-dimmed">Precios al día</span>
        </div>
      </div>
    </aside>
  );
}
