import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ─── Types ────────────────────────────────────────────────────────────────── */

type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "accent";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /** Show a small coloured dot indicator before the label */
  dot?: boolean;
  children: ReactNode;
}

/* ─── Variant styles ───────────────────────────────────────────────────────── */

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-valley-deep-subtle text-valley-deep",
  warning: "bg-hill-subtle text-hill",
  danger: "bg-peak-subtle text-peak",
  neutral: "bg-hairline text-ink-muted",
  accent: "bg-accent-subtle text-accent",
};

const dotColors: Record<BadgeVariant, string> = {
  success: "bg-valley-deep",
  warning: "bg-hill",
  danger: "bg-peak",
  neutral: "bg-ink-muted",
  accent: "bg-accent",
};

/* ─── Component ────────────────────────────────────────────────────────────── */

export function Badge({
  variant = "neutral",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 type-caption whitespace-nowrap",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
