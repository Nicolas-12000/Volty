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
      <Link href="/entrar" className="hidden px-3 py-2 text-sm font-medium text-ink-soft hover:text-white sm:block">
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
          "flex items-center gap-2 rounded-md border border-hairline bg-surface-1 py-1 pl-1 pr-2 text-left transition-colors hover:bg-surface-2",
          compact && "pr-1.5",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent-subtle text-[11px] font-semibold text-accent-bright"
          aria-hidden="true"
        >
          {initials(user.name)}
        </span>
        {!compact ? (
          <span className="min-w-0 max-w-32">
            <span className="block truncate text-[13px] font-medium text-ink">{user.name}</span>
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-hairline bg-surface-1 p-1"
        >
          <div className="border-b border-hairline px-3 py-2">
            <p className="text-sm font-medium text-ink">{user.name}</p>
            <p className="truncate text-xs text-ink-dimmed">{user.email}</p>
          </div>
          <Link
            href="/hogar"
            role="menuitem"
            className="flex w-full rounded-md px-3 py-2 text-left text-sm text-ink-muted hover:bg-surface-2 hover:text-ink"
            onClick={() => setOpen(false)}
          >
            Tu hogar
          </Link>
          <Link
            href="/loads"
            role="menuitem"
            className="flex w-full rounded-md px-3 py-2 text-left text-sm text-ink-muted hover:bg-surface-2 hover:text-ink"
            onClick={() => setOpen(false)}
          >
            Cargas
          </Link>
          <Link
            href="/plan"
            role="menuitem"
            className="flex w-full rounded-md px-3 py-2 text-left text-sm text-ink-muted hover:bg-surface-2 hover:text-ink"
            onClick={() => setOpen(false)}
          >
            Plan
          </Link>
          <Link
            href="/hogar/ajustes"
            role="menuitem"
            className="flex w-full rounded-md px-3 py-2 text-left text-sm text-ink-muted hover:bg-surface-2 hover:text-ink"
            onClick={() => setOpen(false)}
          >
            Ajustes
          </Link>
          <button
            type="button"
            role="menuitem"
            className="mt-1 flex w-full rounded-md px-3 py-2 text-left text-sm text-ink-muted hover:bg-surface-2 hover:text-ink"
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
