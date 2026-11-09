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
      <p className="text-[13px] text-ink-muted">MATIAS entendió esto</p>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip, idx) => (
          <span key={`${chip}-${idx}`} className={cn("chip", !confirmed && "border-accent/40 text-accent-bright")}>
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}
