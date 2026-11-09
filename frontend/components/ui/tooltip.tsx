import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Tooltip({ content, children, className }: TooltipProps) {
  return (
    <span className={cn("group/tip relative inline-flex w-full", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-30",
          "w-max max-w-55 -translate-x-1/2 rounded-md border border-hairline-strong",
          "bg-surface-3 px-2.5 py-1.5 text-xs text-ink",
          "opacity-0 transition-opacity duration-150",
          "group-hover/tip:opacity-100 group-focus-within/tip:opacity-100",
        )}
      >
        {content}
      </span>
    </span>
  );
}
