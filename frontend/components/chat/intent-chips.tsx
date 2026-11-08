import { cn } from "@/lib/cn";

type IntentChipsProps = {
  chips: string[];
  confirmed?: boolean;
  className?: string;
};

export function IntentChips({ chips, confirmed = false, className }: IntentChipsProps) {
  if (!chips.length) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="type-label text-ink-muted">MATIAS entendió esto</span>
        {!confirmed && (
          <span className="rounded-pill bg-accent-subtle px-2 py-0.5 type-caption font-semibold text-accent">
            Pendiente de confirmación
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip, idx) => (
          <span
            key={`${chip}-${idx}`}
            className={cn(
              "type-caption inline-flex items-center rounded-sm px-2.5 py-1.5",
              confirmed
                ? "border border-hairline bg-surface-3 text-ink"
                : "border border-dashed border-accent/40 bg-accent-subtle text-accent",
            )}
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}
