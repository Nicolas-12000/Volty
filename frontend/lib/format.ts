const berlin = { timeZone: "Europe/Berlin" as const };

export const decimal = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });
export const money = new Intl.NumberFormat("es-CO", { style: "currency", currency: "EUR" });

const timeFmt = new Intl.DateTimeFormat("es-CO", {
  ...berlin,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dayFmt = new Intl.DateTimeFormat("es-CO", {
  ...berlin,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function formatBerlinTime(iso: string): string {
  return timeFmt.format(new Date(iso));
}

export function berlinDayKey(iso: string): string {
  return dayFmt.format(new Date(iso));
}

export function formatCtKwh(eurPerMwh: number): string {
  return `${decimal.format(eurPerMwh / 10)} ct/kWh`;
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
