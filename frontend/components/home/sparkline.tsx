export function Sparkline({ data, color = "#8b93ff" }: { data: number[]; color?: string }) {
  if (data.length < 2) return <div className="h-6 w-20" />;
  const mx = Math.max(...data);
  const mn = Math.min(...data);
  const span = mx - mn || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${22 - ((v - mn) / span) * 20}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="h-6 w-20" aria-hidden="true">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
