"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Editor TEMPORAL de composición para la ficha de proyecto.
// - Arrastra el cuerpo para mover · esquina azul para redimensionar.
// - SNAP tipo Illustrator (guías inteligentes): los bordes enganchan a los bordes
//   y centros de OTROS rectángulos, y el tamaño engancha al ancho/alto de otro
//   (para dejarlas iguales y pegadas). Movimiento libre el resto del tiempo.
// - Rejilla de 16 columnas: solo referencia visual (no engancha).
// Exporta:  { left, width, ratio, top }  en % del ancho.

const COLS = 16;
const MARGIN = 18; // px
const GUTTER = 18; // px
const TH = 7; // px, umbral de enganche

const SEED = [
  { left: 19, width: 70, ratio: 3.9, top: 1 },
  { left: 2, width: 46.5, ratio: 1.33, top: 38 },
  { left: 51.5, width: 46.3, ratio: 1.33, top: 38 },
  { left: 41, width: 48.5, ratio: 1.13, top: 77 },
  { left: 2, width: 41, ratio: 1.18, top: 126 },
  { left: 28, width: 40, ratio: 0.91, top: 163 },
  { left: 35.5, width: 32, ratio: 0.66, top: 211 },
  { left: 24, width: 34, ratio: 1.13, top: 264 },
  { left: 2, width: 36.5, ratio: 1.0, top: 299 },
  { left: 39, width: 50.5, ratio: 1.03, top: 294 },
];

type R = { x: number; y: number; w: number; h: number }; // fracciones del ancho
type Box = { x: number; y: number; w: number; h: number }; // px

const round = (n: number, d = 1) => Math.round(n * 10 ** d) / 10 ** d;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

// Engancha la posición de un eje: prueba los bordes activos (offs) contra las
// líneas candidatas; devuelve la nueva coordenada y la línea que casó (para guía).
function snapAxis(coord: number, offs: number[], lines: number[]): { v: number; line: number | null } {
  let best = TH + 1;
  let v = coord;
  let line: number | null = null;
  for (const off of offs) for (const L of lines) {
    const dd = Math.abs(coord + off - L);
    if (dd < best) {
      best = dd;
      v = L - off;
      line = L;
    }
  }
  return best <= TH ? { v, line } : { v: coord, line: null };
}

// Engancha un tamaño: borde móvil a líneas (edges) o el tamaño al de otro (sizes).
function snapSize(origin: number, size: number, lines: number[], sizes: number[]): { size: number; line: number | null } {
  let best = TH + 1;
  let s = size;
  let line: number | null = null;
  for (const L of lines) {
    const dd = Math.abs(origin + size - L);
    if (dd < best) {
      best = dd;
      s = L - origin;
      line = L;
    }
  }
  for (const sz of sizes) {
    const dd = Math.abs(size - sz);
    if (dd < best) {
      best = dd;
      s = sz;
      line = null;
    }
  }
  return best <= TH ? { size: s, line } : { size, line: null };
}

function seedRects(n: number): R[] {
  return Array.from({ length: n }, (_, i) => {
    const s = SEED[i % SEED.length];
    const unit = Math.floor(i / SEED.length);
    return { x: s.left / 100, y: (s.top + unit * 345) / 100, w: s.width / 100, h: s.width / s.ratio / 100 };
  });
}

