import type { LoadFormData } from "@/lib/client-store";
import { berlinDayKey } from "@/lib/format";

export type DeadlineGuide = {
  beforeSlot: number;
  deadlineLabel: string;
  totalEnergyKwh: number;
  loadCount: number;
  slotCount: number;
};

function berlinHourMinute(deadlineLocal: string): { hour: number; minute: number; dayKey: string } | null {
  const d = new Date(deadlineLocal);
  if (Number.isNaN(d.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return { hour, minute, dayKey: berlinDayKey(d.toISOString()) };
}

/** Alinea cargas del hogar con el día de precios seleccionado (hoy / mañana en Berlín). */
export function deadlineGuideForDay(
  loads: LoadFormData[],
  priceDayKey: string | undefined,
  pricePointCount: number,
): DeadlineGuide | null {
  if (!loads.length || !priceDayKey || pricePointCount < 1) return null;

  const onDay = loads
    .map((load) => {
      if (!load.deadlineLocal.trim()) return null;
      const hm = berlinHourMinute(load.deadlineLocal);
      if (!hm || hm.dayKey !== priceDayKey) return null;
      const slot = Math.min(
        pricePointCount,
        Math.max(1, hm.hour * 4 + Math.floor(hm.minute / 15)),
      );
      const label = `${String(hm.hour).padStart(2, "0")}:${String(hm.minute).padStart(2, "0")}`;
      return { slot, kwh: load.energy_kwh, label };
    })
    .filter((x): x is NonNullable<typeof x> => x != null);

  if (!onDay.length) return null;

  const earliest = onDay.reduce((a, b) => (a.slot <= b.slot ? a : b));
  const totalEnergyKwh = onDay.reduce((sum, item) => sum + item.kwh, 0);
  const slotCount = Math.min(pricePointCount, Math.max(4, Math.ceil(totalEnergyKwh / 1.85)));

  return {
    beforeSlot: earliest.slot,
    deadlineLabel: earliest.label,
    totalEnergyKwh,
    loadCount: onDay.length,
    slotCount,
  };
}
