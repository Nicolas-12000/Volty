"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Hero } from "@/components/layout/hero";
import { FlowStrip } from "@/components/layout/flow-strip";
import { SignInPrompt } from "@/components/layout/sign-in-prompt";
import { PersonalHubBanner } from "@/components/home/personal-hub-banner";
import { useSession } from "@/providers/session-provider";
import { PriceStrip } from "@/components/market/price-strip";
import { PriceChart } from "@/components/market/price-chart";
import { MarketSummary } from "@/components/market/market-summary";
import { MarketStatusBar } from "@/components/market/market-status-bar";
import { RenewableBar } from "@/components/market/renewable-bar";
import Link from "next/link";
import { NlComposer } from "@/components/chat/nl-composer";
import { IntentChips } from "@/components/chat/intent-chips";
import { SkeletonStrip, SkeletonMetric } from "@/components/ui/skeleton";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePrices } from "@/hooks/use-prices";
import { useLoads } from "@/hooks/use-loads";
import { useOptimize } from "@/hooks/use-optimize";
import { formatBerlinTime } from "@/lib/format";
import type { ParsedIntent } from "@/lib/api";

type DayTab = "today" | "tomorrow";

export function MarketHome() {
  const router = useRouter();
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const prices = usePrices();
  const {
    loading,
    error,
    todayPoints,
    tomorrowPoints,
    horizonValues,
    renewableFor,
    intervalMinutes,
    updatedAt,
    biddingZone,
  } = prices;
  const { applyIntent } = useLoads();
  const { runInterpret, error: interpretError, setError } = useOptimize();

  const [day, setDay] = useState<DayTab>("today");
  const [sliderIndex, setSliderIndex] = useState(0);
  const [stripTouched, setStripTouched] = useState(false);
  const [nlText, setNlText] = useState("");
  const [nlLoading, setNlLoading] = useState(false);
  const [draft, setDraft] = useState<ParsedIntent | null>(null);
  const [draftChips, setDraftChips] = useState<string[]>([]);

  const filteredPoints = day === "today" ? todayPoints : tomorrowPoints;
  const renewableSeries = renewableFor(filteredPoints);

  const resetDay = (next: DayTab) => {
    setDay(next);
    setSliderIndex(0);
    setStripTouched(false);
  };

  const handleInterpret = async () => {
    if (!nlText.trim()) return;
    setNlLoading(true);
    setError("");
    try {
      const parsed = await runInterpret(nlText);
      const load = parsed.loads[0];
      setDraft(parsed);
      setDraftChips([
        load.name,
        `${load.energy_kwh} kWh`,
        `antes de ${formatBerlinTime(load.deadline)}`,
        parsed.preferences.objective === "minimize_cost"
          ? "minimizar coste"
          : "equilibrar coste y renovables",
      ]);
    } catch (err: unknown) {
      setDraft(null);
      setDraftChips([]);
      setError(err instanceof Error ? err.message : "MATIAS no pudo leer esa petición.");
    } finally {
      setNlLoading(false);
    }
  };

  const useDraft = () => {
    if (!draft) return;
    applyIntent(draft);
    router.push("/loads");
  };

  return (
    <AppShell title="Mercado" showHeading={false}>
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:gap-10">
        <Hero />

        <MarketStatusBar
          biddingZone={biddingZone}
          updatedAt={updatedAt}
          error={error}
          loading={loading}
        />

        {signedIn ? <PersonalHubBanner /> : null}

        <div className="flex gap-3">
          <Chip active={day === "today"} onClick={() => resetDay("today")}>
            Hoy
          </Chip>
          <Chip active={day === "tomorrow"} onClick={() => resetDay("tomorrow")}>
            Mañana
          </Chip>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="lg:col-span-4">
            {loading ? (
              <div className="space-y-3">
                <SkeletonMetric />
                <SkeletonMetric className="w-32" />
              </div>
            ) : error ? (
              <p className="type-body-sm text-peak">{error}</p>
            ) : (
              <MarketSummary
                points={filteredPoints}
                horizonValues={horizonValues}
                renewablePct={renewableSeries}
                sliderIndex={sliderIndex}
                stripTouched={stripTouched}
                intervalMinutes={intervalMinutes}
                dayLabel={day === "today" ? "hoy" : "mañana"}
              />
            )}
          </Card>

          {!error ? (
            <Card className="space-y-4 lg:col-span-8">
              {loading ? (
                <SkeletonStrip />
              ) : (
                <>
                  <PriceStrip
                    points={filteredPoints}
                    horizonValues={horizonValues}
                    renewablePct={renewableSeries}
                    sliderIndex={sliderIndex}
                    onSelect={(i) => {
                      setStripTouched(true);
                      setSliderIndex(i);
                    }}
                    title={day === "today" ? "Hoy" : "Mañana"}
                    showNowMarker={day === "today"}
                  />
                  <RenewableBar values={renewableSeries} />
                  <PriceChart points={filteredPoints} horizonValues={horizonValues} />
                </>
              )}
            </Card>
          ) : null}
        </div>

        <FlowStrip onHome />

        {signedIn ? (
          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="type-body-sm text-ink-muted">
                Atajo de una frase (sin memoria). Para varios mensajes usa{" "}
                <Link href="/matias" className="font-medium text-accent">
                  MATIAS
                </Link>
                .
              </p>
              <Link href="/hogar" className="type-body-sm font-medium text-accent hover:text-accent-dim">
                Tu hogar →
              </Link>
            </div>
            <NlComposer
              value={nlText}
              onChange={setNlText}
              onSubmit={handleInterpret}
              loading={nlLoading}
            />
            {interpretError ? <p className="type-body-sm mt-4 text-peak">{interpretError}</p> : null}
            {draftChips.length > 0 && draft ? (
              <div className="mt-5 space-y-4">
                <IntentChips chips={draftChips} />
                <div className="flex flex-wrap gap-3">
                  <Button type="button" onClick={useDraft}>
                    Usar en cargas
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setDraft(null);
                      setDraftChips([]);
                    }}
                  >
                    Descartar
                  </Button>
                </div>
              </div>
            ) : null}
          </Card>
        ) : (
          <SignInPrompt
            compact
            title="Planifica tu hogar"
            description="El mercado de arriba es para todos. Entra para MATIAS, cargas, plan y panel en /hogar."
            nextPath="/hogar"
          />
        )}
      </div>
    </AppShell>
  );
}
