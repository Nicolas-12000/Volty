type TrendPoint = {
  timestamp: string;
  value: number;
};

type TrendChartProps = {
  points: TrendPoint[];
  unit?: string;
  accent?: "accent" | "leaf";
};

export function TrendChart({ points, unit = "", accent = "accent" }: TrendChartProps) {
  const usable = points.filter((point) => Number.isFinite(point.value));
  if (usable.length < 2) {
    return (
      <p className="text-sm text-ink-muted">No hay suficientes puntos para graficar esta serie.</p>
    );
  }

  const values = usable.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 800;
  const height = 180;
  const pad = 12;
  const stroke = accent === "leaf" ? "var(--v-leaf)" : "var(--v-accent-bright)";

  const coords = values.map((value, i) => {
    const x = pad + (i / (values.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (value - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  });

  return (
    <div className="space-y-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-44 w-full"
        role="img"
        aria-label="Serie temporal"
      >
        <polyline
          points={coords.join(" ")}
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <div className="flex items-center justify-between text-xs tabular-nums text-ink-dimmed">
        <span>
          min {formatNumber(min)} {unit}
        </span>
        <span>
          max {formatNumber(max)} {unit}
        </span>
      </div>
    </div>
  );
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(value);
}
