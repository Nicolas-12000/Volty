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
  title: "Volty — Precios reales para decidir cuándo consumir",
  description:
    "Dile a MATIAS qué necesitas y planifica tu hogar en los valles del mercado. Precios day-ahead DE-LU cada 15 minutos.",
  icons: {
    icon: "/volty-mark.svg",
    apple: "/volty-mark.svg",
  },
  openGraph: {
    title: "Volty — Precios reales para decidir cuándo consumir",
    description:
      "MATIAS y el optimizador usan precios day-ahead DE-LU cada 15 minutos.",
    images: [
      {
        url: "/volty-mark.svg",
        width: 120,
        height: 120,
        alt: "Volty — el caniche MATIAS",
      },
    ],
  },
  twitter: {
    card: "summary",
    images: ["/volty-mark.svg"],
  },
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
