"use client";

import { useEffect, useMemo, useState } from "react";
import { MatiasAvatar } from "@/components/chat/matias-avatar";
import { Button } from "@/components/ui/button";
import { TextLink } from "@/components/ui/button-link";
import { Skeleton } from "@/components/ui/skeleton";
import { interpret, optimize } from "@/lib/api";
import { fmtEuro, localPlan, ranges } from "@/lib/market-demo";
import { usePrices } from "@/hooks/use-prices";
import { useLoads } from "@/hooks/use-loads";
import { useSession } from "@/providers/session-provider";
import { formatBerlinTime } from "@/lib/format";
import { loginHref } from "@/lib/access";

const PROMPT = "Necesito cargar el coche antes de las 7 de la mañana y quiero minimizar el coste.";

type LiveResult = {
  chips: string[];
  window: string;
  save: number;
  cost: number;
  base: number;
};

export function ChatDemo() {
  const [run, setRun] = useState(0);
  return <ChatDemoPlay key={run} onReplay={() => setRun((r) => r + 1)} />;
}

function ChatDemoPlay({ onReplay }: { onReplay: () => void }) {
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const { applyIntent } = useLoads();
  const { tomorrowPoints, loading: pricesLoading } = usePrices();
  const [typed, setTyped] = useState("");
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState<LiveResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let i = 0;
    const tick = () => {
      i += 1;
      setTyped(PROMPT.slice(0, i));
      if (i < PROMPT.length) timers.push(setTimeout(tick, 28));
      else {
        timers.push(setTimeout(() => setStep(1), 300));
        timers.push(setTimeout(() => setStep(2), 1500));
        timers.push(setTimeout(() => setStep(3), 2300));
      }
    };
    timers.push(setTimeout(tick, 400));
    return () => timers.forEach(clearTimeout);
  }, []);

  const tomorrow = useMemo(
    () => tomorrowPoints.map((p) => p.price_eur_per_mwh),
    [tomorrowPoints],
  );
  const pl = useMemo(() => localPlan(tomorrow, { beforeSlot: 28, count: 8 }), [tomorrow]);
  const hasPlan = pl.idx.length > 0;

  async function submitLive() {
    const text = input.trim();
    if (!text || busy) return;
    setBusy(true);
    setError("");
    try {
      const parsed = await interpret(text);
      const load = parsed.loads[0];
      const chips = load
        ? [
            `${load.energy_kwh} kWh`,
            `Antes de las ${formatBerlinTime(load.deadline)}`,
            parsed.preferences.objective === "minimize_cost" ? "Objetivo: coste mínimo" : "Coste y renovables",
          ]
        : [];
      const res = await optimize(parsed.loads, parsed.preferences);
      const asap = res.baselines.find((b) => b.strategy === "asap");
      const plan = res.plans[0];
      const active = plan?.intervals.filter((i) => i.power_kw > 0.05) ?? [];
      const window =
        active.length > 1
          ? `${formatBerlinTime(active[0].timestamp)} a ${formatBerlinTime(active[active.length - 1].timestamp)}`
          : ranges(pl.idx);
      setLive({
        chips,
        window,
        save: res.savings_vs_asap_eur,
        cost: res.optimized_total_cost_eur,
        base: asap?.total_cost_eur ?? res.optimized_total_cost_eur,
      });
      setTyped(text);
      setStep(3);
      if (signedIn) applyIntent(parsed);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "MATIAS no pudo leer esa petición.");
    } finally {
      setBusy(false);
    }
  }

  const chips = live?.chips ?? ["14,8 kWh", "Antes de las 07:00", "Objetivo: coste mínimo"];
  const windowLabel = live?.window ?? ranges(pl.idx);
  const save = live?.save ?? pl.base - pl.cost;
  const cost = live?.cost ?? pl.cost;
  const base = live?.base ?? pl.base;
  const showResult = step >= 3 && (live || hasPlan);
  const showResultSkeleton = step >= 3 && !live && (pricesLoading || !hasPlan);

  return (
    <div className="rounded-2xl border border-hairline bg-surface-1 p-5">
      <div className="ml-auto max-w-[88%] rounded-xl rounded-br-sm border border-hairline-strong bg-surface-3 px-4 py-3 text-[15px]">
        {typed}
        {step === 0 ? (
          <span className="caret-blink ml-0.5 inline-block h-[1.1em] w-0.5 bg-accent-bright align-text-bottom" />
        ) : null}
      </div>

      <div
        className={`mt-4 flex items-start gap-3 transition-opacity duration-500 ${step >= 1 ? "opacity-100" : "opacity-0"}`}
      >
        <MatiasAvatar size={40} thinking={step === 1 || busy} />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-ink-muted">
            {step === 1 || busy ? "MATIAS está leyendo tu mensaje…" : "Entendido. Esto es lo que voy a optimizar:"}
          </p>
          <div className={`mt-2 flex flex-wrap gap-2 transition-opacity duration-500 ${step >= 2 ? "opacity-100" : "opacity-0"}`}>
            {chips.map((c) => (
              <span key={c} className="chip">
                {c}
              </span>
            ))}
          </div>
          {showResultSkeleton ? (
            <div className="mt-3 space-y-2 rounded-xl border border-hairline bg-canvas p-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : null}
          {showResult ? (
            <div className="mt-3 rounded-xl border border-hairline bg-canvas p-4">
              <p className="text-sm text-ink-muted">Mejor ventana con precios reales</p>
              <p className="mt-0.5 text-xl font-semibold tracking-[-0.4px]">{windowLabel}</p>
              <p className="mt-1 text-sm">
                <span className="font-medium text-leaf-bright">Ahorras {fmtEuro(save)} €</span>
                <span className="text-ink-muted">
                  {" "}
                  frente a cargar ya ({fmtEuro(cost)} € en lugar de {fmtEuro(base)} €)
                </span>
              </p>
              {signedIn && live ? (
                <TextLink href="/loads" className="mt-3 inline-flex">
                  Usar en cargas →
                </TextLink>
              ) : !signedIn && live ? (
                <TextLink href={loginHref("/loads")} className="mt-3 inline-flex">
                  Entra para guardar esta carga →
                </TextLink>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-peak">{error}</p> : null}

      <div className="mt-5 flex flex-col gap-2 border-t border-hairline pt-4 sm:flex-row sm:items-center sm:gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void submitLive();
          }}
          placeholder="Escribe lo que necesitas…"
          className="h-10 flex-1 rounded-md border border-hairline bg-canvas px-3 text-sm text-ink placeholder:text-ink-dimmed focus:border-hairline-strong focus:outline-none"
        />
        <div className="flex gap-2">
          <Button type="button" onClick={() => void submitLive()} loading={busy} disabled={!input.trim()}>
            Interpretar
          </Button>
          <Button type="button" variant="secondary" onClick={onReplay}>
            Ver de nuevo
          </Button>
        </div>
      </div>
    </div>
  );
}
