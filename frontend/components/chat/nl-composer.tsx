"use client";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

type NlComposerProps = {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  loading?: boolean;
  className?: string;
};

export function NlComposer({ value, onChange, onSubmit, loading = false, className }: NlComposerProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !loading) onSubmit();
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <label htmlFor="matias-composer" className="text-[13px] text-ink-muted">
        Pregúntale a MATIAS
      </label>
      <textarea
        id="matias-composer"
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Carga el Tesla con 45 kWh antes de las 7:30 minimizando coste"
        className="w-full resize-none rounded-md border border-hairline bg-canvas p-3 text-sm text-ink placeholder:text-ink-dimmed focus:border-hairline-strong focus:outline-none"
      />
      <div className="flex items-center justify-between gap-3">
        <span className="hidden text-xs text-ink-dimmed sm:inline">
          Enter envía. MATIAS traduce; el optimizador calcula.
        </span>
        <Button type="button" onClick={onSubmit} disabled={!value.trim() || loading} loading={loading} className="ml-auto">
          {loading ? "MATIAS está leyendo…" : "MATIAS, interpreta"}
        </Button>
      </div>
    </div>
  );
}
