import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// PP Mori (Pangram Pangram) — tipo principal (títulos, nombres, textos).
// Local, 3 pesos. Disponible como var(--font-sans).
const ppMori = localFont({
  variable: "--font-sans",
  display: "swap",
  src: [
    { path: "./fonts/PPMori-Extralight.otf", weight: "200", style: "normal" },
    { path: "./fonts/PPMori-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/PPMori-SemiBold.otf", weight: "600", style: "normal" },
  ],
});

// Geist Mono — monoespaciada, para detalles "técnicos" (etiquetas, fechas, tags).
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

// Unica77 LL (Lineto) — tipografía de la ficha de proyecto V3. Sans + Mono.
const unica = localFont({
  variable: "--font-unica",
  display: "swap",
  src: [
    { path: "./fonts/Unica77LL-Light.otf", weight: "300", style: "normal" },
    { path: "./fonts/Unica77LL-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/Unica77LL-Medium.otf", weight: "500", style: "normal" },
  ],
});

const unicaMono = localFont({
  variable: "--font-unica-mono",
  display: "swap",
  src: [
    { path: "./fonts/Unica77MonoLL-Light.otf", weight: "300", style: "normal" },
    { path: "./fonts/Unica77MonoLL-Regular.otf", weight: "400", style: "normal" },
  ],
});

// URL base para resolver imágenes absolutas (OG/Twitter). Debe ser pública:
// NO usamos VERCEL_URL (la del deploy va protegida y rompe la miniatura).
// Cuando haya dominio propio, define NEXT_PUBLIC_SITE_URL.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://adhoc-laiatorres-portfolio.vercel.app";

const SITE_DESCRIPTION =
  "Dirección de arte y diseño gráfico desde Barcelona. Identidad visual, dirección de arte y campañas entre moda, belleza, hostelería y cultura.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Laia Torres — Dirección de arte y diseño gráfico",
    template: "%s — Laia Torres",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Laia Torres",
  authors: [{ name: "Laia Torres" }],
  creator: "Laia Torres",
  keywords: [
    "Laia Torres",
    "dirección de arte",
    "diseño gráfico",
    "identidad visual",
    "branding",
    "Barcelona",
    "portfolio",
  ],
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Laia Torres",
    title: "Laia Torres — Dirección de arte y diseño gráfico",
    description: SITE_DESCRIPTION,
    images: [{ url: "/og.jpg", width: 2752, height: 1920, alt: "Laia Torres" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Laia Torres — Dirección de arte y diseño gráfico",
    description: SITE_DESCRIPTION,
    images: ["/og.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ppMori.variable} ${geistMono.variable} ${unica.variable} ${unicaMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full bg-white font-normal"
        style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
      >
        {children}
      </body>
    </html>
  );
}
