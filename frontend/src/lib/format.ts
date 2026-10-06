const berlin = "Europe/Berlin";

export const money = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const decimal = new Intl.NumberFormat("es-CO", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function eurMwhToCtKwh(eurPerMwh: number): number {
  return eurPerMwh / 10;
}

export function formatCtKwh(eurPerMwh: number): string {
  return `${decimal.format(eurMwhToCtKwh(eurPerMwh))} ct/kWh`;
}

export function formatBerlinTime(iso: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: berlin,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function formatBerlinDateTimeLocal(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: berlin,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export function berlinDayKey(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: berlin }).format(new Date(iso));
}
