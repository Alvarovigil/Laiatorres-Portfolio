import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { ArchivePage } from "@/components/archive-page";
import { Hablemos } from "./bio-copy";
import { ClientsMarquee } from "./clients-marquee";
import { UNICA_MONO, UNICA_SANS } from "@/lib/unica";

export const metadata: Metadata = {
  title: "About",
  description: "Sobre Laia Torres — dirección de arte y diseño gráfico en Barcelona. Contacto y colaboraciones.",
};

const body: CSSProperties = { fontFamily: UNICA_SANS, fontWeight: 400 };
const mono: CSSProperties = { fontFamily: UNICA_MONO, fontWeight: 400 };

const BIO = [
  "Soy Laia, directora de arte y diseñadora gráfica. Construyo identidades, campañas y universos visuales con concepto e intención.",
  "Mi terreno es la dirección de arte y el liderazgo de equipos creativos desde hace más de 5 años: desde el branding y el packaging hasta cualquier canal donde se exprese la marca. Traduzco conceptos en campañas y shootings con una gran atención al detalle en set, buscando siempre la coherencia, conectar con la sensibilidad y el propósito de la marca.",
  "Si tienes un proyecto entre manos, hablemos.",
];

const para: CSSProperties = {
  ...body,
  fontSize: "clamp(18px, 1.9vw, 28px)",
  lineHeight: 1.28,
  color: "#000",
  margin: 0,
  textIndent: "2.6em",
};

export default function AboutPage() {
  return (
    <ArchivePage growContent={false}>
      {/* Bio a la izquierda con marcador (About) colgado + sangría */}
      <div style={{ gridColumn: "1 / 10", position: "relative" }}>
        <span style={{ ...mono, position: "absolute", left: 0, top: "0.45em", fontSize: "12px", color: "#a5a5a5" }}>(About)</span>
        {BIO.map((p, i) => (
          <p key={i} style={{ ...para, margin: i === 0 ? 0 : "0.7em 0 0" }}>
            {p.includes("hablemos")
              ? p.split(/(hablemos)/).map((part, j) =>
                  part === "hablemos" ? <Hablemos key={j} /> : part,
                )
              : p}
          </p>
        ))}
      </div>

      {/* Foto arriba a la derecha */}
      <div style={{ gridColumn: "11 / 13" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/profile/laia.jpg" alt="Laia Torres" style={{ width: "100%", aspectRatio: "3 / 4", objectFit: "cover", display: "block" }} />
      </div>

      {/* Carrusel de clientes destacados — fila a ancho completo */}
      <div style={{ gridColumn: "1 / 13", marginTop: "clamp(80px, 12vh, 180px)" }}>
        <ClientsMarquee />
      </div>
    </ArchivePage>
  );
}
