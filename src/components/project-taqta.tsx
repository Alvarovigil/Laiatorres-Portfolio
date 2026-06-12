"use client";

import { useState } from "react";

// Ficha de proyecto estilo andreaarques.com/Taqta (Cargo):
//  · Mucho aire arriba; navbar (igual que la home) a media altura.
//  · Intro = "Servicios" (izq, bajo Laia) + "Sobre el proyecto" (texto, centro).
//  · Galería por SECCIONES (campañas). Cada sección tiene un separador en la
//    columna izquierda, a la altura de sus fotos. Al hacer scroll, cuando el
//    separador llega a "Laia Torres" se queda sticky debajo y se van apilando.
//  · Imágenes en mosaico a sangre (gutters pequeños), recortadas a su celda.

const label = "text-[10px] uppercase tracking-[0.08em] text-black/40";
const mono = "var(--font-geist-mono)";
const GUT = 8; // gutter del mosaico (px)
const STICK_BASE = 12; // offset del 1er separador respecto a la línea de Laia (px)
const STICK_STEP = 22; // separación al apilarse (px) = altura del separador

export type Credit = { label: string; value: string };
export type Block =
  | { type: "wide"; src: string; ratio?: number }
  | { type: "single"; src: string; ratio?: number }
  | { type: "pair"; src: [string, string]; ratio?: number };
export type Section = { label: string; blocks: Block[] };

function Cell({ src, ratio }: { src: string; ratio: number }) {
  return (
    <div style={{ aspectRatio: String(ratio) }} className="w-full overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-cover" />
    </div>
  );
}

function renderBlock(b: Block) {
  if (b.type === "wide") return <Cell src={b.src} ratio={b.ratio ?? 16 / 9} />;
  if (b.type === "single") return <Cell src={b.src} ratio={b.ratio ?? 4 / 5} />;
  return (
    <div className="grid grid-cols-2" style={{ gap: GUT }}>
      <Cell src={b.src[0]} ratio={b.ratio ?? 4 / 5} />
      <Cell src={b.src[1]} ratio={b.ratio ?? 4 / 5} />
    </div>
  );
}

