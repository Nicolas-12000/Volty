import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/providers/session-provider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Volty — Optimiza tu energía",
  description:
    "Volty planifica cargas con precios reales. MATIAS interpreta en lenguaje natural; el optimizador arma el horario.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`dark ${inter.variable}`} suppressHydrationWarning>
      <body className={`${inter.className} min-h-dvh bg-canvas text-ink antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
