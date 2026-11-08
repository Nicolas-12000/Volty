"use client";

import { useEffect, useState } from "react";
import { berlinDayKey, formatBerlinDateTimeLocal } from "@/lib/format";

export type ClientClock = {
  nowIso: string;
  todayKey: string;
  tomorrowKey: string;
  defaultDeadlineLocal: string;
};

/** Hora “ahora” solo en el cliente (evita new Date() en prerender de Next). */
export function useClientClock(): ClientClock | null {
  const [clock, setClock] = useState<ClientClock | null>(null);

  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const deadline = new Date(now);
    deadline.setDate(deadline.getDate() + 1);
    deadline.setHours(7, 0, 0, 0);

    setClock({
      nowIso: now.toISOString(),
      todayKey: berlinDayKey(now.toISOString()),
      tomorrowKey: berlinDayKey(tomorrow.toISOString()),
      defaultDeadlineLocal: formatBerlinDateTimeLocal(deadline),
    });
  }, []);

  return clock;
}
