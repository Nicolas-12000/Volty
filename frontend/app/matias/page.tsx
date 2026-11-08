"use client";

import { AppShell } from "@/components/layout/app-shell";
import { MatiasChat } from "@/components/chat/matias-chat";

export default function MatiasPage() {
  return (
    <AppShell
      title="MATIAS"
      subtitle="Memoria por hilo en el servidor. El mercado en vivo está en Mercado (/)."
    >
      <div className="mx-auto w-full max-w-6xl">
        <MatiasChat />
      </div>
    </AppShell>
  );
}
