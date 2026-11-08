type RenewableBarProps = {
  values: number[];
};

export function RenewableBar({ values }: RenewableBarProps) {
  if (!values.length) return null;

  return (
    <div
      className="flex h-1 gap-px overflow-hidden rounded-xs"
      aria-label="Porcentaje renovable por intervalo"
    >
      {values.map((pct, i) => (
        <div
          key={i}
          className="flex-1 bg-leaf"
          style={{ opacity: Math.max(0.12, Math.min(1, pct / 100)) }}
        />
      ))}
    </div>
  );
}
