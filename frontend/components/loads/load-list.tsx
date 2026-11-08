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

export function LoadList({
  loads,
  activeIndex,
  onSelect,
  onRemove,
  onAdd,
  className,
}: LoadListProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
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
        className={cn(
          "flex min-h-35 flex-col items-center justify-center gap-3 rounded-lg p-6",
          "border-2 border-dashed border-hairline-strong bg-surface-2/50 text-ink-muted shadow-lift",
          "hover:border-accent hover:text-accent",
        )}
      >
        <span className="type-heading text-ink">Otra carga</span>
        <span className="type-body-sm">Se abre el mismo formulario, vacío de nombre nuevo.</span>
      </button>
    </div>
  );
}
