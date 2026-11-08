"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { getNavItems, pathIsActive, navHref } from "./nav";
import { useSession } from "@/providers/session-provider";

export function BottomNav() {
  const pathname = usePathname();
  const { status } = useSession();
  const signedIn = status === "authenticated";

  return (
    <nav
      className="fixed bottom-0 left-0 z-50 flex h-14 w-full border-t border-hairline bg-surface-1 min-[1025px]:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navegación principal"
    >
      {getNavItems(signedIn).map((item) => {
        const isActive = pathIsActive(pathname, item.href);
        const href = navHref(item.href, signedIn);
        return (
          <Link
            key={item.href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5",
              isActive ? "text-accent" : "text-ink-dimmed",
            )}
          >
            {item.icon}
            <span className="type-caption">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
