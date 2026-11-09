import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

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

export function Card({ variant = "default", className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-hairline bg-surface-1 p-5",
        variant === "interactive" && "cursor-pointer transition-colors hover:bg-surface-2 hover:border-hairline-strong",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

const deltaColors: Record<string, string> = {
  positive: "text-leaf-bright",
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
      className={cn("flex flex-col gap-2 rounded-lg border border-hairline bg-surface-1 p-5", className)}
      {...props}
    >
      <span className="text-[13px] text-ink-muted">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="type-metric-lg tabular-nums text-ink">{value}</span>
        {delta ? (
          <span className={cn("type-caption tabular-nums", deltaColors[deltaType])}>{delta}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}
