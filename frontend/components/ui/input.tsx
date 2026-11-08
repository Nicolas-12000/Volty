"use client";

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

/* ─── Types ────────────────────────────────────────────────────────────────── */

type InputVariant = "text" | "number" | "datetime";

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Displayed above the input */
  label?: string;
  /** Suffix rendered inside the input (e.g. kWh, kW) */
  suffix?: ReactNode;
  /** Controls visual styling and native input type */
  variant?: InputVariant;
  /** Error message shown below the input */
  error?: string;
  /** Overrides the variant's native type, for example password. */
  type?: string;
}

/* ─── Variant → native type mapping ────────────────────────────────────────── */

const nativeType: Record<InputVariant, string> = {
  text: "text",
  number: "number",
  datetime: "datetime-local",
};

/* ─── Component ────────────────────────────────────────────────────────────── */

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    suffix,
    variant = "text",
    error,
    type,
    id: externalId,
    className,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const id = externalId ?? generatedId;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="type-body-sm text-ink-muted">
          {label}
        </label>
      )}

      <div className="flex items-stretch gap-2">
        <input
          ref={ref}
          id={id}
          type={type ?? nativeType[variant]}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "h-12 min-w-0 flex-1 rounded-md border border-hairline-strong bg-surface-3 px-4 text-ink type-body",
            "placeholder:text-ink-dimmed",
            "focus:border-focus-ring focus:ring-1 focus:ring-accent-subtle focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-40",
            variant === "number" &&
              "tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            error && "border-peak focus:border-peak focus:ring-peak-subtle",
            className,
          )}
          {...props}
        />

        {suffix ? (
          <span className="inline-flex min-w-14 items-center justify-center rounded-md border border-hairline-strong bg-surface-1 px-3 type-body-sm text-ink-muted">
            {suffix}
          </span>
        ) : null}
      </div>

      {error && (
        <p id={`${id}-error`} className="type-caption text-peak" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
