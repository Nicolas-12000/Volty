const berlin = { timeZone: "Europe/Berlin" as const };

export const decimal = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });
export const money = new Intl.NumberFormat("es-CO", { style: "currency", currency: "EUR" });

const timeFmt = new Intl.DateTimeFormat("es-CO", {
  ...berlin,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const isoDayFmt = new Intl.DateTimeFormat("en-CA", {
  ...berlin,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function formatBerlinTime(iso: string): string {
  return timeFmt.format(new Date(iso));
}

/** Día civil en Berlin como YYYY-MM-DD (coincide con el API). */
export function berlinDayKey(iso: string): string {
  return isoDayFmt.format(new Date(iso));
}

export function shiftBerlinDay(iso: string, deltaDays: number): string {
  const [y, m, d] = berlinDayKey(iso).split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + deltaDays));
  const yyyy = utc.getUTCFullYear();
  const mm = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(utc.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function formatCtKwh(eurPerMwh: number): string {
  return `${decimal.format(eurPerMwh / 10)} ct/kWh`;
}

export function formatEurMwh(eurPerMwh: number): string {
  return `${decimal.format(eurPerMwh)} €/MWh`;
}

const compact = new Intl.NumberFormat("es-CO", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatEnergyMwh(mwh: number): string {
  if (Math.abs(mwh) >= 1000) return `${compact.format(mwh)} MWh`;
  return `${decimal.format(mwh)} MWh`;
}

const dayShortFmt = new Intl.DateTimeFormat("es-CO", {
  ...berlin,
  day: "numeric",
  month: "short",
});

const weekdayShortFmt = new Intl.DateTimeFormat("es-CO", {
  ...berlin,
  weekday: "short",
  day: "numeric",
});

export function formatBerlinDayShort(iso: string): string {
  return dayShortFmt.format(new Date(iso));
}

export function formatBerlinWeekday(iso: string): string {
  return weekdayShortFmt.format(new Date(iso));
}

export function formatSeriesWindow(startIso: string, endIso: string): string {
  const sameDay = berlinDayKey(startIso) === berlinDayKey(endIso);
  if (sameDay) {
    return `${formatBerlinDayShort(startIso)} · ${formatBerlinTime(startIso)}–${formatBerlinTime(endIso)}`;
  }
  return `${formatBerlinDayShort(startIso)} ${formatBerlinTime(startIso)} → ${formatBerlinDayShort(endIso)} ${formatBerlinTime(endIso)}`;
}

export function formatBerlinDateTimeLocal(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    ...berlin,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
