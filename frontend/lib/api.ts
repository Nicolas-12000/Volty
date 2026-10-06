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

export type PricePoint = {
  timestamp: string;
  price_eur_per_mwh: number;
};

export type PriceSeriesResponse = {
  bidding_zone: string;
  interval_minutes: number;
  unit: string;
  points: PricePoint[];
  source: string;
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

export async function fetchHealth(): Promise<{ status: string; database?: string }> {
  const res = await fetch(`${API}/health`);
  if (!res.ok) throw new Error("Sin conexión");
  return res.json();
}

export async function fetchPrices(): Promise<PriceSeriesResponse> {
  const res = await fetch(`${API}/prices`);
  if (!res.ok) throw new Error("No llegan los precios del mercado. Reintenta o revisa la conexión.");
  return res.json();
}

export async function fetchRenewableShare(): Promise<{ days: Record<string, number> }> {
  const res = await fetch(`${API}/renewable-share`);
  if (!res.ok) return { days: {} };
  return res.json();
}

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
