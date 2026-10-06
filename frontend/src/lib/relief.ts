export type ReliefClass = "valle-hondo" | "valle" | "llano" | "loma" | "cima";

const LABELS: Record<ReliefClass, string> = {
  "valle-hondo": "Valle hondo",
  valle: "Valle",
  llano: "Llano",
  loma: "Loma",
  cima: "Cima",
};

export function reliefLabel(c: ReliefClass): string {
  return LABELS[c];
}

export function classifyRelief(prices: number[]): ReliefClass[] {
  if (prices.length === 0) return [];
  const sorted = [...prices].sort((a, b) => a - b);
  const pick = (p: number) => {
    const idx = Math.min(sorted.length - 1, Math.floor(p * sorted.length));
    return sorted[idx];
  };
  const t20 = pick(0.2);
  const t40 = pick(0.4);
  const t60 = pick(0.6);
  const t80 = pick(0.8);

  return prices.map((v) => {
    if (v <= t20) return "valle-hondo";
    if (v <= t40) return "valle";
    if (v <= t60) return "llano";
    if (v <= t80) return "loma";
    return "cima";
  });
}

export function reliefBgClass(c: ReliefClass): string {
  return `bg-relief-${c}`;
}

export function cheapestWindow(
  prices: number[],
  intervalMinutes: number,
): { startIdx: number; endIdx: number; avg: number } | null {
  if (prices.length < 4) return null;
  const slotsPerHour = 60 / intervalMinutes;
  const windowSize = Math.max(4, Math.floor(2 * slotsPerHour));
  let bestAvg = Infinity;
  let bestStart = 0;
  for (let i = 0; i <= prices.length - windowSize; i++) {
    const slice = prices.slice(i, i + windowSize);
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
    if (avg < bestAvg) {
      bestAvg = avg;
      bestStart = i;
    }
  }
  return { startIdx: bestStart, endIdx: bestStart + windowSize - 1, avg: bestAvg };
}
