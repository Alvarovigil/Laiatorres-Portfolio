"use client";

import { BlurStage } from "@/components/blur-stage";
import { ArchiveChrome } from "@/components/archive-chrome";

// Portada: composición editorial asimétrica con el trabajo real (Julia
// Perfumeries). Cada imagen conserva su proporción nativa (sin recortes) y se
// posiciona en absoluto sobre un lienzo escalable (paddingTop = alto del lienzo).
const BASE = "/projects";
const CANVAS_PADDING_TOP = "460%";

type Img = { src: string; caption: string; alt: string; left: string; top: string; width: string; aspectRatio: string };

// Composición editorial asimétrica — imágenes más grandes (anchos 32–58%),
// mismo ritmo izquierda/derecha y orden que la versión anterior. El lienzo se
// alarga (460%) para recolocar sin solapes.
const images: Img[] = [
  { src: `${BASE}/verano-2025/01-w.jpg`,         caption: "Verano 2025",        alt: "Julia Perfumeries — Verano",        left: "1%",  top: "4%",  width: "56%", aspectRatio: "1920/1080" },
  { src: `${BASE}/dia-de-la-madre-2025/01-w.jpg`, caption: "Día de la Madre 2025", alt: "Julia Perfumeries — Día de la Madre", left: "58%", top: "7%",  width: "38%", aspectRatio: "5928/7000" },
  { src: `${BASE}/navidad-2024/02-w.jpg`,        caption: "Navidad 2024",       alt: "Julia Perfumeries — Navidad",       left: "1%",  top: "16%", width: "34%", aspectRatio: "2540/3000" },
  { src: `${BASE}/back-to-beauty-2025/01-w.jpg`,  caption: "Back to Beauty 2025", alt: "Julia Perfumeries — Back to Beauty", left: "20%", top: "26%", width: "46%", aspectRatio: "1920/1080" },
  { src: `${BASE}/verano-2025/04-w.jpg`,         caption: "Verano 2025",        alt: "Julia Perfumeries — Verano",        left: "68%", top: "24%", width: "32%", aspectRatio: "2964/3500" },
  { src: `${BASE}/navidad-2024/01-w.jpg`,        caption: "Navidad 2024",       alt: "Julia Perfumeries — Navidad",       left: "1%",  top: "36%", width: "58%", aspectRatio: "3000/1687" },
  { src: `${BASE}/dia-de-la-madre-2025/02-w.jpg`, caption: "Día de la Madre 2025", alt: "Julia Perfumeries — Día de la Madre", left: "60%", top: "40%", width: "38%", aspectRatio: "5928/7000" },
  { src: `${BASE}/verano-2025/02-w.jpg`,         caption: "Verano 2025",        alt: "Julia Perfumeries — Verano",        left: "8%",  top: "53%", width: "54%", aspectRatio: "1920/1080" },
  { src: `${BASE}/back-to-beauty-2025/02-w.jpg`,  caption: "Back to Beauty 2025", alt: "Julia Perfumeries — Back to Beauty", left: "54%", top: "61%", width: "44%", aspectRatio: "1920/1080" },
  { src: `${BASE}/navidad-2024/03-w.jpg`,        caption: "Navidad 2024",       alt: "Julia Perfumeries — Navidad",       left: "1%",  top: "69%", width: "52%", aspectRatio: "3500/1968" },
  { src: `${BASE}/verano-2025/03-w.jpg`,         caption: "Verano 2025",        alt: "Julia Perfumeries — Verano",        left: "54%", top: "70%", width: "44%", aspectRatio: "1920/1080" },
  { src: `${BASE}/back-to-beauty-2025/03-w.jpg`,  caption: "Back to Beauty 2025", alt: "Julia Perfumeries — Back to Beauty", left: "16%", top: "83%", width: "58%", aspectRatio: "1920/1080" },
];

export default function Portfolio() {
  return (
    <BlurStage>
      {(navigate) => (
        <div className="bg-white min-h-screen w-full">
          {/* Chrome de archivo — barras fijas arriba/abajo con texto en las esquinas */}
          <ArchiveChrome onHome={() => navigate("/")} bottomCenter="Selected Work — 2024 / 2025" />

          {/* Lienzo scrollable — composición editorial */}
          <div className="w-full">
            <div className="relative w-full" style={{ paddingTop: CANVAS_PADDING_TOP }}>
              {images.map((img, i) => (
                <div
                  key={i}
                  className="absolute cursor-pointer"
                  style={{ left: img.left, top: img.top, width: img.width }}
                  onClick={() => navigate("/project/julia-perfumeries")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-auto block hover:opacity-80 transition-opacity"
                    style={{ aspectRatio: img.aspectRatio }}
                  />
                  <p className="mt-2 text-[11px] uppercase tracking-[0.05em] text-black/60">{img.caption}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </BlurStage>
  );
}
