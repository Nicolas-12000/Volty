import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "volty",
  description: "El precio es un terreno — planifica tus cargas con datos reales del mercado DE-LU.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
