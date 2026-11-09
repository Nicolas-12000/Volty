import { loginHref, requiresAuth } from "@/lib/access";

export type NavItem = {
  label: string;
  href: string;
};

/** Invitado: mercado público. Hogar y chat con memoria piden sesión. */
export const GUEST_NAV: NavItem[] = [
  { label: "Mercado", href: "/" },
  { label: "MATIAS", href: "/#matias" },
  { label: "Analítica SMARD", href: "/analytics" },
];

/** Con sesión: hogar, chat persistente y el mismo mercado. */
export const AUTH_NAV: NavItem[] = [
  { label: "Mercado", href: "/" },
  { label: "Hogar", href: "/hogar" },
  { label: "MATIAS", href: "/matias" },
  { label: "Analítica SMARD", href: "/analytics" },
];

export function getNavItems(signedIn: boolean): NavItem[] {
  return signedIn ? AUTH_NAV : GUEST_NAV;
}

export function pathIsActive(pathname: string, href: string): boolean {
  if (href.includes("#")) return false;
  if (href === "/") {
    return pathname === "/" || pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function titleForPath(pathname: string, items: NavItem[]): string {
  const match = items.find((item) => pathIsActive(pathname, item.href));
  return match?.label ?? "Volty";
}

export function navHref(href: string, signedIn: boolean): string {
  const path = href.split("#")[0] || "/";
  if (signedIn || !requiresAuth(path)) return href;
  return loginHref(path);
}
