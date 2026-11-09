"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  clearSession,
  fetchCurrentUser,
  login as loginRequest,
  type VoltyUser,
} from "@/lib/session";
import { requiresAuth } from "@/lib/access";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

type SessionContextValue = {
  status: SessionStatus;
  user: VoltyUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [user, setUser] = useState<VoltyUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const refresh = useCallback(async () => {
    const me = await fetchCurrentUser();
    if (me) {
      setUser(me);
      setStatus("authenticated");
    } else {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (status === "loading") return;
    if (!requiresAuth(pathname)) return;
    if (status === "unauthenticated") {
      const next = encodeURIComponent(pathname || "/loads");
      router.replace(`/entrar?next=${next}`);
    }
  }, [status, pathname, router]);

  const login = useCallback(
    async (email: string, password: string) => {
      const u = await loginRequest(email, password);
      setUser(u);
      setStatus("authenticated");
    },
    [],
  );

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setStatus("unauthenticated");
    router.push("/");
  }, [router]);

  const value = useMemo(
    () => ({ status, user, login, logout, refresh }),
    [status, user, login, logout, refresh],
  );

  const gateLoading = status === "loading" && requiresAuth(pathname);

  return (
    <SessionContext.Provider value={value}>
      {children}
      {gateLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-canvas">
          <p className="text-sm text-ink-muted">Cargando Volty…</p>
        </div>
      ) : null}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession debe usarse dentro de SessionProvider");
  return ctx;
}
