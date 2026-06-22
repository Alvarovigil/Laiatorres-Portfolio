"use client";

import { useEffect, useState, type CSSProperties } from "react";
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
  "Directora de arte y diseñadora gráfica afincada en Barcelona. Con más de 8 años de experiencia, he trabajado con marcas de moda, belleza, hostelería y cultura y liderado equipos creativos, dando forma a identidades visuales, dirección de arte y campañas con claridad, intención y una sensibilidad atemporal.";

// Desfase vertical de la columna que va "más baja" en el ritmo escalonado.
const STAGGER = "160px";

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

// Una imagen de la pareja, en su mitad (1fr) de la banda, con su número de
// depuración opcional. La columna desfasada lleva marginTop = STAGGER.
function Half({ m, num, debug, offset, onOpen, caption }: { m: WorkMedia; num: number; debug: boolean; offset: boolean; onOpen: () => void; caption?: WorkProject }) {
  return (
    <div onClick={onOpen} style={{ position: "relative", cursor: "pointer", marginTop: offset ? STAGGER : undefined }}>
      {debug ? (
        <span style={{ ...mono, position: "absolute", top: "8px", left: "8px", zIndex: 5, background: "#000", color: "#fff", fontSize: "13px", lineHeight: 1, padding: "4px 7px", borderRadius: "4px" }}>
          {num}
        </span>
      ) : null}
      <Media m={m} />
      {/* Pie bajo la 1ª imagen del proyecto (de punta a punta de ella) */}
      {caption ? (
        <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", marginTop: "12px" }}>
          <span style={{ ...sans, fontSize: "13px", color: "#000", textTransform: "uppercase" }}>{caption.name}</span>
          {caption.category ? <span style={label}>{caption.category}</span> : null}
          {caption.year ? <span style={label}>{caption.year}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

// Pareja de imágenes a TODO el ancho, sobre las mismas 12 columnas y gutters
// que la página (repeat(12, 1fr), gutter 18px) para que los bordes caigan sobre
// las líneas del grid. Cada foto ocupa media página (6 columnas): izq 1–6 ·
// der 7–12, con el gutter central de 18px entre ellas. Alternamos qué columna
// va desfasada hacia abajo (mirror) → zigzag tipo Palau, pero más grande.
function Cluster({ p, baseNum, mirror, debug, onOpen }: { p: WorkProject; baseNum: number; mirror: boolean; debug: boolean; onOpen: () => void }) {
  const [a, b] = p.media;
  return (
    <div style={{ marginBottom: "12vw", display: "grid", gridTemplateColumns: "repeat(12, 1fr)", columnGap: "18px", alignItems: "start" }}>
      <div style={{ gridColumn: "1 / 7" }}>
        {a ? <Half m={a} num={baseNum + 1} debug={debug} offset={mirror} onOpen={onOpen} caption={p} /> : null}
      </div>
      <div style={{ gridColumn: "7 / 13" }}>
        {b ? <Half m={b} num={baseNum + 2} debug={debug} offset={!mirror} onOpen={onOpen} /> : null}
      </div>
    </div>
  );
}

export function HomeView2({ work }: { work: WorkProject[] }) {
  const [debug, setDebug] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDebug(new URLSearchParams(window.location.search).has("grid"));
  }, []);
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
          <GridOverlay lines />
          <SiteNav navigate={navigate} />
          <div style={{ height: "272px" }} />

          {/* Intro + etiqueta */}
          <div
            style={{
              flex: 1,
              paddingLeft: "36px",
              paddingRight: "36px",
              display: "grid",
              gridTemplateColumns: "repeat(12, 1fr)",
              columnGap: "18px",
              alignContent: "start",
            }}
          >
            <p style={{ ...sans, gridColumn: "1 / 9", fontSize: "clamp(18px, 1.55vw, 23px)", lineHeight: 1.4, color: "#000", margin: 0 }}>
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
                      mirror={i % 2 === 1}
                      baseNum={baseNum}
                      debug={debug}
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
