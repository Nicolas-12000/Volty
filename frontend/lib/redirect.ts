/** Normaliza destinos post-login (evita / vs /dashboard duplicado). */

export function normalizeAppPath(path: string | null | undefined): string {
  const raw = (path ?? "/").trim();
  if (!raw.startsWith("/")) return "/";
  if (raw === "/dashboard" || raw.startsWith("/dashboard/")) {
    return raw.replace(/^\/dashboard/, "") || "/";
  }
  return raw;
}
