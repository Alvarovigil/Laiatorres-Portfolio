"use client";

import { BlurStage } from "@/components/blur-stage";
import { ProjectTaqta } from "@/components/project-taqta";

const V = "/projects/verano-2025";
const N = "/projects/navidad-2024";
const M = "/projects/dia-de-la-madre-2025";
const B = "/projects/back-to-beauty-2025";

export default function JuliaPerfumeriesV2() {
  return (
    <BlurStage>
      {(navigate) => (
        <ProjectTaqta
          navigate={navigate}
          name="Julia Perfumeries"
          index="001"
          category="Campañas estacionales"
          year="2024 / 2025"
          about={[
            "Dirección de arte para las campañas estacionales de Julia Perfumeries —Navidad, Back to Beauty, Día de la Madre y Verano—.",
            "Un lenguaje visual común que da identidad a la marca a lo largo del año, traduciendo cada temporada a su propia atmósfera con un tratamiento coherente de la luz, el producto y la composición.",
          ]}
          services={["Dirección de arte", "Diseño gráfico", "Campañas estacionales", "Contenido para redes"]}
          credits={[
            { label: "Dirección de arte", value: "Laia Torres" },
            { label: "Diseño gráfico", value: "Laia Torres" },
            { label: "Año", value: "2024–2025" },
          ]}
          sections={[
            {
              label: "Verano 2025",
              blocks: [
                { type: "wide", src: `${V}/01-w.jpg`, ratio: 16 / 9 },
                { type: "pair", src: [`${V}/02-w.jpg`, `${V}/03-w.jpg`], ratio: 3 / 2 },
                { type: "single", src: `${V}/04-w.jpg`, ratio: 4 / 5 },
              ],
            },
            {
              label: "Navidad 2024",
              blocks: [
                { type: "wide", src: `${N}/01-w.jpg`, ratio: 16 / 9 },
                { type: "single", src: `${N}/02-w.jpg`, ratio: 4 / 5 },
                { type: "wide", src: `${N}/03-w.jpg`, ratio: 16 / 9 },
              ],
            },
            {
              label: "Back to Beauty 2025",
              blocks: [
                { type: "wide", src: `${B}/01-w.jpg`, ratio: 16 / 9 },
                { type: "pair", src: [`${B}/02-w.jpg`, `${B}/03-w.jpg`], ratio: 3 / 2 },
              ],
            },
            {
              label: "Día de la Madre 2025",
              blocks: [{ type: "single", src: `${M}/01-w.jpg`, ratio: 4 / 5 }],
            },
          ]}
          nextHref="/v2"
          nextLabel="↳ Volver al índice"
        />
      )}
    </BlurStage>
  );
}
