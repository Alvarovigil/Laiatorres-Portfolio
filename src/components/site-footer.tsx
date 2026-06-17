"use client";

import type { CSSProperties } from "react";
import { UNICA_SANS } from "@/lib/unica";

// Pie del sitio: Laia Torres (col 1) · redes (col 4) · © 2024 (col 12), todo
// alineado abajo y en mix-blend-mode: exclusion. Compartido entre la ficha de
// proyecto y las páginas de about/contact.
const sans: CSSProperties = { fontFamily: UNICA_SANS, fontWeight: 400, fontStyle: "normal" };
const item: CSSProperties = { ...sans, fontSize: "17.45px", lineHeight: 1.19, color: "#fff", margin: 0 };
const link: CSSProperties = { color: "#fff", textDecoration: "underline" };

const SOCIAL = [
  { label: "Linkedin", href: "#" },
  { label: "Instagram", href: "#" },
];

export function SiteFooter({ marginTop = "0px" }: { marginTop?: string }) {
  return (
    <div
      style={{
        marginTop,
        mixBlendMode: "exclusion",
        paddingLeft: "36px",
        paddingRight: "36px",
        paddingBottom: "48px",
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        columnGap: "18px",
        alignItems: "end",
      }}
    >
      {/* Columna 1 — email de contacto */}
      <div style={{ gridColumn: "1 / 4" }}>
        <a href="mailto:laiatorres1234@gmail.com" style={{ ...item, whiteSpace: "nowrap", color: "#fff" }}>
          laiatorres1234@gmail.com
        </a>
      </div>
      {/* Columna 4 — redes */}
      <div style={{ gridColumn: "4 / 9" }}>
        <p style={item}>
          {SOCIAL.map((s, i) => (
            <span key={s.label}>
              <a href={s.href} style={link}>
                {s.label}
              </a>
              {i < SOCIAL.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      </div>
      {/* Última columna (12) — a la derecha */}
      <div style={{ gridColumn: "12 / 13", textAlign: "right" }}>
        <p style={{ ...item, whiteSpace: "nowrap" }}>© 2024</p>
      </div>
    </div>
  );
}
