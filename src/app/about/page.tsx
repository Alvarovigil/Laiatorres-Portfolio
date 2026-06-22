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

const BIO = [
  "Soy Laia, directora de arte y diseñadora gráfica. Construyo identidades, campañas y universos visuales con concepto, intención y una sensibilidad atemporal.",
  "Mi terreno es la dirección de arte: dar con la idea, traducirla a un lenguaje visual coherente y sostenerla en cada detalle —del branding y el packaging al lettering, los eventos y las sesiones de foto y campaña, donde disfruto dirigiendo desde detrás de cámara. La ilustración atraviesa todo lo que hago: la uso para dar carácter y calidez.",
  "Más de 8 años de oficio y de liderar equipos creativos. Lo que mejor se me da: ordenar lo complejo, defender una idea y llevarla de principio a fin sin perder el tono.",
  "Si tienes un proyecto entre manos, hablemos.",
];

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
      </div>

      {/* Foto arriba a la derecha */}
      <div style={{ gridColumn: "11 / 13" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/profile/laia.jpg" alt="Laia Torres" style={{ width: "100%", aspectRatio: "3 / 4", objectFit: "cover", display: "block" }} />
      </div>
    </ArchivePage>
  );
}
