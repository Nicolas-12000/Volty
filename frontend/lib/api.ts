import { authHeaders } from "./api-auth";
import { apiBase } from "./http";
import type { VoltyUser } from "./session";

const API = apiBase();

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

export type MatiasAction = {
  type: "apply_loads" | "open_loads" | "run_plan";
  label: string;
};

export type MatiasChatResponse = {
  thread_id: string;
  reply: string;
  messages: ChatMessageDto[];
  intent: ParsedIntent | null;
  draft: ParsedIntent | null;
  actions: MatiasAction[];
  assistant: string;
  backend: string;
  rag_used: boolean;
};

export type ChatMessageDto = { role: "user" | "assistant"; content: string };

export type MatiasThreadSummary = {
  thread_id: string;
  title: string;
  updated_at: string | null;
  message_count: number;
  has_draft: boolean;
};

export type MatiasThreadResponse = {
  thread_id: string;
  title: string;
  messages: ChatMessageDto[];
  draft: ParsedIntent | null;
};

export async function listMatiasThreads(): Promise<MatiasThreadSummary[]> {
  const res = await fetch(`${API}/chat/threads`, { headers: authHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(await readError(res));
  const body = (await res.json()) as { threads: MatiasThreadSummary[] };
  return body.threads;
}

export async function createMatiasThread(): Promise<MatiasThreadResponse> {
  const res = await fetch(`${API}/chat/threads`, { method: "POST", headers: authHeaders() });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function matiasChat(body: {
  thread_id?: string;
  message?: string;
  messages?: ChatMessageDto[];
  context_load_name?: string;
  draft?: ParsedIntent;
}): Promise<MatiasChatResponse> {
  const res = await fetch(`${API}/chat`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function fetchMatiasThread(threadId: string): Promise<MatiasThreadResponse> {
  const res = await fetch(`${API}/chat/threads/${encodeURIComponent(threadId)}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function patchMatiasDraft(threadId: string, draft: ParsedIntent): Promise<ParsedIntent> {
  const res = await fetch(`${API}/chat/threads/${encodeURIComponent(threadId)}/draft`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(draft),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export type MeSummary = {
  user: { email: string; name: string; assistant: string };
  matias: {
    thread_count: number;
    threads_with_draft: number;
    recent_threads: MatiasThreadSummary[];
  };
  server: {
    bidding_zone: string;
    timezone: string;
    assistant: string;
    note: string;
  };
  can_change_password: boolean;
};

export async function fetchMeSummary(): Promise<MeSummary> {
  const res = await fetch(`${API}/me/summary`, { headers: authHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function patchProfile(name: string): Promise<VoltyUser> {
  const res = await fetch(`${API}/me/profile`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  newPasswordConfirm: string,
): Promise<void> {
  const res = await fetch(`${API}/me/password`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    }),
  });
  if (!res.ok) throw new Error(await readError(res));
}

export async function resetMatiasThread(threadId: string): Promise<void> {
  const res = await fetch(`${API}/chat/threads/${encodeURIComponent(threadId)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok && res.status !== 204) throw new Error(await readError(res));
}

export async function interpret(message: string): Promise<ParsedIntent> {
  const res = await fetch(`${API}/interpret`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

async function readError(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const body = JSON.parse(text) as { detail?: unknown };
    if (typeof body.detail === "string") return body.detail;
  } catch {
    /* body is not JSON */
  }
  return text || "La petición falló.";
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
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function fetchSmardFilters(): Promise<Record<string, string>> {
  const res = await fetch(`${API}/smard/filters`);
  if (!res.ok) return {};
  return res.json();
}

export type SmardPoint = {
  timestamp: string;
  value: number | null;
};

export type SmardSeriesResponse = {
  filter_id: number;
  filter_name: string;
  region: string;
  resolution: string;
  points: SmardPoint[];
  source: string;
};

export async function fetchSmardSeries(filterId: number): Promise<SmardSeriesResponse> {
  const res = await fetch(`${API}/smard/series?filter_id=${filterId}`);
  if (!res.ok) throw new Error("Error obteniendo datos de SMARD");
  return res.json();
}
