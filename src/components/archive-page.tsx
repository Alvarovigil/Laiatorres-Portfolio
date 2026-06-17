"use client";

import type { CSSProperties, ReactNode } from "react";
import { BlurStage } from "@/components/blur-stage";
import { GridOverlay } from "@/components/grid-overlay";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { UNICA_SANS } from "@/lib/unica";

// Página con la estética de archivo de la ficha de proyecto: navbar fija,
// etiqueta sticky en el margen izquierdo, contenido en la rejilla de 12 y pie.
// El contenido (children) se coloca dentro de la rejilla: cada hijo decide su
// gridColumn (p. ej. "1 / 4" para el margen, "4 / 13" para el cuerpo).
const sans: CSSProperties = { fontFamily: UNICA_SANS, fontWeight: 400, fontStyle: "normal" };

export function ArchivePage({
  label,
  children,
  footer,
  growContent = true,
}: {
  label?: string;
  children: ReactNode;
  footer?: ReactNode;
  growContent?: boolean;
}) {
  return (
    <BlurStage>
      {(navigate) => (
        <div
          style={{
            background: "#fff",
            maxWidth: "2550px",
            margin: "0 auto",
            position: "relative",
            minHeight: growContent ? "100vh" : undefined,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <GridOverlay />
          <SiteNav navigate={navigate} />
          {/* Reserva el espacio del nav fijo */}
          <div style={{ height: "272px" }} />

          {/* Etiqueta de la página — sticky bajo el nav, en el margen izquierdo */}
          {label ? (
            <div style={{ position: "sticky", top: "50px", height: 0, zIndex: 40, paddingLeft: "36px" }}>
              <p
                style={{
                  ...sans,
                  fontSize: "12.295px",
                  lineHeight: 1.45,
                  color: "#000",
                  margin: 0,
                  whiteSpace: "nowrap",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </p>
            </div>
          ) : null}

          {/* Cuerpo en la rejilla de 12 (crece para empujar el pie abajo) */}
          <div
            style={{
              flex: growContent ? 1 : undefined,
              paddingLeft: "36px",
              paddingRight: "36px",
              paddingTop: "8px",
              display: "grid",
              gridTemplateColumns: "repeat(12, 1fr)",
              columnGap: "18px",
              alignContent: "start",
            }}
          >
            {children}
          </div>

          {footer ?? <SiteFooter marginTop="120px" />}
        </div>
      )}
    </BlurStage>
  );
}
