// Seed del proyecto "Palau Fugit" (rediseño ficha V3) con su contenido real.
// Reproduce el orden y la colocación exacta de la rejilla del diseño:
//   pair = ambas columnas · single (left|right) = una columna · wide = ancho.
// Si el slug ya existe, actualiza sus campos y re-sincroniza las imágenes.
//
//   pnpm tsx --env-file=.env.local src/db/seed-palau.ts
import { eq } from "drizzle-orm";
import { db } from "./index";
import { images, projects, type Collab, type ImageAlign, type ImageLayout } from "./schema";

const SLUG = "palau-fugit";
const DIR = "/projects/palau-fugit";

// Imágenes 01–16.jpg (nomenclatura por orden). Layout/lado por posición.
type Img = { file: string; layout: ImageLayout; align?: ImageAlign };
const SEQUENCE: Img[] = [
  { file: "01.jpg", layout: "pair" }, // fila 1 izq
  { file: "02.jpg", layout: "pair" }, // fila 1 der
  { file: "03.jpg", layout: "single", align: "right" }, // fila 2
  { file: "04.jpg", layout: "pair" }, // fila 3 izq
  { file: "05.jpg", layout: "pair" }, // fila 3 der
  { file: "06.jpg", layout: "single", align: "left" }, // fila 4
  { file: "07.jpg", layout: "single", align: "right" }, // fila 5
  { file: "08.jpg", layout: "pair" }, // fila 6 izq
  { file: "09.jpg", layout: "pair" }, // fila 6 der
  { file: "10.jpg", layout: "single", align: "right" }, // fila 7
  { file: "11.jpg", layout: "pair" }, // fila 8 izq
  { file: "12.jpg", layout: "pair" }, // fila 8 der
  { file: "13.jpg", layout: "single", align: "left" }, // fila 9
  { file: "14.jpg", layout: "single", align: "right" }, // fila 10
  { file: "15.jpg", layout: "single", align: "left" }, // fila 11
  { file: "16.jpg", layout: "wide" }, // fila 12 ancho
];

const SERVICES = ["Identidad", "Dirección de arte", "Packaging"];

const DESCRIPTION =
  "Los arquitectos de Elequipocreativo reinventaron PalauFugit Girona como un hotel de lujo donde los huéspedes tienen todo el tiempo del mundo para vivir La Vida Plena. A partir de ahí, creamos una marca que captura la esencia del espacio. En colaboración con @ssonjass, desarrollamos un lenguaje visual atemporal, donde lo moderno y lo clásico se fusionan. Esta sensibilidad se extiende a todos los espacios del hotel, desde las habitaciones, restaurantes y bares hasta la señalización y las cartas. Trabajando con artesanos locales de renombre, diseñamos artículos de tocador que unifican sus productos con la marca que desarrollamos para el hotel.";

const AGENCY = "Firma Branding&Innovation Agency";

const COLLABS: Collab[] = [
  { handle: "@olivelystore", href: "https://www.instagram.com/olivelystore/" },
  { handle: "@oascompany", href: "https://www.instagram.com/oascompany/" },
  { handle: "@shizenna_scent", href: "https://www.instagram.com/shizenna_scent/" },
  { handle: "@ssonjass", href: "https://www.instagram.com/ssonjass/" },
  { handle: "@tramuntanna_culturaltours", href: "https://www.instagram.com/tramuntanna_culturaltours/" },
];

async function main() {
  const fields = {
    name: "Palau Fugit",
    description: DESCRIPTION,
    chromeCenter: "Palau Fugit",
    chromeBottom: "Branding — Girona",
    category: "Branding",
    year: "2024",
    services: SERVICES,
    agency: AGENCY,
    collabs: COLLABS,
    coverUrl: `${DIR}/01.jpg`,
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
