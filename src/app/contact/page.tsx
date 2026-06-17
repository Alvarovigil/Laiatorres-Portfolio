import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { ArchivePage } from "@/components/archive-page";
import { UNICA_MONO, UNICA_SANS } from "@/lib/unica";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contacta con Laia Torres para encargos y colaboraciones.",
};

const meta: CSSProperties = { fontFamily: UNICA_MONO, fontWeight: 400 };
const body: CSSProperties = { fontFamily: UNICA_SANS, fontWeight: 400 };

// TODO: datos provisionales — sustituir por el email y redes reales.
const EMAIL = "hola@laiatorres.com";
const SOCIAL = [
  { label: "Linkedin", href: "#" },
  { label: "Instagram", href: "#" },
];

export default function ContactPage() {
  return (
    <ArchivePage label="Contact">
      {/* Margen izquierdo (cols 1–3) — meta */}
      <div style={{ gridColumn: "1 / 4" }}>
        <p style={{ ...meta, fontSize: "10.881px", lineHeight: 1.45, color: "#a5a5a5", textAlign: "right", margin: 0 }}>
          Barcelona, ES
        </p>
      </div>

      {/* Cuerpo (cols 4–12) */}
      <div style={{ gridColumn: "4 / 13" }}>
        <a
          href={`mailto:${EMAIL}`}
          style={{ ...body, fontSize: "clamp(28px, 4vw, 56px)", lineHeight: 1.05, color: "#000", textDecoration: "none", display: "inline-block" }}
        >
          {EMAIL}
        </a>
        <p style={{ ...body, fontSize: "18.88px", lineHeight: 1.23, color: "#000", margin: "1.4em 0 0", maxWidth: "640px" }}>
          Disponible para encargos y colaboraciones. Escríbeme y te respondo lo antes posible.
        </p>
        <p style={{ ...meta, fontSize: "10.881px", lineHeight: 1.7, color: "#a5a5a5", margin: "2.4em 0 0" }}>
          {SOCIAL.map((s) => (
            <a key={s.label} href={s.href} style={{ display: "block", color: "#a5a5a5", textDecoration: "underline" }}>
              {s.label}
            </a>
          ))}
        </p>
      </div>
    </ArchivePage>
  );
}
