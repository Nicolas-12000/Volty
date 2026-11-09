"use client";

import { cn } from "@/lib/cn";
import type { LoadFormData } from "@/lib/client-store";
import type { ClientClock } from "@/lib/use-client-clock";
import { LoadCard } from "./load-card";

type LoadListProps = {
  loads: LoadFormData[];
  clock: ClientClock | null;
  activeIndex: number;
  onSelect: (index: number) => void;
  onUpdate: (index: number, data: Partial<LoadFormData>) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
  className?: string;
};

export function LoadList({ loads, activeIndex, onSelect, onRemove, onAdd, className }: LoadListProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", className)}>
      {loads.map((load, index) => (
        <LoadCard
          key={`${load.name}-${index}`}
          load={load}
          selected={index === activeIndex}
          onSelect={() => onSelect(index)}
          onRemove={() => onRemove(index)}
        />
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-hairline-strong bg-canvas p-5 text-ink-muted hover:border-accent hover:text-accent-bright"
      >
        <span className="text-[15px] font-semibold text-ink">Otra carga</span>
        <span className="text-xs">Añade coche, lavadora o termo.</span>
      </button>
    </div>
  );
}
