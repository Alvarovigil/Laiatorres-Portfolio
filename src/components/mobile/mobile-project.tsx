"use client";

import type { Collab } from "@/db/schema";
import type { Media, Section } from "@/components/project-taqta";
import {
  MobileContact,
  MobileFigure,
  MobileFooter,
  MobileNav,
  MobileSection,
  MobileShell,
  label,
  mono,
  sans,
} from "./mobile-chrome";

// Ficha de proyecto en móvil: cabecera + galería en una sola columna.
//
// Simplificaciones deliberadas respecto al escritorio:
//  · Sin nombre ni secciones sticky apilándose en el margen (en móvil no hay
//    margen izquierdo donde vivan, y el apilado se rompe con barras del
//    navegador que aparecen y desaparecen).
//  · Los bloques "pair" se despliegan en dos imágenes seguidas y los "single"
//    pierden su alineación izq/der: todo va a ancho completo.
function flatten(sections: Section[]) {
  const out: { label?: string; media: Media }[] = [];
  for (const sec of sections) {
    let first = true;
    for (const b of sec.blocks) {
      const list = b.type === "pair" ? b.media : [b.media];
      for (const m of list) {
        out.push({ label: first ? sec.label || undefined : undefined, media: m });
        first = false;
      }
    }
  }
  return out;
}

export function MobileProject({
  navigate,
  name,
  services,
  about,
  agency,
  collabs,
  sections,
  nextHref,
}: {
  navigate: (href: string) => void;
  name: string;
  services: string[];
  about: string[];
  agency: string;
  collabs: Collab[];
  sections: Section[];
  nextHref: string;
}) {
  const items = flatten(sections);

  return (
    <MobileShell>
      <MobileNav navigate={navigate} />

      {/* Cabecera */}
      <MobileSection style={{ paddingTop: "40px" }}>
        <h1 style={{ ...sans, fontSize: "12px", lineHeight: 1.4, color: "#000", margin: 0, textTransform: "uppercase", fontWeight: 400 }}>
          {name}
        </h1>

        {services.length ? (
          <p style={{ ...mono, fontSize: "10px", lineHeight: 1.5, color: "#a5a5a5", margin: "14px 0 0" }}>
            {services.join(" · ")}
          </p>
        ) : null}

        <div style={{ marginTop: "28px" }}>
          {about.map((p, i) => (
            <p key={i} style={{ ...sans, fontSize: "17px", lineHeight: 1.32, color: "#000", margin: i === 0 ? 0 : "0.8em 0 0" }}>
              {p}
            </p>
          ))}
        </div>
      </MobileSection>

      {/* Galería — una imagen por fila, a sangre */}
      <div style={{ marginTop: "48px" }}>
        {/* Dentro de una sección las imágenes van pegadas (bloque continuo);
            el aire se reserva para el salto de sección, que es lo que marca el
            ritmo de lectura en móvil. */}
        {items.map((it, i) => (
          <div key={i}>
            {it.label ? (
              <MobileSection style={{ marginTop: i === 0 ? 0 : "104px", marginBottom: "14px" }}>
                <p style={label}>{it.label}</p>
              </MobileSection>
            ) : null}
            <MobileFigure media={it.media} eager={i === 0} />
          </div>
        ))}
      </div>

      {/* Créditos */}
      <MobileSection style={{ marginTop: "40px" }}>
        {agency ? (
          <p style={{ ...mono, fontSize: "10px", lineHeight: 1.5, color: "#000", margin: 0 }}>
            Agency and production: <span style={{ color: "#a5a5a5" }}>{agency}</span>
          </p>
        ) : null}

        {collabs.length ? (
          <div style={{ marginTop: agency ? "20px" : 0 }}>
            <p style={{ ...mono, fontSize: "10px", lineHeight: 1.5, color: "#000", margin: 0 }}>Collabs:</p>
            {collabs.map(({ handle, href }) => (
              <a
                key={handle}
                href={href}
                target="_blank"
                rel="noreferrer"
                style={{ ...mono, display: "block", fontSize: "10px", lineHeight: 1.6, color: "#a5a5a5", textDecoration: "underline" }}
              >
                {handle}
              </a>
            ))}
          </div>
        ) : null}
      </MobileSection>

      {/* Siguiente proyecto — objetivo táctil amplio y a todo el ancho */}
      <MobileSection style={{ marginTop: "48px" }}>
        <button
          onClick={() => navigate(nextHref)}
          style={{
            ...mono,
            width: "100%",
            fontSize: "11px",
            lineHeight: 1.4,
            color: "#000",
            background: "transparent",
            border: "1px solid rgba(0,0,0,0.15)",
            padding: "18px 16px",
            textAlign: "left",
            cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          → SIGUIENTE PROYECTO
        </button>
      </MobileSection>

      <MobileContact />
      <MobileFooter />
    </MobileShell>
  );
}
