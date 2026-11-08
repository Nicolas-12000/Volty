"use client";

import {
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
  type MouseEvent,
} from "react";
import { cn } from "@/lib/cn";

/* ─── Types ────────────────────────────────────────────────────────────────── */

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/* ─── Component ────────────────────────────────────────────────────────────── */

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  /* ── Close on Escape ─────────────────────────────────────────────────────── */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  /* ── Focus trap — move focus into the sheet when it opens ─────────────── */
  useEffect(() => {
    if (open && contentRef.current) {
      contentRef.current.focus();
    }
  }, [open]);

  /* ── Close on backdrop click ─────────────────────────────────────────────── */
  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 scrim animate-fade-in"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-label={title ?? "Dialog"}
    >
      {/* ── Mobile: bottom sheet ──────────────────────────────────────────── */}
      <div
        ref={contentRef}
        tabIndex={-1}
        className={cn(
          /* shared */
          "bg-surface-2 border border-hairline outline-none flex flex-col",
          /* mobile: bottom sheet */
          "fixed inset-x-0 bottom-0 max-h-[80dvh] rounded-t-xl animate-slide-up",
          /* desktop: centered modal */
          "lg:static lg:inset-auto lg:mx-auto lg:my-auto lg:max-w-lg lg:w-full lg:rounded-lg lg:animate-fade-in",
          "lg:fixed lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2",
        )}
      >
        {/* ── Drag handle (mobile only) ───────────────────────────────────── */}
        <div className="flex justify-center pt-3 pb-1 lg:hidden" aria-hidden="true">
          <div className="h-1 w-9 rounded-pill bg-ink-dimmed" />
        </div>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        {title && (
          <div className="flex items-center justify-between px-5 py-3">
            <h2 className="type-heading text-ink">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="flex h-9 w-9 items-center justify-center rounded-md text-ink-muted hover:bg-surface-hover hover:text-ink transition-colors cursor-pointer"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        )}

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">{children}</div>
      </div>
    </div>
  );
}
