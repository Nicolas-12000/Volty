"use client";

import { useEffect, useCallback, useRef, type ReactNode, type MouseEvent } from "react";
import { cn } from "@/lib/cn";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const contentRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (open && contentRef.current) contentRef.current.focus();
  }, [open]);

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!open) return null;

  return (
    <div
      className="scrim fixed inset-0 z-50 animate-fade-in"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-label={title ?? "Dialog"}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        className={cn(
          "flex flex-col border border-hairline bg-surface-1 outline-none",
          "fixed inset-x-0 bottom-0 max-h-[80dvh] rounded-t-xl animate-slide-up",
          "lg:fixed lg:top-1/2 lg:left-1/2 lg:mx-auto lg:my-auto lg:max-h-none lg:w-full lg:max-w-lg lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-2xl lg:animate-fade-in",
        )}
      >
        <div className="flex justify-center pt-3 pb-1 lg:hidden" aria-hidden="true">
          <div className="h-1 w-9 rounded-pill bg-ink-dimmed" />
        </div>
        {title ? (
          <div className="flex items-center justify-between px-5 py-3">
            <h2 className="text-[15px] font-semibold tracking-[-0.2px]">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="flex size-9 items-center justify-center rounded-md text-ink-muted hover:bg-surface-2 hover:text-ink"
            >
              ×
            </button>
          </div>
        ) : null}
        <div className="flex-1 overflow-y-auto px-5 pb-5">{children}</div>
      </div>
    </div>
  );
}
