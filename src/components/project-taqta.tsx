"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { Collab, ImageAlign, VideoMode } from "@/db/schema";
import { videoEmbed } from "@/lib/video";

// Ficha de proyecto V3 (rediseño "Refinar al detalle").
//  · Lienzo a ancho completo (tope 2550px) centrado, mucho aire.
//  · Cabecera: etiqueta del proyecto en el margen izquierdo · servicios
//    (alineados a la derecha del sidebar) · descripción a la derecha.
//  · Galería: rejilla de 2 columnas (1fr · 47px · 1fr) con celdas de 590px de
//    alto recortadas a cover. Cada bloque ocupa una fila: "pair" llena ambas
//    columnas, "single" una sola (izq/der, la otra queda vacía → ritmo
//    escalonado) y "wide" ocupa todo el ancho.
//  · Pie: agencia/producción + siguiente proyecto, colabs, navegación y redes.

export type Credit = { label: string; value: string };
export type Media = { url: string; kind: "image" | "video"; videoMode: VideoMode; alt?: string };
export type Block =
  | { type: "wide"; media: Media; ratio?: number }
  | { type: "single"; media: Media; ratio?: number; align?: ImageAlign }
  | { type: "pair"; media: [Media, Media]; ratio?: number };
export type Section = { label: string; blocks: Block[] };

// Retícula de 12 columnas del diseño (Figma): margen y gutter de 18px.
const GRID_MARGIN = 18;
const GRID_GUTTER = 18;
// Apilado sticky en el margen izquierdo: el nombre del proyecto se pega arriba
// y las secciones se van acumulando debajo de él.
const NAME_TOP = 50; // a la altura a la que se pega el nombre (PALAU FUGIT)
const SECTION_BASE = 72; // primera sección, justo bajo el nombre
const SECTION_STEP = 22; // separación al apilarse

const SANS = "var(--font-unica), 'Helvetica Neue', Arial, sans-serif";
const MONO = "var(--font-unica-mono), ui-monospace, monospace";
const sans: CSSProperties = { fontFamily: SANS, fontWeight: 400, fontStyle: "normal" };
const sansLight: CSSProperties = { fontFamily: SANS, fontWeight: 300, fontStyle: "normal" };
const mono: CSSProperties = { fontFamily: MONO, fontWeight: 400, fontStyle: "normal" };

const NAV = ["HOME", "ABOUT ME", "CONTACT"];

// Las imágenes no se recortan: ocupan el 100% del ancho de su hueco y el alto
// es automático (su proporción natural), así escalan en el responsive.
function Cell({ media }: { media: Media }) {
  if (media.kind === "video") return <VideoCell media={media} />;
  return (
    // next/image no aporta aquí; usamos <img> con alto automático (sin recorte).
    // eslint-disable-next-line @next/next/no-img-element
    <img src={media.url} alt={media.alt ?? ""} style={{ width: "100%", height: "auto", display: "block" }} />
  );
}

function VideoCell({ media }: { media: Media }) {
  const embed = videoEmbed(media.url, media.videoMode);
  // El vídeo embebido no expone su proporción; usamos 16/9 (ancho completo).
  const style: CSSProperties = { width: "100%", aspectRatio: "16 / 9", display: "block", border: 0 };
  if (embed.type === "file") {
    return (
      <video
        src={embed.src}
        style={style}
        playsInline
        controls={!embed.ambient}
        autoPlay={embed.ambient}
        muted={embed.ambient}
        loop={embed.ambient}
      />
    );
  }
  return (
    <iframe
      src={embed.src}
      style={style}
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
    />
  );
}

