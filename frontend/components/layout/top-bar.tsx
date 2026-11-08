import type { ReactNode } from "react";

interface TopBarProps {
  title: string;
  children?: ReactNode;
}

export function TopBar({ title, children }: TopBarProps) {
  return (
    <header
      className="flex h-14 items-center justify-between px-4 bg-canvas min-[1025px]:hidden"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <h1 className="type-heading text-ink">{title}</h1>
      {children && (
        <div className="flex items-center gap-2" aria-label="Acciones">
          {children}
        </div>
      )}
    </header>
  );
}
