/** Rutas visibles sin sesión (datos de mercado y APIs). Lo demás es hogar del usuario. */

const PUBLIC_EXACT = new Set(["/", ""]);

const PUBLIC_PREFIXES = ["/entrar", "/registro", "/analytics"] as const;

const LEGACY_PUBLIC = ["/dashboard"] as const;

export function isPublicPath(path: string): boolean {
  if (PUBLIC_EXACT.has(path)) return true;
  if (LEGACY_PUBLIC.some((p) => path === p || path.startsWith(`${p}/`))) return true;
  return PUBLIC_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

export function requiresAuth(path: string): boolean {
  return !isPublicPath(path);
}

export function loginHref(nextPath: string): string {
  return `/entrar?next=${encodeURIComponent(nextPath)}`;
}
