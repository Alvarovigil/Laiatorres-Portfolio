// Re-sincroniza el proyecto "julia-perfumeries" con la retícula del PDF de Laia
// (aa.pdf): 26 imágenes (01–26.jpg) con su layout/lado y las 4 campañas como
// secciones sticky. Actualiza también servicios y agencia; conserva el resto.
//
//   pnpm tsx --env-file=.env.local src/db/seed-julia.ts
import { eq } from "drizzle-orm";
import { db } from "./index";
import { images, projects, type ImageAlign, type ImageLayout } from "./schema";

const SLUG = "julia-perfumeries";
const DIR = "/projects/julia-perfumeries";

const VERANO = "Campaña Verano 2025";
const MADRE = "Campaña Día de la Madre 2025";
const BEAUTY = "Campaña Back to Beauty 2025";
const NAVIDAD = "Campaña Navidad 2025";

// Layout, lado y sección por posición (1–26), leídos del PDF.
type Img = { layout: ImageLayout; align?: ImageAlign; section: string };
const SEQUENCE: Img[] = [
  { layout: "wide", section: VERANO }, // 01 ancha (vídeo)
  { layout: "single", align: "left", section: VERANO }, // 02
  { layout: "wide", section: VERANO }, // 03 ancha
  { layout: "single", align: "right", section: VERANO }, // 04
  { layout: "pair", section: VERANO }, // 05
  { layout: "pair", section: VERANO }, // 06
  { layout: "single", align: "left", section: VERANO }, // 07
  { layout: "single", align: "right", section: VERANO }, // 08
  { layout: "pair", section: VERANO }, // 09
  { layout: "pair", section: VERANO }, // 10
  { layout: "wide", section: VERANO }, // 11 ancha (Júlia mar)
  { layout: "wide", section: MADRE }, // 12 ancha (Júlia flores)
  { layout: "pair", section: MADRE }, // 13
  { layout: "pair", section: MADRE }, // 14
  { layout: "single", align: "right", section: MADRE }, // 15
  { layout: "wide", section: MADRE }, // 16 ancha (crema)
  { layout: "pair", section: BEAUTY }, // 17
  { layout: "pair", section: BEAUTY }, // 18
  { layout: "single", align: "left", section: BEAUTY }, // 19
  { layout: "single", align: "right", section: BEAUTY }, // 20
  { layout: "pair", section: NAVIDAD }, // 21
  { layout: "pair", section: NAVIDAD }, // 22
  { layout: "single", align: "right", section: NAVIDAD }, // 23 (vídeo)
  { layout: "single", align: "left", section: NAVIDAD }, // 24
  { layout: "pair", section: NAVIDAD }, // 25 (vídeo)
  { layout: "pair", section: NAVIDAD }, // 26
];

const SERVICES = ["Identidad", "Dirección de arte", "Campañas", "2024-2025"];
const AGENCY = "Firma Branding & Innovation Agency";

async function main() {
  const project = await db.query.projects.findFirst({ where: eq(projects.slug, SLUG) });
  if (!project) {
    console.error(`✗ No existe el proyecto "${SLUG}".`);
    process.exit(1);
  }

  await db
    .update(projects)
    .set({ services: SERVICES, agency: AGENCY, updatedAt: new Date() })
    .where(eq(projects.id, project.id));

  await db.delete(images).where(eq(images.projectId, project.id));
  await db.insert(images).values(
    SEQUENCE.map((img, i) => ({
      projectId: project.id,
      url: `${DIR}/${String(i + 1).padStart(2, "0")}.jpg`,
      kind: "image" as const,
      alt: "",
      section: img.section,
      layout: img.layout,
      align: img.align ?? ("left" as ImageAlign),
      sortOrder: i,
    })),
  );

  console.log(`✓ ${SLUG} (${SEQUENCE.length} imágenes, 4 campañas)`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
