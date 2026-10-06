const API = "/api";

export type LoadSpec = {
  id?: string;
  name: string;
  energy_kwh: number;
  max_power_kw: number;
  window_start?: string | null;
  deadline: string;
  must_run?: boolean;
};

export type OptimizeResponse = {
  plans: Array<{
    load_id: string;
    name: string;
    total_energy_kwh: number;
    total_cost_eur: number;
    intervals: Array<{
      timestamp: string;
      power_kw: number;
      energy_kwh: number;
      price_eur_per_mwh: number;
    }>;
  }>;
  baselines: Array<{
    strategy: "asap" | "uniform";
    total_cost_eur: number;
    total_energy_kwh: number;
  }>;
  optimized_total_cost_eur: number;
  savings_vs_asap_eur: number;
  bidding_zone: string;
  interval_minutes: number;
};

export type ParsedIntent = {
  loads: LoadSpec[];
  preferences: { objective: string; renewable_weight: number };
  explanation: string;
  confidence: string;
};

export async function interpret(message: string): Promise<ParsedIntent> {
  const res = await fetch(`${API}/interpret`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function optimize(
  loads: LoadSpec[],
  preferences: ParsedIntent["preferences"],
): Promise<OptimizeResponse> {
  const res = await fetch(`${API}/optimize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ loads, preferences }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function defaultDeadlineTomorrow7am(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(7, 0, 0, 0);
  return d.toISOString();
}
