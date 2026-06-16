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

export const metadata: Metadata = {
  title: "Laia Torres",
  description:
    "Showcase your work with a customizable portfolio web app designed for creatives and professionals.",
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
