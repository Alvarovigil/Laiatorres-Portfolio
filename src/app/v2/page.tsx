"use client";

// HOME V2 — réplica de la plantilla Cargo "Untitled (Profile)"
// (https://352785-a.cargo.site/). Ruta independiente: NO toca la home actual.
//
// Sistema de la plantilla:
//  · Tipo mono (allí Monument Grotesk Mono → aquí Geist Mono), peso light, ~13px,
//    line-height 1.2, color rgba(0,0,0,.85), sin tracking.
//  · Columna única centrada de imágenes; cada una con su caption centrado debajo
//    (≈4em de aire). Etiquetas fijas en las 4 esquinas (PROJECT 001/002/003).
//  · Bloque de perfil al final: retrato a la izquierda + contacto/bio y CV
//    (Educación / Solo Shows / Group Shows) a la derecha.

import { BlurStage } from "@/components/blur-stage";

const V = "/projects/verano-2025";
const N = "/projects/navidad-2024";
const M = "/projects/dia-de-la-madre-2025";
const B = "/projects/back-to-beauty-2025";
const S = "/projects/smyl";

// Pila central de imágenes con su pie de foto (3 líneas, centrado).
type Shot = { src: string; caption: string[] };
const shots: Shot[] = [
  { src: `${V}/01-w.jpg`, caption: ["Julia Perfumeries", "Campaña Verano — 2025", "Dirección de arte"] },
  { src: `${N}/01-w.jpg`, caption: ["Julia Perfumeries", "Campaña Navidad — 2024", "Dirección de arte, Barcelona"] },
  { src: `${S}/7464a093706a54a56e7c77599de6e88e0558040c.png`, caption: ["SMYL", "Identidad visual — 2024", "Dirección creativa"] },
  { src: `${B}/01-w.jpg`, caption: ["Julia Perfumeries", "Campaña Back to Beauty — 2025", "Dirección de arte"] },
  { src: `${M}/01-w.jpg`, caption: ["Julia Perfumeries", "Campaña Día de la Madre — 2025", "Dirección de arte"] },
  { src: `${S}/c0987069fa8c019189de1cf31be3486ee3bd9967.png`, caption: ["SMYL", "Sistema gráfico — 2024", "Diseño y aplicaciones"] },
  { src: `${V}/02-w.jpg`, caption: ["Julia Perfumeries", "Campaña Verano — 2025", "Contenido para redes"] },
  { src: `${N}/03-w.jpg`, caption: ["Julia Perfumeries", "Campaña Navidad — 2024", "Dirección de arte"] },
];

const SOCIAL = ["LinkedIn", "Instagram"];
const cTxt = "text-[11px] uppercase tracking-[0.05em] text-white";
const cSub = "text-[11px] uppercase tracking-[0.05em] text-white/55";
const cLink = "text-[11px] uppercase tracking-[0.05em] text-white hover:opacity-50 transition-opacity";

const bio =
  "Laia Torres es directora de arte. Trabaja la identidad visual, la dirección de arte y el diseño gráfico de marca, traduciendo cada proyecto a su propia atmósfera con un tratamiento coherente de la luz, el producto y la composición.";

// Bloques del CV (se reparten en columnas como en la plantilla).
const education = [
  ["Grado en Diseño Gráfico", "Escuela de Diseño", "2019"],
  ["Dirección de Arte Publicitaria", "Programa de especialización", "2020"],
];
const soloShows = [
  ["Julia Perfumeries", "Campañas estacionales,", "Barcelona", "2024–2025"],
  ["SMYL", "Identidad visual,", "Grillz & joyas dentales", "2024"],
];
const groupShows = [
  ["Back to Beauty", "Julia Perfumeries,", "Campaña de temporada", "2025"],
  ["Día de la Madre", "Julia Perfumeries,", "Contenido editorial", "2025"],
  ["Navidad", "Julia Perfumeries,", "Dirección de arte", "2024"],
];

