"use client";

import { useState, type CSSProperties } from "react";
import { UNICA_SANS } from "@/lib/unica";

// Pie del sitio: Laia Torres (col 1) · redes (col 4) · © 2024 (col 12), todo
// alineado abajo y en mix-blend-mode: exclusion. Compartido entre la ficha de
// proyecto y las páginas de about/contact.
const sans: CSSProperties = { fontFamily: UNICA_SANS, fontWeight: 400, fontStyle: "normal" };
const item: CSSProperties = { ...sans, fontSize: "13px", lineHeight: 1.19, color: "#fff", margin: 0 };
const link: CSSProperties = { color: "#fff", textDecoration: "underline" };

const SOCIAL = [
  { label: "Linkedin", href: "#" },
  { label: "Instagram", href: "#" },
];

// Enlace de red con hover: se atenúa suavemente al pasar el ratón.
function SocialLink({ href, label }: { href: string; label: string }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...link, opacity: hover ? 0.5 : 1, transition: "opacity 0.25s ease" }}
    >
      {label}
    </a>
  );
}

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
      {/* Columna 4 — redes */}
      <div style={{ gridColumn: "4 / 9" }}>
        <p style={item}>
          {SOCIAL.map((s, i) => (
            <span key={s.label}>
              <SocialLink href={s.href} label={s.label} />
              {i < SOCIAL.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      </div>
      {/* Última columna (12) — a la derecha */}
      <div style={{ gridColumn: "12 / 13", textAlign: "right" }}>
        <p style={{ ...item, whiteSpace: "nowrap", opacity: 0.6 }}>© 2026</p>
      </div>
    </div>
  );
}
