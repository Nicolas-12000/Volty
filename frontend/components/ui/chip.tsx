"use client";

import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ─── Types ────────────────────────────────────────────────────────────────── */

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: ReactNode;
}

/* ─── Component ────────────────────────────────────────────────────────────── */

export function Chip({
  active = false,
  className,
  children,
  ...props
}: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded-pill border h-9 px-4 type-button-sm whitespace-nowrap",
        "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
        active
          ? "bg-accent-subtle text-accent border-accent"
          : "bg-transparent text-ink-muted border-hairline-strong hover:bg-surface-hover hover:text-ink",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
