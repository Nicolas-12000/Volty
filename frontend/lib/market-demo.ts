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

/** 8 tramos (2 h a 7,4 kW) más baratos antes de `beforeSlot` (07:00 = 28). */
export function localPlan(prices: number[], beforeSlot = 28, count = 8): LocalPlan {
  if (!prices.length) return { idx: [], cost: 0, base: 0 };
  const limit = Math.min(beforeSlot, prices.length);
  const idx = [...Array(limit).keys()]
    .sort((a, b) => prices[a] - prices[b])
    .slice(0, Math.min(count, limit))
    .sort((a, b) => a - b);
  const kwhPerSlot = 1.85;
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
