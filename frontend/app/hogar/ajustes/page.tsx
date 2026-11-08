"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePassword, fetchMeSummary, patchProfile } from "@/lib/api";
import { useSession } from "@/providers/session-provider";

export default function AjustesPage() {
  const { user, refresh } = useSession();
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
  const [canChangePw, setCanChangePw] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  useEffect(() => {
    void fetchMeSummary().then((s) => setCanChangePw(s.can_change_password));
  }, []);

  async function saveProfile() {
    setProfileErr("");
    setProfileMsg("");
    setSavingProfile(true);
    try {
      await patchProfile(name.trim());
      await refresh();
      setProfileMsg("Nombre actualizado.");
    } catch (e: unknown) {
      setProfileErr(e instanceof Error ? e.message : "No se guardó.");
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
      setPwMsg("Contraseña cambiada.");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (e: unknown) {
      setPwErr(e instanceof Error ? e.message : "No se cambió la contraseña.");
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <AppShell
      title="Ajustes"
      subtitle="Solo nombre y contraseña. Zona de mercado y optimización las controla Volty en el servidor."
    >
      <div className="mx-auto flex max-w-lg flex-col gap-6">
        <Card className="space-y-4">
          <p className="type-label text-ink-muted">Perfil</p>
          <label className="block space-y-1">
            <span className="type-caption text-ink-dimmed">Correo (no editable)</span>
            <Input value={user?.email ?? ""} disabled />
          </label>
          <label className="block space-y-1">
            <span className="type-caption text-ink-dimmed">Nombre en Volty</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          {profileErr ? <p className="type-body-sm text-peak">{profileErr}</p> : null}
          {profileMsg ? <p className="type-body-sm text-valley-deep">{profileMsg}</p> : null}
          <Button type="button" onClick={() => void saveProfile()} loading={savingProfile}>
            Guardar nombre
          </Button>
        </Card>

        <Card className="space-y-4">
          <p className="type-label text-ink-muted">Contraseña</p>
          {!canChangePw ? (
            <p className="type-body-sm text-ink-muted">
              Inicia sesión con cuenta en base de datos (tras migraciones) para cambiar la contraseña aquí.
            </p>
          ) : (
            <>
              <Input
                type="password"
                placeholder="Contraseña actual"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Nueva contraseña (mín. 8)"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Repetir nueva contraseña"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
              />
              {pwErr ? <p className="type-body-sm text-peak">{pwErr}</p> : null}
              {pwMsg ? <p className="type-body-sm text-valley-deep">{pwMsg}</p> : null}
              <Button type="button" onClick={() => void savePassword()} loading={savingPw}>
                Cambiar contraseña
              </Button>
            </>
          )}
        </Card>

        <Link href="/hogar" className="type-body-sm text-accent hover:text-accent-dim">
          ← Volver a tu hogar
        </Link>
      </div>
    </AppShell>
  );
}
