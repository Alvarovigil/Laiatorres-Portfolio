// Seed del proyecto "Uniq Made" (ficha V3). Reproduce la maquetación del
// preview entregado: wide (hero) · single izq · wide (stories) · single izq ·
// single der · pair.
// Si el slug ya existe, actualiza sus campos y re-sincroniza las imágenes.
//
//   pnpm tsx --env-file=.env.local src/db/seed-uniqmade.ts
import { eq } from "drizzle-orm";
import { db } from "./index";
import { images, projects, type Collab, type ImageAlign, type ImageLayout } from "./schema";

const SLUG = "uniq-made";
const DIR = "/projects/uniq-made";

type Img = { file: string; layout: ImageLayout; align?: ImageAlign };
const SEQUENCE: Img[] = [
  { file: "01.png", layout: "wide" }, // hero "As unique as you are"
  { file: "02.png", layout: "single", align: "left" }, // hombre fondo verde
  { file: "03.jpg", layout: "wide" }, // tira de stories
  { file: "04.png", layout: "single", align: "left" }, // mujer fondo lila
  { file: "05.png", layout: "single", align: "right" }, // mujer fondo azul
  { file: "06.png", layout: "pair" }, // hombre con brocha
  { file: "07.png", layout: "pair" }, // "Perfecto para ti"
];

const SERVICES = ["Identidad", "Dirección de arte", "Packaging"];

const DESCRIPTION =
  "Uniqmade es una marca de haircare que celebra que cada cabello —como cada persona— es único. Desarrollamos su identidad, dirección de arte y packaging bajo la idea «As unique as you are», con un sistema visual fresco, cromático y cercano que se adapta a cada tipo de pelo.";

const AGENCY = "";

const COLLABS: Collab[] = [];

async function main() {
  const fields = {
    name: "Uniq Made",
    description: DESCRIPTION,
    chromeCenter: "Uniq Made",
    chromeBottom: "Branding — Haircare",
    category: "Branding",
    year: "2025",
    services: SERVICES,
    agency: AGENCY,
    collabs: COLLABS,
    coverUrl: `${DIR}/01.png`,
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
