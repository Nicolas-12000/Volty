import type { OptimizeResponse } from "@/lib/api";

function planKey(userEmail: string | null | undefined): string {
  return scopedKey("volty-last-plan", userEmail);
}

function scopedKey(base: string, userEmail: string | null | undefined): string {
  if (!userEmail) return `${base}.anon`;
  const safe = userEmail.toLowerCase().replace(/[^a-z0-9@._+-]/g, "_");
  return `${base}.${safe}`;
}

function loadsKey(userEmail: string | null | undefined): string {
  return scopedKey("volty.loads.v1", userEmail);
}

function historyKey(userEmail: string | null | undefined): string {
  return scopedKey("volty.plan-history.v1", userEmail);
}

export type Priority = "cost" | "balance" | "renewable";

export type LoadFormData = {
  name: string;
  energy_kwh: number;
  max_power_kw: number;
  deadlineLocal: string;
  must_run?: boolean;
};

export type StoredLoads = {
  loads: LoadFormData[];
  priority: Priority;
};

export type HistoryEntry = {
  id: string;
  createdAt: string;
  cost: number;
  savings: number;
  loadNames: string[];
};

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function readStoredLoads(userEmail?: string | null): StoredLoads | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(loadsKey(userEmail));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredLoads;
    if (!Array.isArray(parsed.loads)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStoredLoads(data: StoredLoads, userEmail?: string | null): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(loadsKey(userEmail), JSON.stringify(data));
}

export function readLastPlan(userEmail?: string | null): OptimizeResponse | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.sessionStorage.getItem(planKey(userEmail));
    if (!raw) return null;
    return JSON.parse(raw) as OptimizeResponse;
  } catch {
    return null;
  }
}

export function writeLastPlan(plan: OptimizeResponse, userEmail?: string | null): void {
  if (!canUseStorage()) return;
  window.sessionStorage.setItem(planKey(userEmail), JSON.stringify(plan));
}

export function readPlanHistory(userEmail?: string | null): HistoryEntry[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(historyKey(userEmail));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function pushPlanHistory(
  entry: Omit<HistoryEntry, "id" | "createdAt">,
  userEmail?: string | null,
): HistoryEntry[] {
  const next: HistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  const history = [next, ...readPlanHistory(userEmail)].slice(0, 20);
  if (canUseStorage()) {
    window.localStorage.setItem(historyKey(userEmail), JSON.stringify(history));
  }
  return history;
}
