"use client";

// Nota: el editor de composición sigue disponible en
// @/components/composition-editor (desactivado, por si hay que reusarlo).
import { BlurStage } from "@/components/blur-stage";
import { ProjectFicha } from "@/components/project-ficha";

const V = "/projects/verano-2025";
const N = "/projects/navidad-2024";
const M = "/projects/dia-de-la-madre-2025";
const B = "/projects/back-to-beauty-2025";

const description = `Dirección de arte para las campañas estacionales de Julia Perfumeries —Navidad, Back to Beauty, Día de la Madre y Verano—. Un lenguaje visual común que da identidad a la marca a lo largo del año, traduciendo cada temporada a su propia atmósfera con un tratamiento coherente de la luz, el producto y la composición.`;

const images = [
  `${V}/01-w.jpg`,
  `${B}/01-w.jpg`,
  `${N}/01-w.jpg`,
  `${V}/02-w.jpg`,
  `${B}/02-w.jpg`,
  `${M}/01-w.jpg`,
  `${V}/04-w.jpg`,
  `${N}/03-w.jpg`,
];

export default function JuliaPerfumeriesPage() {
  return (
    <BlurStage>
      {(navigate) => (
        <ProjectFicha
          navigate={navigate}
          chromeCenter="Julia Perfumeries"
          chromeBottom="Seasonal Campaigns — 2024/2025"
          index="01"
          name="Julia Perfumeries"
          description={description}
          images={images}
          credits={[
            [
              { label: "Dirección de arte", value: "Laia Torres" },
              { label: "Diseño gráfico", value: "Laia Torres" },
            ],
            [{ label: "Servicios", value: "Dirección de arte, Diseño gráfico, Campañas estacionales, Contenido para redes" }],
            [{ label: "Año", value: "2024–2025" }],
          ]}
          nextHref="/project/smyl"
          nextLabel="→ Siguiente proyecto"
        />
      )}
    </BlurStage>
  );
}