export function CompositionEditor({ images, storageKey = "compo-editor" }: { images: string[]; storageKey?: string }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(0);
  const [rects, setRects] = useState<R[]>(() => seedRects(images.length));
  const [sel, setSel] = useState<number | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [snap, setSnap] = useState(true);
  const [guide, setGuide] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });
  const drag = useRef<null | { i: number; mode: "move" | "resize"; px: number; py: number; start: R }>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setRects(JSON.parse(raw));
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(rects));
    } catch {}
  }, [rects, storageKey]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const update = () => setW(el.clientWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const onPointerDown = (e: React.PointerEvent, i: number, mode: "move" | "resize") => {
    e.stopPropagation();
    e.preventDefault();
    setSel(i);
    drag.current = { i, mode, px: e.clientX, py: e.clientY, start: { ...rects[i] } };
  };

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d || !W) return;
      const dx = e.clientX - d.px;
      const dy = e.clientY - d.py;

      setRects((rs) => {
        const others: Box[] = rs.filter((_, i) => i !== d.i).map((o) => ({ x: o.x * W, y: o.y * W, w: o.w * W, h: o.h * W }));
        // líneas candidatas de otros (px)
        const xLines = [0, W];
        const yLines = [0];
        const wSizes: number[] = [];
        const hSizes: number[] = [];
        others.forEach((o) => {
          xLines.push(o.x, o.x + o.w, o.x + o.w / 2);
          yLines.push(o.y, o.y + o.h, o.y + o.h / 2);
          wSizes.push(o.w);
          hSizes.push(o.h);
        });

        let gx: number | null = null;
        let gy: number | null = null;

        const next = rs.map((r, i) => {
          if (i !== d.i) return r;
          if (d.mode === "move") {
            let X = d.start.x * W + dx;
            let Y = d.start.y * W + dy;
            const w = r.w * W;
            const h = r.h * W;
            if (snap) {
              const sx = snapAxis(X, [0, w, w / 2], xLines);
              const sy = snapAxis(Y, [0, h, h / 2], yLines);
              X = sx.v;
              Y = sy.v;
              gx = sx.line;
              gy = sy.line;
            }
            return { ...r, x: clamp(X / W, 0, 1 - r.w), y: Math.max(0, Y / W) };
          }
          // resize: origen fijo, mueve borde der/inf
          const ox = r.x * W;
          const oy = r.y * W;
          let w = d.start.w * W + dx;
          let h = d.start.h * W + dy;
          if (snap) {
            const sw = snapSize(ox, w, xLines, wSizes);
            const sh = snapSize(oy, h, yLines, hSizes);
            w = sw.size;
            h = sh.size;
            gx = sw.line;
            gy = sh.line;
          }
          return { ...r, w: clamp(w / W, 0.03, 1 - r.x), h: Math.max(0.03, h / W) };
        });

        setGuide({ x: gx, y: gy });
        return next;
      });
    };
    const up = () => {
      drag.current = null;
      setGuide({ x: null, y: null });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [W, snap]);

  const maxBottom = rects.reduce((m, r) => Math.max(m, r.y + r.h), 0);
  const canvasH = W ? (maxBottom + 0.25) * W : 0;

  const exported = rects.map((r) => ({ left: round(r.x * 100), width: round(r.w * 100), ratio: round(r.w / r.h, 2), top: round(r.y * 100) }));
  const json = JSON.stringify(exported);

  const addRect = () => setRects((rs) => [...rs, { x: 0, y: maxBottom + 0.05, w: 0.375, h: 0.28 }]);
  const removeRect = () => setRects((rs) => rs.slice(0, -1));
  const reset = () => setRects(seedRects(images.length));
  const copy = useCallback(() => navigator.clipboard?.writeText(json), [json]);

  return (
    <div className="min-h-screen w-full bg-white">
      <div ref={canvasRef} className="relative mx-auto w-full" style={{ height: canvasH, marginTop: 80 }} onPointerDown={() => setSel(null)}>
        {/* Rejilla de 16 columnas — solo referencia visual (margen 18, gutter 18, C6C6C6 10%) */}
        {showGrid && (
          <div className="pointer-events-none absolute inset-0 flex" style={{ paddingLeft: MARGIN, paddingRight: MARGIN, gap: GUTTER }}>
            {Array.from({ length: COLS }).map((_, i) => (
              <div key={i} className="flex-1" style={{ background: "rgba(198,198,198,0.10)" }} />
            ))}
          </div>
        )}

        {/* Guías de enganche */}
        {guide.x != null && <div className="pointer-events-none absolute bottom-0 top-0 z-40" style={{ left: guide.x, width: 1, background: "#ec4899" }} />}
        {guide.y != null && <div className="pointer-events-none absolute left-0 right-0 z-40" style={{ top: guide.y, height: 1, background: "#ec4899" }} />}

        {rects.map((r, i) => (
          <div
            key={i}
            onPointerDown={(e) => onPointerDown(e, i, "move")}
            className="absolute cursor-move select-none"
            style={{
              left: `${r.x * 100}%`,
              top: W ? r.y * W : 0,
              width: `${r.w * 100}%`,
              height: W ? r.h * W : 0,
              outline: sel === i ? "2px solid #2563eb" : "1px solid rgba(0,0,0,0.25)",
              outlineOffset: -1,
              touchAction: "none",
            }}
          >
            {images[i] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={images[i]} alt="" className="pointer-events-none h-full w-full object-cover" draggable={false} />
            ) : (
              <div className="h-full w-full bg-neutral-200" />
            )}
            <span className="pointer-events-none absolute left-1 top-1 bg-black/70 px-1 text-[10px] text-white">{i + 1}</span>
            <div onPointerDown={(e) => onPointerDown(e, i, "resize")} className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize bg-blue-600" style={{ touchAction: "none" }} />
          </div>
        ))}
      </div>

      {/* Panel de control fijo */}
      <div className="fixed bottom-3 right-3 z-50 w-[360px] rounded-md border border-neutral-300 bg-white/95 p-3 text-[12px] shadow-lg backdrop-blur">
        <div className="mb-2 flex items-center gap-2">
          <strong>Editor de compo</strong>
          <span className="text-neutral-500">{rects.length} rects</span>
        </div>
        <div className="mb-2 flex flex-wrap gap-1">
          <button onClick={addRect} className="rounded border border-neutral-300 px-2 py-1 hover:bg-neutral-100">+ Añadir</button>
          <button onClick={removeRect} className="rounded border border-neutral-300 px-2 py-1 hover:bg-neutral-100">− Quitar</button>
          <button onClick={reset} className="rounded border border-neutral-300 px-2 py-1 hover:bg-neutral-100">Reset</button>
          <button onClick={() => setShowGrid((g) => !g)} className={`rounded border border-neutral-300 px-2 py-1 hover:bg-neutral-100 ${showGrid ? "bg-blue-50 text-blue-700" : ""}`}>Grid</button>
          <button onClick={() => setSnap((s) => !s)} className={`rounded border border-neutral-300 px-2 py-1 hover:bg-neutral-100 ${snap ? "bg-blue-50 text-blue-700" : ""}`}>Snap</button>
          <button onClick={copy} className="rounded bg-blue-600 px-2 py-1 text-white hover:bg-blue-700">Copiar JSON</button>
        </div>
        <textarea readOnly value={json} className="h-28 w-full resize-none rounded border border-neutral-200 bg-neutral-50 p-2 font-mono text-[10px] leading-tight" onFocus={(e) => e.currentTarget.select()} />
        <p className="mt-1 text-[10px] leading-tight text-neutral-500">Snap: enganche a bordes/centros y al tamaño de otros rectángulos (guías rosas). Cuando esté perfecto, Copiar y pégamelo.</p>
      </div>
    </div>
  );
}
