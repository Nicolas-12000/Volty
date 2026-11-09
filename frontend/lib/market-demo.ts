/** Cálculo local de ventanas a partir de precios reales (no series inventadas). */

export const fmtEuro = (n: number) => n.toFixed(2).replace(".", ",");

export function slotLabel(slot: number): string {
  const h = Math.floor(slot / 4);
  const m = (slot % 4) * 15;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export type LocalPlan = {
  idx: number[];
  cost: number;
  base: number;
};

export type LocalPlanOptions = {
  beforeSlot?: number;
  count?: number;
  kwhPerSlot?: number;
};

/** Tramos más baratos dentro del plazo (cuartos de hora [0, beforeSlot)). */
export function localPlan(prices: number[], options: LocalPlanOptions = {}): LocalPlan {
  const beforeSlot = options.beforeSlot ?? Math.min(28, prices.length);
  const count = options.count ?? 8;
  const kwhPerSlot = options.kwhPerSlot ?? 1.85;
  if (!prices.length) return { idx: [], cost: 0, base: 0 };
  const limit = Math.min(Math.max(beforeSlot, 1), prices.length);
  const idx = [...Array(limit).keys()]
    .sort((a, b) => prices[a] - prices[b])
    .slice(0, Math.min(count, limit))
    .sort((a, b) => a - b);
  const costOf = (slots: number[]) =>
    slots.reduce((t, i) => t + (prices[i] ?? 0), 0) * (kwhPerSlot / 1000);
  const base = [...Array(Math.min(count, prices.length)).keys()];
  return { idx, cost: costOf(idx), base: costOf(base) };
}

export function ranges(idx: number[]): string {
  if (!idx.length) return "—";
  const out: string[] = [];
  let start = idx[0];
  let prev = idx[0];
  for (let k = 1; k <= idx.length; k++) {
    const x = idx[k];
    if (x !== prev + 1) {
      out.push(`${slotLabel(start)} a ${slotLabel(prev + 1)}`);
      start = x;
    }
    prev = x;
  }
  return out.join(" y ");
}

export function berlinNowSlot(d = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 4 + Math.floor(minute / 15);
}
