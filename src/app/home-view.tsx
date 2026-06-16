"use client";

import { ArchiveChrome } from "@/components/archive-chrome";
import { BlurStage } from "@/components/blur-stage";
import { SiteNav } from "@/components/site-nav";

export type HomeCard = { slug: string; name: string; cover: string };

// Ritmo editorial asimétrico que se repite para cualquier número de proyectos:
// anchos y sangrías alternas (% del lienzo). Flujo normal (sin solapes).
const SLOTS = [
  { width: "56%", ml: "0%" },
  { width: "38%", ml: "60%" },
  { width: "46%", ml: "14%" },
  { width: "42%", ml: "52%" },
];

export function HomeView({ cards }: { cards: HomeCard[] }) {
  return (
    <BlurStage>
      {(navigate) => (
        <div className="min-h-screen w-full bg-white">
          {/* Mismo navbar que las fichas de proyecto */}
          <SiteNav navigate={navigate} />
          <ArchiveChrome showTop={false} bottomCenter="Selected Work — 2024 / 2025" />

          <div className="px-[6px] pb-[140px] pt-[120px]">
            {cards.length === 0 ? (
              <p className="pt-[20vh] text-center text-[12px] uppercase tracking-[0.05em] text-black/40">
                Aún no hay proyectos publicados
              </p>
            ) : (
              cards.map((c, i) => {
                const s = SLOTS[i % SLOTS.length];
                return (
                  <div key={c.slug} className="mb-[7vw]" style={{ width: s.width, marginLeft: s.ml }}>
                    <button
                      onClick={() => navigate(`/project/${c.slug}`)}
                      className="group block w-full cursor-pointer border-none bg-transparent p-0 text-left"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.cover}
                        alt={c.name}
                        className="block h-auto w-full transition-opacity group-hover:opacity-80"
                      />
                      <p className="mt-2 text-[11px] uppercase tracking-[0.05em] text-black/60">{c.name}</p>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </BlurStage>
  );
}
