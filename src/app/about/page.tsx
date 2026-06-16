import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { ArchivePage } from "@/components/archive-page";
import { UNICA_MONO, UNICA_SANS } from "@/lib/unica";

export const metadata: Metadata = {
  title: "About — Laia Torres",
  description: "Laia Torres — dirección de arte y diseño gráfico.",
};

const meta: CSSProperties = { fontFamily: UNICA_MONO, fontWeight: 400 };
const body: CSSProperties = { fontFamily: UNICA_SANS, fontWeight: 400 };

// TODO: copia provisional — sustituir por la bio real de Laia.
const SIDE = ["Dirección de arte", "Diseño gráfico", "Barcelona, ES"];
const BIO = [
  "Laia Torres es directora de arte y diseñadora gráfica afincada en Barcelona. Su trabajo explora la intersección entre identidad, fotografía y diseño editorial, con una sensibilidad que equilibra lo moderno y lo atemporal.",
  "A lo largo de los años ha colaborado con marcas de moda, belleza y hostelería, desarrollando lenguajes visuales coherentes que se extienden desde la identidad hasta su aplicación en producto, packaging y campañas.",
  "Cada proyecto parte de la misma premisa: encontrar la esencia de la marca y traducirla a un sistema visual claro, cuidado y con intención.",
];

export default function AboutPage() {
  return (
    <ArchivePage label="About">
      {/* Margen izquierdo (cols 1–3) — meta */}
      <div style={{ gridColumn: "1 / 4" }}>
        <p style={{ ...meta, fontSize: "10.881px", lineHeight: 1.45, color: "#a5a5a5", textAlign: "right", margin: 0 }}>
          {SIDE.map((s, i) => (
            <span key={i}>
              {s}
              {i < SIDE.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      </div>

      {/* Cuerpo (cols 4–12) */}
      <div style={{ gridColumn: "4 / 13", maxWidth: "836px" }}>
        {BIO.map((p, i) => (
          <p key={i} style={{ ...body, fontSize: "18.88px", lineHeight: 1.23, color: "#000", margin: i === 0 ? 0 : "0.9em 0 0" }}>
            {p}
          </p>
        ))}
      </div>
    </ArchivePage>
  );
}
