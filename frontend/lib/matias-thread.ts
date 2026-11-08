const PREFIX = "volty.matias.active.";

export function readActiveThreadId(userEmail: string | undefined): string | null {
  if (!userEmail || typeof window === "undefined") return null;
  return window.localStorage.getItem(`${PREFIX}${userEmail}`);
}

export function writeActiveThreadId(userEmail: string, id: string): void {
  window.localStorage.setItem(`${PREFIX}${userEmail}`, id);
}

export function clearActiveThreadId(userEmail: string): void {
  window.localStorage.removeItem(`${PREFIX}${userEmail}`);
}
