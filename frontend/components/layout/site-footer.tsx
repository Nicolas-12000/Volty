"use client";

import { VoltyMark } from "@/components/brand/poodle";

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline py-8 text-[13px] text-ink-dimmed">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-5">
        <span className="flex items-center gap-2 text-ink-muted">
          <VoltyMark size={20} clipId="vm-clip-footer" />
          Volty
        </span>
        <span>Datos de Energy-Charts (Fraunhofer ISE) y SMARD (Bundesnetzagentur).</span>
      </div>
    </footer>
  );
}