export function ProjectTaqta({
  navigate,
  name,
  index,
  category,
  year,
  about,
  services,
  credits,
  sections,
  nextHref,
  nextLabel,
}: {
  navigate: (href: string) => void;
  name: string;
  index: string;
  category: string;
  year: string;
  about: string[];
  services: string[];
  credits: Credit[];
  sections: Section[];
  nextHref: string;
  nextLabel: string;
}) {
  const [grid, setGrid] = useState(false);

  // Aplanar bloques con su fila de grid; cada separador abarca desde el inicio
  // de su sección hasta el final (para quedarse sticky y apilarse).
  let row = 1;
  const blockRows: { b: Block; row: number }[] = [];
  const labelRows: { label: string; start: number; si: number }[] = [];
  sections.forEach((sec, si) => {
    labelRows.push({ label: sec.label, start: row, si });
    sec.blocks.forEach((b) => {
      blockRows.push({ b, row });
      row += 1;
    });
  });
  const lastRow = row; // exclusivo

  return (
    <div className="min-h-screen w-full bg-white px-6 pb-[140px] text-black/85">
      {/* Retícula de orientación — 12 columnas */}
      {grid && (
        <div className="pointer-events-none fixed inset-0 z-[60] flex gap-4 px-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="relative h-full flex-1 bg-[rgba(236,72,153,0.07)]">
              <span className="absolute left-1 top-1 text-[9px] text-pink-500/70" style={{ fontFamily: mono }}>
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => setGrid((g) => !g)}
        className={`fixed bottom-3 right-3 z-[61] rounded border border-neutral-300 bg-white/95 px-3 py-1.5 text-[11px] shadow-sm backdrop-blur hover:bg-neutral-100 ${grid ? "text-pink-600" : "text-black/60"}`}
        style={{ fontFamily: mono }}
      >
        Retícula
      </button>

      {/* Cabecera con meta — índice · nombre · categoría · año (fija arriba) */}
      <div className="fixed inset-x-0 top-0 z-50 px-6 pt-5" style={{ fontFamily: mono }}>
        <div className="grid grid-cols-12 items-baseline gap-4 text-[11px] uppercase tracking-[0.05em]">
          <div className="col-span-7 flex items-baseline gap-3">
            <span className="text-black/35">{index}</span>
            <span className="font-semibold text-black/80">{name}</span>
          </div>
          <div className="col-span-2 text-black/45">{category}</div>
          <div className="col-span-3 text-right text-black/45">{year}</div>
        </div>
        <div className="mt-4 h-px w-full bg-black/15" />
      </div>

      {/* Aire (deja sitio a la cabecera fija) */}
      <div className="h-[16vh]" />

      {/* Navbar igual que la home: Laia (izq) · proyecto (centro) · About (der) */}
      <div className="fixed inset-x-0 top-1/2 z-50 -translate-y-1/2 px-6" style={{ mixBlendMode: "difference", fontFamily: mono }}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/v2")}
            className="cursor-pointer border-none bg-transparent p-0 text-[11px] font-semibold uppercase tracking-[0.05em] text-white transition-opacity hover:opacity-50"
          >
            Laia Torres
          </button>
          <a href="#" className="text-[11px] font-semibold uppercase tracking-[0.05em] text-white transition-opacity hover:opacity-50">
            About
          </a>
        </div>
      </div>

      {/* Intro: servicios (izq) + sobre el proyecto (centro) */}
      <div className="mt-[40px] grid grid-cols-12 gap-4">
        <div className="col-start-1 col-span-3 text-[12px] leading-[1.7]" style={{ fontFamily: mono }}>
          <p className={label}>Servicios</p>
          <div className="mt-[1.8em]">
            {services.map((s, i) => (
              <p key={i}>{s}</p>
            ))}
          </div>
        </div>

        <div className="col-start-4 col-span-4">
          <p className={label}>Sobre el proyecto</p>
          <div className="mt-[1.8em] space-y-[1.1em] text-[13px] leading-[1.55]" style={{ fontFamily: "var(--font-sans)" }}>
            {about.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>

        <div className="col-start-9 col-span-4 text-[12px] leading-[1.7]" style={{ fontFamily: mono }}>
          <p className={label}>Créditos</p>
          <div className="mt-[1.8em]">
            {credits.map((c, i) => (
              <p key={i}>
                <span className="font-semibold">{c.label}:</span> <span className="text-black/55">{c.value}</span>
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Galería con separadores sticky que se apilan */}
      <div className="mt-[12vh] grid grid-cols-12 gap-x-4" style={{ rowGap: GUT }}>
        {/* Separadores (col 1-3), cada uno abarca hasta el final */}
        {labelRows.map(({ label: l, start, si }) => (
          <div key={`l${si}`} className="relative" style={{ gridColumn: "1 / 4", gridRow: `${start} / ${lastRow}` }}>
            <div
              className="sticky z-40 flex items-center bg-white"
              style={{ top: `calc(50vh + ${STICK_BASE + si * STICK_STEP}px)`, height: STICK_STEP, fontFamily: mono }}
            >
              <p className="text-[11px] font-normal uppercase tracking-[0.06em] text-black/55">{l}</p>
            </div>
          </div>
        ))}

        {/* Bloques de imágenes (col 4-12) */}
        {blockRows.map(({ b, row: r }, i) => (
          <div
            key={`b${i}`}
            style={{ gridColumn: b.type === "single" ? "4 / 9" : "4 / 13", gridRow: String(r) }}
          >
            {renderBlock(b)}
          </div>
        ))}
      </div>

      {/* Siguiente proyecto */}
      <div className="mt-[8vh] text-center">
        <button
          onClick={() => navigate(nextHref)}
          className="cursor-pointer border-none bg-transparent p-0 text-[clamp(18px,1.8vw,26px)] text-black/85 hover:opacity-50"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
