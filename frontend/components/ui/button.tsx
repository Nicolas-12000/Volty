"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ─── Spinner ──────────────────────────────────────────────────────────────── */

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2"
      />
      <path
        d="M14 8a6 6 0 0 0-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── Types ────────────────────────────────────────────────────────────────── */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "icon";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  children?: ReactNode;
}

/* ─── Variant styles ───────────────────────────────────────────────────────── */

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white rounded-pill px-6 hover:bg-accent-dim active:scale-[0.97] transition-all",
  secondary:
    "bg-surface-2 text-ink border border-hairline-strong rounded-md px-5 hover:bg-surface-3 transition-colors",
  ghost:
    "bg-transparent text-ink-muted rounded-md px-4 hover:bg-surface-hover hover:text-ink transition-colors",
  danger:
    "bg-peak-subtle text-peak border border-peak rounded-md px-5 hover:brightness-110 transition-colors",
  icon: "bg-surface-2 text-ink-muted rounded-md border border-hairline hover:bg-surface-3 hover:text-ink transition-colors",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 text-[0.8125rem]",
  md: "h-12",
  lg: "h-14 text-[0.9375rem] px-8",
};

const iconSizeStyles: Record<ButtonSize, string> = {
  sm: "w-9 h-9",
  md: "w-11 h-11",
  lg: "w-13 h-13",
};

/* ─── Component ────────────────────────────────────────────────────────────── */

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const isIcon = variant === "icon";
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        className={cn(
          "type-button inline-flex cursor-pointer items-center justify-center gap-2",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
          "disabled:pointer-events-none disabled:opacity-40",
          variantStyles[variant],
          isIcon ? iconSizeStyles[size] : sizeStyles[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {loading && <Spinner className={isIcon ? "" : "-ml-1"} />}
        {!loading || !isIcon ? children : null}
      </button>
    );
  },
);