function Group({ rows }: { rows: string[][] }) {
  return (
    <div className="space-y-[1.5em]">
      {rows.map((lines, i) => (
        <div key={i}>
          {lines.map((l, j) => (
            <p key={j} className={j === 0 ? "font-semibold" : undefined}>
              {l}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function HomeV2() {
  return (
    <BlurStage>
      {(navigate) => (
        <main
          className="relative min-h-screen w-full bg-white font-normal text-black/85"
          style={{ fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.4 }}
        >
          {/* Meta en las esquinas de arriba */}
          <div className="fixed inset-x-0 top-0 z-50 flex items-start justify-between px-6 py-4 opacity-50" style={{ mixBlendMode: "difference", fontFamily: "var(--font-geist-mono)" }}>
            <span className={cSub}>Art Direction</span>
            <div className="text-right leading-[1.45]">
              <span className={`block ${cTxt}`}>Selected Work</span>
              <span className={`block ${cSub}`}>2024 — 2025</span>
            </div>
          </div>

          {/* Navbar horizontal a media altura — nombre · secciones · contacto */}
          <div className="fixed inset-x-0 top-1/2 z-50 -translate-y-1/2 px-6" style={{ mixBlendMode: "difference", fontFamily: "var(--font-geist-mono)" }}>
            <div className="flex items-center justify-between">
              <button onClick={() => navigate("/")} className={`cursor-pointer border-none bg-transparent p-0 font-semibold ${cTxt} hover:opacity-50 transition-opacity`}>
                Laia Torres
              </button>
              <a href="#" className={`font-semibold ${cLink}`}>About</a>
            </div>
          </div>

          <div className="fixed inset-x-0 bottom-0 z-50 flex items-end justify-between px-6 py-4 opacity-50" style={{ mixBlendMode: "difference", fontFamily: "var(--font-geist-mono)" }}>
            <div className="leading-[1.45]">
              <span className={`block ${cTxt}`}>© 2025</span>
              <span className={`block ${cSub}`}>Barcelona, ES</span>
            </div>
            <div className="flex flex-col items-end leading-[1.45]">
              {SOCIAL.map((l) => (
                <a key={l} href="#" className={cLink}>
                  {l}
                </a>
              ))}
            </div>
          </div>

          {/* Pila central de imágenes */}
          <div className="flex flex-col items-center px-4 pt-[120px]">
            {shots.map((s, i) => (
              <figure
                key={i}
                onClick={() => navigate("/v2/project/julia-perfumeries")}
                className="mb-[120px] flex cursor-pointer flex-col items-center text-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.src}
                  alt={s.caption.join(" — ")}
                  className="block h-auto w-auto max-h-[72vh] max-w-[82vw] object-contain transition-opacity hover:opacity-80"
                />
                <figcaption className="mt-[3.4em]">
                  {s.caption.map((l, j) => (
                    <p key={j}>{l}</p>
                  ))}
                </figcaption>
              </figure>
            ))}
          </div>

          {/* Bloque de perfil — retrato a la izquierda · contacto/bio + CV a la derecha */}
          <section className="flex gap-8 px-4 pb-[140px] pt-[40px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/profile/laia.jpg"
              alt="Laia Torres"
              className="aspect-[3/4] w-[180px] shrink-0 self-start object-cover"
            />

            <div
              className="ml-auto w-full max-w-[56%] leading-[1.5]"
              style={{ fontFamily: "var(--font-geist-mono)", fontSize: 13 }}
            >
              {/* Contacto */}
              <div>
                <p>Directora de arte</p>
                <a href="mailto:hola@laiatorres.com" className="block font-semibold text-black/85 no-underline hover:opacity-70">
                  hola@laiatorres.com
                </a>
                <a
                  href="https://instagram.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="block font-semibold text-black/85 no-underline hover:opacity-70"
                >
                  Instagram
                </a>
              </div>

              {/* Bio */}
              <p className="mt-[2em] max-w-[34em]">{bio}</p>

              {/* Educación */}
              <div className="mt-[4em]">
                <p className="font-semibold">Educación</p>
                <div className="mt-[1.6em]">
                  <Group rows={education} />
                </div>
              </div>

              {/* Solo Shows · Group Shows en dos columnas */}
              <div className="mt-[4em] flex gap-10">
                <div className="w-[14em] shrink-0">
                  <p className="font-semibold">Proyectos</p>
                  <div className="mt-[1.6em]">
                    <Group rows={soloShows} />
                  </div>
                </div>
                <div className="w-[14em] shrink-0">
                  <p className="font-semibold">Campañas</p>
                  <div className="mt-[1.6em]">
                    <Group rows={groupShows} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}
    </BlurStage>
  );
}
