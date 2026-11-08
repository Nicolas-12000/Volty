import { Suspense, type ReactNode } from "react";

export default function EntrarLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="min-h-dvh bg-canvas" />}>{children}</Suspense>;
}
