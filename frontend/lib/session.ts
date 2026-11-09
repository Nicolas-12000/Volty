export type VoltyUser = {
  email: string;
  name: string;
  assistant: string;
};

const TOKEN_KEY = "volty.access_token";

import { friendlyError } from "./friendly-errors";
import { apiBase } from "./http";

const API = apiBase();

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export async function login(email: string, password: string): Promise<VoltyUser> {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = typeof body.detail === "string" ? body.detail : undefined;
    throw new Error(friendlyError(detail, "No pudimos iniciar sesión. Revisa correo y contraseña."));
  }
  setAccessToken(body.access_token);
  return body.user as VoltyUser;
}

export async function fetchCurrentUser(): Promise<VoltyUser | null> {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      clearSession();
      return null;
    }
    return (await res.json()) as VoltyUser;
  } catch {
    clearSession();
    return null;
  }
}
