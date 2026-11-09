"use client";

import { AppShell } from "@/components/layout/app-shell";
import { MatiasChat } from "@/components/chat/matias-chat";

export default function MatiasPage() {
  return (
    <AppShell
      title="MATIAS"
      subtitle="Háblale como a una persona. El horario lo calcula el optimizador con precios reales."
    >
      <MatiasChat />
    </AppShell>
  );
}
