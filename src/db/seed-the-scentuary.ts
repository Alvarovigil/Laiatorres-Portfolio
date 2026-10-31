// Seed del proyecto "The Scentuary" (ficha V3). Orden del material entregado
// (1, 2, 3, 4, 4-1, 5, 5-1, 6…15 → 01…17): las tres horizontales a ancho
// completo y las verticales en parejas.
// Solo crea: si el slug ya existe no toca nada, para no pisar lo editado en el admin.
//
//   pnpm tsx --env-file=.env.local src/db/seed-the-scentuary.ts
import { eq } from "drizzle-orm";
import { db } from "./index";
import { images, projects, type ImageAlign, type ImageLayout, type VideoMode } from "./schema";

const SLUG = "the-scentuary";
const DIR = "/projects/the-scentuary";

const SEQUENCE: { file: string; layout: ImageLayout }[] = [
  { file: "01.webp", layout: "wide" }, // logotipo
  { file: "02.webp", layout: "pair" }, // sello floral
  { file: "03.webp", layout: "pair" }, // Kirké
  { file: "04.webp", layout: "pair" }, // Nishane + Fugazzi
  { file: "05.webp", layout: "pair" }, // Chopard Agar Royal
  { file: "06.webp", layout: "pair" }, // tipografía
  { file: "07.webp", layout: "pair" }, // manos con frasco
  { file: "08.webp", layout: "pair" }, // frascos apilados
  { file: "09.webp", layout: "pair" }, // retoque en pantalla
  { file: "10.webp", layout: "wide" }, // bodegón Nishane
  { file: "11.webp", layout: "pair" }, // felpudo y bolsa
  { file: "12.webp", layout: "pair" }, // fachada de la tienda
  { file: "13.webp", layout: "pair" }, // probando fragancias
  { file: "14.webp", layout: "pair" }, // mouillette
  { file: "15.webp", layout: "pair" }, // bolsas y producto
  { file: "16.webp", layout: "pair" }, // inauguración
  { file: "17.webp", layout: "wide" }, // stories
];

// Borrador: textos propuestos a partir del material, para revisar en el admin.
const DESCRIPTION =
  "The Scentuary es una maison de perfumería de autor. Identidad visual, dirección de arte y fotografía para su lanzamiento: del logotipo y el sistema tipográfico al bodegón de producto, la tienda, la inauguración y los contenidos para redes.";

const SERVICES = ["Identidad visual", "Dirección de arte", "Fotografía de producto", "Retail", "Social Media"];

async function main() {
  const existing = await db.query.projects.findFirst({ where: eq(projects.slug, SLUG) });
  if (existing) {
    console.log(`= ${SLUG} ya existe; no se toca.`);
    return;
  }

  const all = await db.select({ sortOrder: projects.sortOrder }).from(projects);
  const nextOrder = all.length ? Math.max(...all.map((p) => p.sortOrder)) + 1 : 0;
  const [created] = await db
    .insert(projects)
    .values({
      slug: SLUG,
      name: "The Scentuary",
      description: DESCRIPTION,
      chromeCenter: "The Scentuary",
      chromeBottom: "Identidad & Dirección de arte",
      category: "Identidad & Dirección de arte",
      year: "",
      services: SERVICES,
      agency: "",
      collabs: [],
      coverUrl: `${DIR}/01.webp`,
      secondCoverUrl: `${DIR}/03.webp`,
      published: false,
      sortOrder: nextOrder,
    })
    .returning({ id: projects.id });

  await db.insert(images).values(
    SEQUENCE.map((img, idx) => ({
      projectId: created.id,
      url: `${DIR}/${img.file}`,
      kind: "image" as const,
      videoMode: "ambient" as VideoMode,
      alt: "",
      section: "",
      layout: img.layout,
      align: "left" as ImageAlign,
      sortOrder: idx,
    })),
  );

  console.log(`✓ ${SLUG} creado (${SEQUENCE.length} imágenes, borrador)`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
