"use client";

import { useEffect, useState, type ReactNode } from "react";
import { TextLink } from "@/components/ui/button-link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { changePassword, fetchMeSummary, patchProfile, type MeSummary } from "@/lib/api";
import { useSession } from "@/providers/session-provider";

export default function AjustesPage() {
  const { user, refresh, status, logout } = useSession();
  const [name, setName] = useState(user?.name ?? "");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [summary, setSummary] = useState<MeSummary | null>(null);

  const canChangePw = summary?.can_change_password ?? false;
  const nameDirty = name.trim().length > 0 && name.trim() !== (user?.name ?? "");
  const pwReady = currentPw.length > 0 && newPw.length >= 8 && newPw === confirmPw;

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  useEffect(() => {
    if (status !== "authenticated") return;
    void fetchMeSummary()
      .then(setSummary)
      .catch(() => setSummary(null));
  }, [status]);

  async function saveProfile() {
    setProfileErr("");
    setProfileMsg("");
    setSavingProfile(true);
    try {
      await patchProfile(name.trim());
      await refresh();
      setProfileMsg("Listo, guardamos tu nombre.");
    } catch (e: unknown) {
      setProfileErr(e instanceof Error ? e.message : "No pudimos guardar el nombre.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword() {
    setPwErr("");
    setPwMsg("");
    setSavingPw(true);
    try {
      await changePassword(currentPw, newPw, confirmPw);
      setPwMsg("Contraseña actualizada.");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (e: unknown) {
      setPwErr(e instanceof Error ? e.message : "No pudimos cambiar la contraseña.");
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <AppShell
      title="Ajustes"
      subtitle="Tu nombre y tu acceso. Los precios y la zona de mercado los gestiona Volty."
    >
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <section className="panel flex items-center gap-4 px-5 py-4">
          <span
            className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent-subtle text-sm font-semibold text-accent-bright"
            aria-hidden="true"
          >
            {initials(user?.name ?? user?.email ?? "V")}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold tracking-[-0.2px] text-ink">
              {user?.name || "Tu hogar"}
            </p>
            <p className="truncate text-sm text-ink-muted">{user?.email}</p>
          </div>
        </section>

        <SettingsSection
          kicker="Cuenta"
          title="Perfil"
          description="Así te ve MATIAS y el menú. El correo es el de tu hogar y no se puede cambiar."
        >
          <div className="flex items-center justify-between gap-3 rounded-md border border-hairline bg-canvas px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-[13px] text-ink-muted">Correo</p>
              <p className="truncate text-sm text-ink">{user?.email ?? "—"}</p>
            </div>
            <Badge>Fijo</Badge>
          </div>

          <Input
            label="Nombre en Volty"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setProfileMsg("");
              setProfileErr("");
            }}
            autoComplete="name"
          />
          {profileErr ? (
            <p className="text-sm text-peak" role="alert">
              {profileErr}
            </p>
          ) : null}
          {profileMsg ? <p className="text-sm text-leaf-bright">{profileMsg}</p> : null}
          <Button type="button" onClick={() => void saveProfile()} loading={savingProfile} disabled={!nameDirty}>
            Guardar nombre
          </Button>
        </SettingsSection>

        <SettingsSection
          kicker="Seguridad"
          title="Contraseña"
          description={
            canChangePw
              ? "Mínimo 8 caracteres. La usas para entrar a este hogar."
              : "En esta sesión no se puede cambiar la contraseña todavía."
          }
        >
          {!canChangePw ? (
            <div className="rounded-lg border border-hairline bg-canvas px-4 py-4">
              <div className="flex gap-3">
                <LockIcon />
                <div>
                  <p className="text-sm text-ink">Para cambiarla, entra otra vez</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    Cierra sesión y vuelve a entrar con{" "}
                    <span className="text-ink">demo@volty.dev</span> para usar la cuenta de la demo.
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="mt-3"
                    onClick={() => logout()}
                  >
                    Cerrar sesión
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Input
                type="password"
                label="Contraseña actual"
                autoComplete="current-password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
              />
              <Input
                type="password"
                label="Nueva contraseña"
                autoComplete="new-password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
              />
              <Input
                type="password"
                label="Repetir nueva contraseña"
                autoComplete="new-password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                error={confirmPw.length > 0 && newPw !== confirmPw ? "No coincide con la nueva." : undefined}
              />
              {pwErr ? (
                <p className="text-sm text-peak" role="alert">
                  {pwErr}
                </p>
              ) : null}
              {pwMsg ? <p className="text-sm text-leaf-bright">{pwMsg}</p> : null}
              <Button type="button" onClick={() => void savePassword()} loading={savingPw} disabled={!pwReady}>
                Cambiar contraseña
              </Button>
            </>
          )}
        </SettingsSection>

        {summary ? (
          <SettingsSection
            kicker="Mercado"
            title="Mercado de tu hogar"
            description="Esto lo fija Volty. Así calcula MATIAS los horarios."
          >
            <dl className="divide-y divide-hairline rounded-lg border border-hairline bg-canvas">
              <InfoRow label="Zona de mercado" value={summary.server.bidding_zone} />
              <InfoRow label="Hora local" value={summary.server.timezone} />
              <InfoRow label="Asistente" value={summary.server.assistant} />
            </dl>
            <p className="text-[13px] text-ink-muted">No se cambia desde aquí.</p>
          </SettingsSection>
        ) : null}

        <TextLink href="/hogar">← Volver a tu hogar</TextLink>
      </div>
    </AppShell>
  );
}

function SettingsSection({
  kicker,
  title,
  description,
  children,
}: {
  kicker: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="panel p-5">
      <p className="type-label text-ink-dimmed">{kicker}</p>
      <h2 className="mt-1 text-[15px] font-semibold tracking-[-0.2px] text-ink">{title}</h2>
      <p className="mt-1 text-sm text-ink-muted">{description}</p>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-3 py-2.5">
      <dt className="text-[13px] text-ink-muted">{label}</dt>
      <dd className="text-sm tabular-nums text-ink">{value}</dd>
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "V";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      className="mt-0.5 shrink-0 text-ink-muted"
    >
      <rect x="3.5" y="8" width="11" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M6 8V6.2A3 3 0 0 1 12 6.2V8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
