// Seed del proyecto "Rispa" (ficha V3). Reproduce la rejilla escalonada de la
// referencia entregada.
// Si el slug ya existe, actualiza sus campos y re-sincroniza las imágenes.
//
//   pnpm tsx --env-file=.env.local src/db/seed-rispa.ts
import { eq } from "drizzle-orm";
import { db } from "./index";
import { images, projects, type Collab, type ImageAlign, type ImageLayout } from "./schema";

const SLUG = "rispa";
const DIR = "/projects/rispa";

type Img = { file: string; layout: ImageLayout; align?: ImageAlign };
const SEQUENCE: Img[] = [
  { file: "01.webp", layout: "pair" }, // botellas en estantería
  { file: "02.webp", layout: "pair" }, // logo RISPA
  { file: "03.webp", layout: "single", align: "right" }, // entrada del local
  { file: "04.webp", layout: "single", align: "left" }, // copa en barra
  { file: "05.webp", layout: "pair" }, // botellas en el bar
  { file: "06.webp", layout: "pair" }, // tipografía RISPA
  { file: "07.webp", layout: "single", align: "right" }, // mano con copa (exterior)
  { file: "08.webp", layout: "single", align: "left" }, // camisetas
  { file: "09.webp", layout: "single", align: "right" }, // tirador de cerveza
  { file: "10.webp", layout: "single", align: "left" }, // escaparate con dragón
  { file: "11.webp", layout: "single", align: "right" }, // detalle / tarjetas
  { file: "12.webp", layout: "pair" }, // tirada de caña
  { file: "13.webp", layout: "pair" }, // chapas / detalles RISPA
];

const SERVICES = ["Identidad", "Dirección de arte", "Packaging"];

const DESCRIPTION =
  "Junto con el equipo de Palau Fugit (pequeño hotel en Girona) dimos vida a esta nueva marca de cervezas artesanas que embotellan la cultura, historia y espíritu de Girona. Hicimos una documentación extensa de la esencia de Girona, su gente y sus leyendas para plasmar en el packaging, el entorno y en su manera de comunicarse algo muy de allí, muy «Descaradament Gironina».";

const AGENCY = "Firma Branding&Innovation Agency";

const COLLABS: Collab[] = [];

async function main() {
  const fields = {
    name: "Rispa",
    description: DESCRIPTION,
    chromeCenter: "Rispa",
    chromeBottom: "Branding — Girona",
    category: "Branding",
    year: "2024",
    services: SERVICES,
    agency: AGENCY,
    collabs: COLLABS,
    coverUrl: `${DIR}/01.webp`,
    published: true,
  };

  const existing = await db.query.projects.findFirst({ where: eq(projects.slug, SLUG) });

  let projectId: string;
  if (existing) {
    projectId = existing.id;
    await db.update(projects).set({ ...fields, updatedAt: new Date() }).where(eq(projects.id, projectId));
    await db.delete(images).where(eq(images.projectId, projectId)); // re-sincroniza
  } else {
    const all = await db.select({ sortOrder: projects.sortOrder }).from(projects);
    const nextOrder = all.length ? Math.max(...all.map((p) => p.sortOrder)) + 1 : 0;
    const [created] = await db
      .insert(projects)
      .values({ slug: SLUG, ...fields, sortOrder: nextOrder })
      .returning({ id: projects.id });
    projectId = created.id;
  }

  await db.insert(images).values(
    SEQUENCE.map((img, idx) => ({
      projectId,
      url: `${DIR}/${img.file}`,
      kind: "image" as const,
      alt: "",
      section: "",
      layout: img.layout,
      align: img.align ?? ("left" as ImageAlign),
      sortOrder: idx,
    })),
  );

  console.log(`✓ ${SLUG} (${existing ? "actualizado" : "creado"}, ${SEQUENCE.length} imágenes)`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