export function ProjectTaqta({
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
  // Aplanamos los bloques de todas las secciones; cada bloque es una fila.
  // Aplanamos los bloques asignando a cada uno su fila de la rejilla, y
  // anotamos en qué fila empieza cada sección (para los separadores sticky).
  // Cada separador abarca desde su fila hasta el final, así se queda pegado y
  // se va apilando bajo el nombre del proyecto.
  let _row = 1;
  const blockRows: { b: Block; row: number }[] = [];
  const labelRows: { label: string; start: number }[] = [];
  sections.forEach((sec) => {
    if (sec.label) labelRows.push({ label: sec.label, start: _row });
    sec.blocks.forEach((b) => {
      blockRows.push({ b, row: _row });
      _row += 1;
    });
  });
  const lastRow = _row; // exclusivo

  // Retícula de depuración: oculta por defecto, solo visible con ?grid en la URL.
  const [grid, setGrid] = useState(false);
  useEffect(() => {
    // Sync único con la URL al montar (debug ?grid); seguro para hidratación.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGrid(new URLSearchParams(window.location.search).has("grid"));
  }, []);

  return (
    <div style={{ background: "#fff", maxWidth: "2550px", margin: "0 auto", position: "relative" }}>
      {grid ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${GRID_MARGIN}px`,
            right: `${GRID_MARGIN}px`,
            zIndex: 60,
            pointerEvents: "none",
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            columnGap: `${GRID_GUTTER}px`,
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ background: "rgba(198,198,198,0.10)" }} />
          ))}
        </div>
      ) : null}
      {/* ── Navegación (fija arriba) ────────────────────────────────── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: "2550px",
          zIndex: 50,
          mixBlendMode: "exclusion",
          display: "flex",
          alignItems: "flex-start",
          paddingTop: "24px",
          paddingBottom: "20px",
          paddingLeft: "18px",
          paddingRight: `${GRID_MARGIN}px`,
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            ...sans,
            fontSize: "17.45px",
            lineHeight: 1.45,
            color: "#fff",
            whiteSpace: "nowrap",
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
        >
          Laia Torres
        </button>
        <div style={{ marginLeft: "auto", display: "flex", gap: "56px", paddingTop: "1px" }}>
          {NAV.map((item) => (
            <button
              key={item}
              onClick={() => (item === "HOME" ? navigate("/") : undefined)}
              style={{
                ...sans,
                fontSize: "12.235px",
                lineHeight: 1.45,
                color: "#fff",
                whiteSpace: "nowrap",
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </nav>
      {/* Reserva el espacio del nav fijo (mismo alto que tenía: 272px). */}
      <div style={{ height: "272px" }} />

      {/* ── Nombre del proyecto — sticky al chocar con el nav ───────── */}
      {/* height:0 para no empujar el layout; el contenedor padre (root) abarca
          toda la página, así se mantiene pegado durante todo el scroll. */}
      <div style={{ position: "sticky", top: `${NAME_TOP}px`, height: 0, zIndex: 40, paddingLeft: "18px" }}>
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
          {name}
        </p>
      </div>

      {/* ── Cabecera del proyecto ───────────────────────────────────── */}
      <div style={{ marginBottom: "80px" }}>
        <div
          style={{
            paddingLeft: `${GRID_MARGIN}px`,
            paddingRight: `${GRID_MARGIN}px`,
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            columnGap: `${GRID_GUTTER}px`,
          }}
        >
          {/* Servicios — alineados a la derecha de la columna 3 (cols 1–3) */}
          <div style={{ gridColumn: "1 / 4" }}>
            <p
              style={{
                ...mono,
                fontSize: "10.881px",
                lineHeight: 1.45,
                color: "#a5a5a5",
                textAlign: "right",
                letterSpacing: "0.109px",
                margin: 0,
              }}
            >
              {services.map((s, i) => (
                <span key={i}>
                  {s}
                  {i < services.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
          </div>

          {/* Descripción — columnas 4–12 */}
          <div style={{ gridColumn: "4 / 13", maxWidth: "836px" }}>
            {about.map((p, i) => (
              <p
                key={i}
                style={{
                  ...sans,
                  fontSize: "18.88px",
                  lineHeight: 1.23,
                  color: "#000",
                  margin: i === 0 ? 0 : "0.9em 0 0",
                }}
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* ── Galería ─────────────────────────────────────────────────── */}
      {/* Rejilla de 12: separadores de sección en cols 1–3 (sticky, se apilan)
          e imágenes en cols 4–12 (dos mitades pegadas). */}
      <div
        style={{
          paddingLeft: `${GRID_MARGIN}px`,
          paddingRight: `${GRID_MARGIN}px`,
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          columnGap: `${GRID_GUTTER}px`,
        }}
      >
        {/* Separadores de sección — apilados bajo el nombre del proyecto */}
        {labelRows.map(({ label: l, start }, si) => (
          <div key={`sec-${si}`} style={{ gridColumn: "1 / 4", gridRow: `${start} / ${lastRow}` }}>
            <div
              style={{
                ...sans,
                position: "sticky",
                top: `${SECTION_BASE + si * SECTION_STEP}px`,
                zIndex: 30,
                fontSize: "12.295px",
                lineHeight: 1.45,
                color: "#a5a5a5",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {l}
            </div>
          </div>
        ))}

        {/* Filas de imágenes (cols 4–12) */}
        {blockRows.map(({ b, row }, i) => (
          <div key={`b-${i}`} style={{ gridColumn: "4 / 13", gridRow: row }}>
            {b.type === "wide" ? (
              <Cell media={b.media} />
            ) : b.type === "pair" ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "start" }}>
                <Cell media={b.media[0]} />
                <Cell media={b.media[1]} />
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "start" }}>
                {b.align === "right" ? <div /> : null}
                <Cell media={b.media} />
                {b.align !== "right" ? <div /> : null}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Pie: agencia + siguiente (mismo tramo que la galería: col 4→12) ── */}
      <div
        style={{
          paddingLeft: `${GRID_MARGIN}px`,
          paddingRight: `${GRID_MARGIN}px`,
          paddingTop: "24px",
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          columnGap: `${GRID_GUTTER}px`,
        }}
      >
        <div style={{ gridColumn: "4 / 13", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "24px" }}>
          {agency ? (
            <p style={{ ...mono, fontSize: "10.881px", lineHeight: 1.45, color: "#000", margin: 0 }}>
              Agency and production: <span style={{ color: "#a5a5a5" }}>{agency}</span>
            </p>
          ) : (
            <span />
          )}
          <button
            onClick={() => navigate(nextHref)}
            style={{
              ...mono,
              fontSize: "10.881px",
              lineHeight: 1.45,
              color: "#000",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            → SIGUIENTE PROYECTO
          </button>
        </div>
      </div>

      {/* ── Pie: colabs (alineado con Agency: columna 4) ────────────── */}
      {collabs.length ? (
        <div
          style={{
            paddingLeft: `${GRID_MARGIN}px`,
            paddingRight: `${GRID_MARGIN}px`,
            marginTop: "32px",
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            columnGap: `${GRID_GUTTER}px`,
          }}
        >
          <div style={{ gridColumn: "4 / 13" }}>
            <p style={{ ...mono, fontSize: "10.881px", lineHeight: 1.26, color: "#000", margin: 0 }}>Collabs:</p>
            {collabs.map(({ handle, href }) => (
              <a
                key={handle}
                href={href}
                target="_blank"
                rel="noreferrer"
                style={{
                  ...mono,
                  display: "block",
                  fontSize: "10.881px",
                  lineHeight: 1.26,
                  color: "#a5a5a5",
                  textDecoration: "underline",
                }}
              >
                {handle}
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {/* ── Pie: contacto (enmedio) ─────────────────────────────────── */}
      <div
        style={{
          marginTop: "120px",
          paddingLeft: `${GRID_MARGIN}px`,
          paddingRight: `${GRID_MARGIN}px`,
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          columnGap: `${GRID_GUTTER}px`,
        }}
      >
        <div style={{ gridColumn: "4 / 13" }}>
          <p style={{ ...sans, fontSize: "18.88px", lineHeight: 1.23, color: "#000", margin: 0 }}>
            Si quieres ver más proyectos, <span style={{ textDecoration: "underline" }}>contacta conmigo</span>.
          </p>
        </div>
      </div>

      {/* ── Pie: redes (al final del contenido) ─────────────────────── */}
      <div
        style={{
          marginTop: "120px",
          mixBlendMode: "exclusion",
          paddingLeft: `${GRID_MARGIN}px`,
          paddingRight: `${GRID_MARGIN}px`,
          paddingBottom: "48px",
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          columnGap: `${GRID_GUTTER}px`,
        }}
      >
        {/* Columna 1 — bloque aparte */}
        <div style={{ gridColumn: "1 / 2" }}>
          <p style={{ ...sansLight, fontSize: "12.235px", lineHeight: 1.19, color: "#fff", margin: 0, whiteSpace: "nowrap" }}>
            Laia Torres
          </p>
        </div>
        {/* Columna 4 — redes (como estaban) */}
        <div style={{ gridColumn: "4 / 9" }}>
          <p style={{ ...sansLight, fontSize: "12.235px", lineHeight: 1.19, color: "#fff", margin: 0 }}>
            <a href="#" style={{ color: "#fff", textDecoration: "underline" }}>
              Linkedin
            </a>
            <br />
            <a href="#" style={{ color: "#fff", textDecoration: "underline" }}>
              Instagram
            </a>
          </p>
        </div>
        {/* Última columna (12) — alineado a la derecha */}
        <div style={{ gridColumn: "12 / 13", textAlign: "right" }}>
          <p style={{ ...sansLight, fontSize: "12.235px", lineHeight: 1.19, color: "#fff", margin: 0, whiteSpace: "nowrap" }}>
            © 2024
          </p>
        </div>
      </div>
    </div>
  );
}
