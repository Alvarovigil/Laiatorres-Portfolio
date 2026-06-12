"use client";

import { ArchiveChrome } from "@/components/archive-chrome";

// Ficha de proyecto con composición "broken grid" asimétrica. Las posiciones de
// los huecos (left/width/top en % del ancho, ratio = w/h) se diseñaron con el
// editor de composición. El patrón se repite (tila) para más imágenes.
const labelStrong = "text-[11px] uppercase tracking-[0.05em] text-black";

type Slot = { left: number; width: number; ratio: number; top: number };
const SLOTS: Slot[] = [
  { left: 19, width: 70, ratio: 3.9, top: 1 },
  { left: 28, width: 31.1, ratio: 0.72, top: 38.2 },
  { left: 52.2, width: 44.3, ratio: 1.03, top: 81.1 },
  { left: 28, width: 37.4, ratio: 1.14, top: 124 },
  { left: 52.2, width: 44.3, ratio: 1.03, top: 156.9 },
  { left: 28, width: 37.4, ratio: 0.87, top: 199.8 },
  { left: 43.5, width: 30.8, ratio: 0.78, top: 242.7 },
  { left: 60.1, width: 36.3, ratio: 0.81, top: 282.1 },
  { left: 28, width: 32.1, ratio: 0.72, top: 282.1 },
];
const UNIT = 330; // alto de un "ciclo" del patrón, en % del ancho

export type Credit = { label: string; value: string };

export function ProjectFicha({
  navigate,
  chromeCenter,
  chromeBottom,
  index,
  name,
  description,
  images,
  credits,
  nextHref,
  nextLabel,
}: {
  navigate: (href: string) => void;
  chromeCenter: string;
  chromeBottom: string;
  index: string;
  name: string;
  description: string;
  images: string[];
  credits: Credit[][]; // grupos de pares etiqueta/valor (líneas en blanco entre grupos)
  nextHref: string;
  nextLabel: string;
}) {
  // El primer hueco (SLOTS[0]) lo ocupa el TEXTO del proyecto. Las imágenes
  // empiezan en el hueco 2 (p = i + 1) y el patrón tila igual.
  const items = images.map((src, i) => {
    const p = i + 1;
    const s = SLOTS[p % SLOTS.length];
    const unit = Math.floor(p / SLOTS.length);
    const top = s.top + unit * UNIT;
    return { src, left: s.left, width: s.width, ratio: s.ratio, top, bottom: top + s.width / s.ratio };
  });
  const textSlot = SLOTS[0];
  const textBottom = textSlot.top + textSlot.width / textSlot.ratio;
  const maxBottom = items.reduce((m, it) => Math.max(m, it.bottom), textBottom);

  // Caja de las 2 últimas imágenes -> los créditos se alinean a su ancho.
  const last2 = items.slice(-2);
  const boxLeft = last2.length ? Math.min(...last2.map((i) => i.left)) : 5;
  const boxRight = last2.length ? Math.max(...last2.map((i) => i.left + i.width)) : 95;

  return (
    <div className="min-h-screen w-full bg-white">
      <ArchiveChrome onHome={() => navigate("/")} topCenter={chromeCenter} bottomCenter={chromeBottom} />

      <div className="px-[6px] pt-[120px]">
        {/* Composición: texto del proyecto en el hueco 1 + imágenes */}
        <div className="relative w-full" style={{ paddingTop: `${maxBottom}%` }}>
          <p className={`absolute left-[5px] top-0 z-10 ${labelStrong}`}>
            {index} / {name}
          </p>

          {/* Texto del proyecto (ocupa el espacio del hueco 1) */}
          <div className="absolute" style={{ left: `${textSlot.left}%`, top: `${(textSlot.top / maxBottom) * 100}%`, width: `${textSlot.width}%` }}>
            <p className="text-[13px] font-light leading-[1.6] text-black/85">{description}</p>
          </div>

          {items.map((it, i) => (
            <div key={i} className="absolute" style={{ left: `${it.left}%`, top: `${(it.top / maxBottom) * 100}%`, width: `${it.width}%` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.src} alt="" className="block w-full object-cover" style={{ aspectRatio: String(it.ratio) }} />
            </div>
          ))}
        </div>

        {/* Créditos — debajo de las 2 últimas imágenes, alineados a su mismo ancho.
            Etiqueta negra + valor gris a la izq · nombre del proyecto a la der. */}
        <section
          className="mt-[80px] flex items-start justify-between gap-8"
          style={{ marginLeft: `${boxLeft}%`, width: `${boxRight - boxLeft}%` }}
        >
          <div className="text-[12px] leading-[1.55]">
            {credits.map((group, gi) => (
              <div key={gi} className={gi > 0 ? "mt-[18px]" : ""}>
                {group.map((c, ci) => (
                  <p key={ci}>
                    <span className="text-black">{c.label}:</span> <span className="text-black/40">{c.value}</span>
                  </p>
                ))}
              </div>
            ))}
          </div>
          <p className="shrink-0 text-[11px] uppercase tracking-[0.05em] text-black">{name}</p>
        </section>

        {/* Siguiente proyecto */}
        <div className="py-[140px] text-center">
          <button
            onClick={() => navigate(nextHref)}
            className="cursor-pointer border-none bg-transparent p-0 text-[clamp(20px,2vw,28px)] font-light tracking-tight text-black/85 hover:opacity-50 transition-opacity"
          >
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
