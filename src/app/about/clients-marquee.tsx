"use client";

import type { CSSProperties } from "react";
import { UNICA_SANS } from "@/lib/unica";

// Clientes destacados con los que ha trabajado Laia.
const CLIENTS = [
  "Netflix", "Mahou", "Júlia Perfumeríes", "The Scentuary", "Palau Fugit",
  "Rispa", "Relats", "PlatanoMelón", "Estrella Galicia", "1906", "Uniqmade",
  "Mobile World Congress", "Inme", "Plesh", "Mobile Week", "Ajuntament de BCN",
  "Eugin", "Silbo", "Bodegas Torres", "B100", "ABANCA", "Leyma", "Refeel",
  "Iris Ventures", "Insua Archive", "Meliá Hotels", "Reveni", "Kativa",
];

const sans: CSSProperties = { fontFamily: UNICA_SANS, fontWeight: 400, fontStyle: "normal" };

// Carrusel infinito (marquee) por CSS: dos copias de la lista desplazándose en
// bucle, con la etiqueta "Clientes destacados" encima.
export function ClientsMarquee() {
  const items = [...CLIENTS, ...CLIENTS];
  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          overflow: "hidden",
          width: "100%",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent)",
          maskImage: "linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent)",
        }}
      >
        <style>{"@keyframes laia-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}"}</style>
        <div
          style={{
            ...sans,
            display: "inline-flex",
            alignItems: "center",
            gap: "clamp(40px, 5vw, 80px)",
            whiteSpace: "nowrap",
            willChange: "transform",
            animation: "laia-marquee 50s linear infinite",
            fontSize: "clamp(15px, 1.3vw, 19px)",
            color: "#000",
            paddingRight: "clamp(40px, 5vw, 80px)",
          }}
        >
          {items.map((c, i) => (
            <span key={i} aria-hidden={i >= CLIENTS.length}>{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
