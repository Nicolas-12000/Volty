"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/providers/session-provider";
import { cn } from "@/lib/cn";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "V";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserMenu({ compact }: { compact?: boolean }) {
  const { user, logout, status } = useSession();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (status !== "authenticated" || !user) {
    return (
      <Link
        href="/entrar"
        className="type-body-sm rounded-md border border-hairline bg-surface-2 px-3 py-1.5 text-ink hover:bg-surface-hover"
      >
        Entrar
      </Link>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-md border border-hairline bg-surface-2 py-1.5 pl-1.5 pr-2.5 text-left transition-colors hover:bg-surface-hover",
          compact && "pr-2",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-subtle text-xs font-semibold text-accent"
          aria-hidden="true"
        >
          {initials(user.name)}
        </span>
        {!compact ? (
          <span className="min-w-0 max-w-32">
            <span className="block truncate type-body-sm font-medium text-ink">{user.name}</span>
            <span className="block truncate type-caption text-ink-dimmed">Volty · MATIAS</span>
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute bottom-full right-0 z-50 mb-2 w-56 rounded-lg border border-hairline bg-surface-1 p-1 shadow-lift min-[1025px]:bottom-auto min-[1025px]:top-full min-[1025px]:mb-0 min-[1025px]:mt-2"
        >
          <div className="border-b border-hairline px-3 py-2">
            <p className="type-body-sm font-medium text-ink">{user.name}</p>
            <p className="type-caption truncate text-ink-dimmed">{user.email}</p>
          </div>
          <Link
            href="/hogar"
            role="menuitem"
            className="type-body-sm flex w-full rounded-md px-3 py-2 text-left text-ink-muted hover:bg-surface-hover hover:text-ink"
            onClick={() => setOpen(false)}
          >
            Tu hogar
          </Link>
          <Link
            href="/hogar/ajustes"
            role="menuitem"
            className="type-body-sm flex w-full rounded-md px-3 py-2 text-left text-ink-muted hover:bg-surface-hover hover:text-ink"
            onClick={() => setOpen(false)}
          >
            Ajustes
          </Link>
          <button
            type="button"
            role="menuitem"
            className="type-body-sm mt-1 flex w-full rounded-md px-3 py-2 text-left text-ink-muted hover:bg-surface-hover hover:text-ink"
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            Cerrar sesión
          </button>
        </div>
      ) : null}
    </div>
  );
}
