"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type InputVariant = "text" | "number" | "datetime";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  suffix?: ReactNode;
  variant?: InputVariant;
  error?: string;
  type?: string;
}

const nativeType: Record<InputVariant, string> = {
  text: "text",
  number: "number",
  datetime: "datetime-local",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, suffix, variant = "text", error, type, id: externalId, className, ...props },
  ref,
) {
  const generatedId = useId();
  const id = externalId ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={id} className="text-[13px] text-ink-muted">
          {label}
        </label>
      ) : null}

      <div className="flex items-stretch gap-2">
        <input
          ref={ref}
          id={id}
          type={type ?? nativeType[variant]}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "h-10 min-w-0 flex-1 rounded-md border border-hairline bg-canvas px-3 text-sm text-ink",
            "placeholder:text-ink-dimmed",
            "focus:border-hairline-strong focus:outline-none focus:ring-1 focus:ring-accent/40",
            "disabled:cursor-not-allowed disabled:opacity-40",
            variant === "number" &&
              "tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            error && "border-peak focus:border-peak focus:ring-peak/30",
            className,
          )}
          {...props}
        />
        {suffix ? (
          <span className="inline-flex min-w-12 items-center justify-center rounded-md border border-hairline bg-surface-2 px-3 text-sm text-ink-muted">
            {suffix}
          </span>
        ) : null}
      </div>

      {error ? (
        <p id={`${id}-error`} className="type-caption text-peak" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});
