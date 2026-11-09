import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "accent";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
  children: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "border-[#27a644]/40 text-leaf-bright",
  warning: "border-hill/40 text-hill",
  danger: "border-peak/40 text-peak",
  neutral: "border-hairline text-ink-soft",
  accent: "border-accent/40 text-accent-bright",
};

const dotColors: Record<BadgeVariant, string> = {
  success: "bg-leaf",
  warning: "bg-hill",
  danger: "bg-peak",
  neutral: "bg-ink-muted",
  accent: "bg-accent-bright",
};

export function Badge({ variant = "neutral", dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "chip whitespace-nowrap",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {dot ? <span className={cn("size-1.5 shrink-0 rounded-full", dotColors[variant])} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
