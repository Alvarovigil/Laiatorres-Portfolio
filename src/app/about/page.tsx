import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { ArchivePage } from "@/components/archive-page";
import { UNICA_MONO, UNICA_SANS } from "@/lib/unica";

export const metadata: Metadata = {
  title: "About",
  description: "Sobre Laia Torres — dirección de arte y diseño gráfico en Barcelona. Contacto y colaboraciones.",
};

const body: CSSProperties = { fontFamily: UNICA_SANS, fontWeight: 400 };
const mono: CSSProperties = { fontFamily: UNICA_MONO, fontWeight: 400 };

// TODO: copia/datos provisionales.
const BIO = [
  "Directora de arte y diseñadora gráfica afincada en Barcelona. Aporto claridad e intención a identidades visuales, dirección de arte y campañas — entre moda, belleza, hostelería y cultura.",
  "Mi enfoque es estratégico, cuidado en el detalle y pensado para escalar: encontrar la esencia de cada marca y traducirla a un sistema visual claro y atemporal.",
  "Con más de 8 años de experiencia, he liderado equipos creativos y trabajado para marcas como Julia Perfumeries, Palau Fugit y Smyl, entre otras.",
];
const EMAIL = "laiatorres1234@gmail.com";

const para: CSSProperties = {
  ...body,
  fontSize: "clamp(22px, 2.3vw, 34px)",
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
            {p}
          </p>
        ))}

        {/* Contacto */}
        <div style={{ marginTop: "8vh" }}>
          <p style={{ ...mono, fontSize: "12px", color: "#a5a5a5", margin: "0 0 0.8em" }}>(Get in touch)</p>
          <a href={`mailto:${EMAIL}`} style={{ ...body, fontSize: "clamp(20px, 2vw, 30px)", lineHeight: 1.1, color: "#000", textDecoration: "none" }}>
            {EMAIL}
          </a>
        </div>
      </div>

      {/* Foto arriba a la derecha */}
      <div style={{ gridColumn: "11 / 13" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/profile/laia.jpg" alt="Laia Torres" style={{ width: "100%", aspectRatio: "3 / 4", objectFit: "cover", display: "block" }} />
      </div>
    </ArchivePage>
  );
}
