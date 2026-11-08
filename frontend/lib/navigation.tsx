import type { ReactNode } from "react";
import { loginHref, requiresAuth } from "@/lib/access";

export type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

const iconGrid = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

/** Rutas públicas del dashboard de mercado. */
export const MARKET_NAV: NavItem[] = [
  { label: "Mercado", href: "/", icon: iconGrid },
  {
    label: "Analítica",
    href: "/analytics",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <line x1="4" y1="15" x2="4" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="15" x2="8" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="15" x2="12" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="16" y1="15" x2="16" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

/** Hogar del usuario (JWT). */
export const HOME_NAV: NavItem[] = [
  {
    label: "Hogar",
    href: "/hogar",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M3 8.5 10 3l7 5.5V16a1 1 0 0 1-1 1h-4v-5H8v5H4a1 1 0 0 1-1-1V8.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "MATIAS",
    href: "/matias",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M4 6.5a2.5 2.5 0 0 1 2.45-2.5h7.1A2.5 2.5 0 0 1 16 6.5v3.2c0 .97-.56 1.85-1.44 2.26L11 13.2v2.3H8.5v-2.3l-3.56-1.24A2.5 2.5 0 0 1 4 9.7V6.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="7.25" cy="9" r="0.75" fill="currentColor" />
        <circle cx="12.75" cy="9" r="0.75" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Cargas",
    href: "/loads",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="3" y="6" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="13" y="8.5" width="2.5" height="3" rx="0.75" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Plan",
    href: "/plan",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M10 2 11.5 7H16.5L12.5 10 14 15l-4-3-4 3 1.5-5L3.5 7H8.5L10 2Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export function getNavItems(signedIn: boolean): NavItem[] {
  if (!signedIn) return MARKET_NAV;
  return [MARKET_NAV[0], ...HOME_NAV, MARKET_NAV[1]];
}

export function pathIsActive(pathname: string, href: string): boolean {
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
  if (signedIn || !requiresAuth(href)) return href;
  return loginHref(href);
}
