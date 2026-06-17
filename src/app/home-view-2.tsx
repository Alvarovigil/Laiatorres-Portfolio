"use client";

import type { CSSProperties } from "react";
import { BlurStage } from "@/components/blur-stage";
import { GridOverlay } from "@/components/grid-overlay";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { UNICA_MONO, UNICA_SANS } from "@/lib/unica";
import { videoEmbed } from "@/lib/video";

export type WorkMedia = { url: string; kind: "image" | "video"; videoMode: "ambient" | "player" };
export type WorkProject = { slug: string; name: string; category: string; year: string; media: WorkMedia[] };

const sans: CSSProperties = { fontFamily: UNICA_SANS, fontWeight: 400, fontStyle: "normal" };
const mono: CSSProperties = { fontFamily: UNICA_MONO, fontWeight: 400, fontStyle: "normal" };
const label: CSSProperties = { ...mono, fontSize: "11px", letterSpacing: "0.04em", color: "#a5a5a5", margin: 0 };

// Intro (calcada de la referencia, con nuestra copia + tipografía).
const INTRO =
  "Laia Torres es directora de arte y diseñadora gráfica afincada en Barcelona. Aporta claridad e intención a identidades visuales, dirección de arte y campañas — entre moda, belleza, hostelería y cultura.";

// Plantillas de composición por slots: cada slot coloca un medio (idx) en una
// columna (col) y fila (row) de la rejilla de 12, con un offset opcional (mt).
// Dos slots en la misma col y distinta row se apilan.
// aspect: si se define, la imagen se recorta a esa proporción (object-fit cover);
// si no, se muestra a su proporción natural (alto automático, sin recorte).
type Slot = { col: string; row?: number; mt?: number; idx: number; aspect?: string };
const TEMPLATES: Slot[][] = [
  // 0 — comp tipo "Good Bacteria" (Julia, 1er proyecto): grande/cuadrada a la
  //     izquierda (6 col), cuadrada a 2 col en el centro y alta a la derecha.
  //     idx = orden visual (1, 2, 3).
  [
    { col: "1 / 7", idx: 0, aspect: "1 / 1" },
    { col: "7 / 9", idx: 1, aspect: "1 / 1" },
    { col: "11 / 13", idx: 2 },
  ],
  // 1 — izquierda apilada (0 arriba, 2 abajo) + derecha desfasada (1).
  [
    { col: "1 / 6", row: 1, idx: 0 },
    { col: "1 / 6", row: 2, idx: 2 },
    { col: "7 / 13", row: 1, mt: 90, idx: 1 },
  ],
  // 2 — izquierda grande desfasada + derecha apilada (1 arriba, 2 abajo).
  [
    { col: "1 / 7", row: 1, mt: 110, idx: 0 },
    { col: "8 / 13", row: 1, idx: 1 },
    { col: "8 / 13", row: 2, idx: 2 },
  ],
];

function Media({ m, aspect }: { m: WorkMedia; aspect?: string }) {
  // Con aspect → recorte a esa proporción (cover); sin aspect → natural.
  const base: CSSProperties = aspect
    ? { width: "100%", aspectRatio: aspect, objectFit: "cover", display: "block" }
    : { width: "100%", height: "auto", display: "block" };
  if (m.kind === "video") {
    const embed = videoEmbed(m.url, "ambient");
    const vbox: CSSProperties = { ...base, aspectRatio: aspect ?? "4 / 5", objectFit: "cover", border: 0 };
    if (embed.type === "file") {
      return <video src={embed.src} style={vbox} playsInline autoPlay muted loop />;
    }
    return <iframe src={embed.src} style={vbox} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={m.url} alt="" style={base} />
  );
}

function Cluster({ p, tpl, baseNum, onOpen }: { p: WorkProject; tpl: Slot[]; baseNum: number; onOpen: () => void }) {
  return (
    <div style={{ marginBottom: "12vw" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          columnGap: "0px",
          rowGap: "24px",
          alignItems: "start",
        }}
      >
        {tpl.map((s, k) => {
          const m = p.media[s.idx];
          if (!m) return null;
          // Número en orden visual (sin mutar): nº de slots con medio hasta aquí.
          const num = baseNum + tpl.slice(0, k + 1).filter((ss) => p.media[ss.idx]).length;
          return (
            <div key={k} onClick={onOpen} style={{ gridColumn: s.col, gridRow: s.row ?? 1, marginTop: s.mt ? `${s.mt}px` : undefined, position: "relative", cursor: "pointer" }}>
              {/* TEMPORAL: número para referenciar las imágenes */}
              <span
                style={{
                  ...mono,
                  position: "absolute",
                  top: "8px",
                  left: "8px",
                  zIndex: 5,
                  background: "#000",
                  color: "#fff",
                  fontSize: "13px",
                  lineHeight: 1,
                  padding: "4px 7px",
                  borderRadius: "4px",
                }}
              >
                {num}
              </span>
              <Media m={m} aspect={s.aspect} />
              {/* Pie bajo la 1ª imagen del proyecto (de punta a punta de ella) */}
              {num === baseNum + 1 ? (
                <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", marginTop: "12px" }}>
                  <span style={{ ...sans, fontSize: "13px", color: "#000" }}>{p.name}</span>
                  {p.category ? <span style={label}>{p.category}</span> : null}
                  {p.year ? <span style={label}>{p.year}</span> : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HomeView2({ work }: { work: WorkProject[] }) {
  return (
    <BlurStage>
      {(navigate) => (
        <div
          style={{
            background: "#fff",
            maxWidth: "2550px",
            margin: "0 auto",
            position: "relative",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <GridOverlay gap="0px" lines />
          <SiteNav navigate={navigate} />
          <div style={{ height: "272px" }} />

          {/* Intro + etiqueta */}
          <div
            style={{
              flex: 1,
              paddingLeft: "18px",
              paddingRight: "18px",
              display: "grid",
              gridTemplateColumns: "repeat(12, 1fr)",
              columnGap: "0px",
              alignContent: "start",
            }}
          >
            <p style={{ ...sans, gridColumn: "1 / 8", fontSize: "clamp(18px, 1.55vw, 23px)", lineHeight: 1.4, color: "#000", margin: 0 }}>
              <span style={{ ...mono, fontSize: "11px", color: "#a5a5a5", verticalAlign: "2px", marginRight: "10px" }}>(Hola)</span>
              {INTRO}
            </p>

            <p style={{ ...label, gridColumn: "1 / 13", marginTop: "10vh", marginBottom: "5vh" }}>◖ Selected Work</p>

            {/* Clústeres de proyectos */}
            <div style={{ gridColumn: "1 / 13" }}>
              {(() => {
                let base = 0;
                return work.map((p, i) => {
                  const baseNum = base;
                  base += p.media.length;
                  return (
                    <Cluster
                      key={p.slug}
                      p={p}
                      tpl={TEMPLATES[i % TEMPLATES.length]}
                      baseNum={baseNum}
                      onOpen={() => navigate(`/project/${p.slug}`)}
                    />
                  );
                });
              })()}
            </div>
          </div>

          <SiteFooter marginTop="40px" />
        </div>
      )}
    </BlurStage>
  );
}
