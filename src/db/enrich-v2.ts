// Rellena los campos nuevos de la ficha V2 en los proyectos ya existentes.
//   pnpm tsx --env-file=.env.local src/db/enrich-v2.ts
//
// Julia se reconstruye fiel al diseño V2 (secciones + ritmo wide/par/single).
// Smyl recibe categoría/año/servicios; sus imágenes quedan en una sección por
// defecto para que se organicen luego desde el admin.
import { eq } from "drizzle-orm";
import { db } from "./index";
import { images, projects, type ImageLayout } from "./schema";

const V = "/projects/verano-2025";
const N = "/projects/navidad-2024";
const M = "/projects/dia-de-la-madre-2025";
const B = "/projects/back-to-beauty-2025";

// Codificamos la proporción con width/height (ratio = w/h).
const R = {
  wide: { width: 1600, height: 900 }, // 16/9
  pair: { width: 1500, height: 1000 }, // 3/2
  single: { width: 800, height: 1000 }, // 4/5
} as const;

type Img = { url: string; section: string; layout: ImageLayout };
const W = (url: string, section: string): Img => ({ url, section, layout: "wide" });
const P = (url: string, section: string): Img => ({ url, section, layout: "pair" });
const S = (url: string, section: string): Img => ({ url, section, layout: "single" });

const juliaImages: Img[] = [
  W(`${V}/01-w.jpg`, "Verano 2025"),
  P(`${V}/02-w.jpg`, "Verano 2025"),
  P(`${V}/03-w.jpg`, "Verano 2025"),
  S(`${V}/04-w.jpg`, "Verano 2025"),
  W(`${N}/01-w.jpg`, "Navidad 2024"),
  S(`${N}/02-w.jpg`, "Navidad 2024"),
  W(`${N}/03-w.jpg`, "Navidad 2024"),
  W(`${B}/01-w.jpg`, "Back to Beauty 2025"),
  P(`${B}/02-w.jpg`, "Back to Beauty 2025"),
  P(`${B}/03-w.jpg`, "Back to Beauty 2025"),
  S(`${M}/01-w.jpg`, "Día de la Madre 2025"),
];

async function enrichJulia() {
  const p = await db.query.projects.findFirst({ where: eq(projects.slug, "julia-perfumeries") });
  if (!p) return console.log("· julia-perfumeries no existe, salto");

  await db
    .update(projects)
    .set({
      category: "Campañas estacionales",
      year: "2024 / 2025",
      services: ["Dirección de arte", "Diseño gráfico", "Campañas estacionales", "Contenido para redes"],
      credits: [
        [
          { label: "Dirección de arte", value: "Laia Torres" },
          { label: "Diseño gráfico", value: "Laia Torres" },
          { label: "Año", value: "2024–2025" },
        ],
      ],
      updatedAt: new Date(),
    })
    .where(eq(projects.id, p.id));

  await db.delete(images).where(eq(images.projectId, p.id));
  await db.insert(images).values(
    juliaImages.map((i, idx) => ({
      projectId: p.id,
      url: i.url,
      alt: "",
      section: i.section,
      layout: i.layout,
      ...R[i.layout],
      sortOrder: idx,
    })),
  );
  console.log(`✓ julia-perfumeries reconstruida (${juliaImages.length} imágenes, 4 secciones)`);
}

async function enrichSmyl() {
  const p = await db.query.projects.findFirst({ where: eq(projects.slug, "smyl") });
  if (!p) return console.log("· smyl no existe, salto");

  await db
    .update(projects)
    .set({
      category: "Identidad visual",
      year: "2024",
      services: ["Identidad visual", "Dirección de arte", "Diseño gráfico", "Aplicaciones"],
      credits: [
        [
          { label: "Dirección creativa", value: "Laia Torres" },
          { label: "Naming", value: "Laia Torres" },
          { label: "Diseño gráfico", value: "Laia Torres" },
        ],
        [{ label: "Fotografía", value: "Gedvile Tamosiunaite for DeathToStock" }],
        [{ label: "Año", value: "2024" }],
      ],
      updatedAt: new Date(),
    })
    .where(eq(projects.id, p.id));

  // Sección por defecto para que la cabecera/intro V2 no quede vacía.
  await db.update(images).set({ section: "Sistema visual" }).where(eq(images.projectId, p.id));
  console.log("✓ smyl: campos V2 puestos (imágenes en 1 sección por defecto)");
}

async function main() {
  await enrichJulia();
  await enrichSmyl();
  console.log("Enriquecido V2 completado.");
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
