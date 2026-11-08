import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ─── Types ────────────────────────────────────────────────────────────────── */

type CardVariant = "default" | "metric" | "interactive";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: ReactNode;
}

interface MetricCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  delta?: string;
  deltaType?: "positive" | "negative" | "neutral";
  children?: ReactNode;
}

/* ─── Variant styles ───────────────────────────────────────────────────────── */

const variantStyles: Record<CardVariant, string> = {
  default: "",
  metric: "",
  interactive:
    "hover:bg-surface-3 hover:border-hairline-strong cursor-pointer transition-colors",
};

/* ─── Card ─────────────────────────────────────────────────────────────────── */

export function Card({
  variant = "default",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface-2 border border-hairline rounded-lg p-6 shadow-lift sm:p-7",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─── MetricCard ───────────────────────────────────────────────────────────── */

const deltaColors: Record<string, string> = {
  positive: "text-valley-deep",
  negative: "text-peak",
  neutral: "text-ink-muted",
};

export function MetricCard({
  label,
  value,
  delta,
  deltaType = "neutral",
  className,
  children,
  ...props
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "bg-surface-2 border border-hairline rounded-lg p-6 shadow-lift flex flex-col gap-3 sm:p-7",
        className,
      )}
      {...props}
    >
      <span className="type-label text-ink-muted">{label}</span>

      <div className="flex items-baseline gap-2">
        <span className="type-metric-lg tabular-nums text-ink">{value}</span>
        {delta && (
          <span className={cn("type-caption tabular-nums", deltaColors[deltaType])}>
            {delta}
          </span>
        )}
      </div>

      {children}
    </div>
  );
}
