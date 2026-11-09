"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin", className)} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "icon" | "white";
export type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-accent-bright",
  secondary: "border border-hairline-strong bg-surface-1 text-ink hover:bg-surface-3",
  ghost: "bg-transparent text-ink-muted hover:bg-surface-2 hover:text-ink",
  danger: "bg-peak-subtle text-peak border border-peak/40 hover:brightness-110",
  icon: "border border-hairline bg-surface-1 text-ink-muted hover:bg-surface-3 hover:text-ink",
  white: "rounded-full bg-white text-black hover:bg-[#e8e9ea]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-9 px-3.5 text-sm",
  lg: "h-11 px-5 text-sm",
};

const iconSizeStyles: Record<ButtonSize, string> = {
  sm: "size-8",
  md: "size-9",
  lg: "size-11",
};

export function buttonClassName({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}) {
  const isIcon = variant === "icon";
  return cn(
    "type-button inline-flex cursor-pointer items-center justify-center gap-2 rounded-md font-medium transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
    "disabled:pointer-events-none disabled:opacity-40",
    variantStyles[variant],
    variant === "white" ? sizeStyles[size] : isIcon ? iconSizeStyles[size] : sizeStyles[size],
    fullWidth && "w-full",
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
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
      className={buttonClassName({ variant, size, fullWidth, className })}
      {...props}
    >
      {loading && <Spinner className={isIcon ? "" : "-ml-0.5"} />}
      {!loading || !isIcon ? children : null}
    </button>
  );
});
