"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPrices, fetchRenewableShare, type PricePoint } from "@/lib/api";
import { berlinDayKey } from "@/lib/format";
import { useClientClock } from "@/lib/use-client-clock";

export type UsePricesReturn = {
  prices: PricePoint[];
  intervalMinutes: number;
  biddingZone: string;
  renewableDays: Record<string, number>;
  renewableLoaded: boolean;
  loading: boolean;
  error: string;
  reload: () => void;
  updatedAt: string;
  todayPoints: PricePoint[];
  tomorrowPoints: PricePoint[];
  horizonValues: number[];
  renewableFor: (pts: PricePoint[]) => number[];
  clock: ReturnType<typeof useClientClock>;
};

export function usePrices(): UsePricesReturn {
  const clock = useClientClock();
  const [prices, setPrices] = useState<PricePoint[]>([]);
  const [intervalMinutes, setIntervalMinutes] = useState(15);
  const [biddingZone, setBiddingZone] = useState("DE-LU");
  const [renewableDays, setRenewableDays] = useState<Record<string, number>>({});
  const [renewableLoaded, setRenewableLoaded] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [reloadTick, setReloadTick] = useState(0);

  const reload = useCallback(() => setReloadTick((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setFetching(true);
    setRenewableLoaded(false);
    void (async () => {
      const [series, ren] = await Promise.all([
        fetchPrices().catch((e: unknown) => {
          if (!cancelled) {
            setError(e instanceof Error ? e.message : "No llegan los precios del mercado.");
          }
          return null;
        }),
        fetchRenewableShare(),
      ]);
      if (cancelled) return;
      if (series) {
        setPrices(series.points);
        setIntervalMinutes(series.interval_minutes);
        setBiddingZone(series.bidding_zone);
        setError("");
      }
      setRenewableDays(ren.days);
      setRenewableLoaded(true);
      setFetching(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadTick]);

  useEffect(() => {
    if (!clock?.nowIso) return;
    setUpdatedAt(
      new Intl.DateTimeFormat("es-CO", {
        timeZone: "Europe/Berlin",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date(clock.nowIso)),
    );
  }, [clock?.nowIso]);

  const todayKey = clock?.todayKey ?? "";
  const tomorrowKey = clock?.tomorrowKey ?? "";

  const pointsForDay = useCallback(
    (key: string) => (key ? prices.filter((p) => berlinDayKey(p.timestamp) === key) : []),
    [prices],
  );

  const todayPoints = pointsForDay(todayKey);
  const tomorrowPoints = pointsForDay(tomorrowKey);
  const horizonValues = [...todayPoints, ...tomorrowPoints].map((p) => p.price_eur_per_mwh);

  const renewableFor = useCallback(
    (pts: PricePoint[]) => pts.map((p) => renewableDays[berlinDayKey(p.timestamp)] ?? 0),
    [renewableDays],
  );

  return {
    prices,
    intervalMinutes,
    biddingZone,
    renewableDays,
    renewableLoaded,
    loading: fetching || !clock,
    error,
    reload,
    updatedAt,
    todayPoints,
    tomorrowPoints,
    horizonValues,
    renewableFor,
    clock,
  };
}
