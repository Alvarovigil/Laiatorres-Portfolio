// Seed del proyecto "Palau Fugit" (rediseño ficha V3) con su contenido real.
// Reproduce el orden y la colocación exacta de la rejilla del diseño:
//   pair = ambas columnas · single (left|right) = una columna · wide = ancho.
// Idempotente: si el slug ya existe, no hace nada.
//
//   pnpm tsx --env-file=.env.local src/db/seed-palau.ts
import { eq } from "drizzle-orm";
import { db } from "./index";
import { images, projects, type Collab, type ImageAlign, type ImageLayout } from "./schema";

const SLUG = "palau-fugit";
const DIR = "/projects/palau-fugit";

// Secuencia exacta del diseño (App.tsx). Cada entrada: archivo + layout + lado.
type Img = { file: string; layout: ImageLayout; align?: ImageAlign };
const SEQUENCE: Img[] = [
  { file: "7699fb05dfb9947afcecfcfa26c4cd5d2c37df23.png", layout: "pair" }, // fila 1 izq
  { file: "488ffe3e136e7648a0fef11e58e48ab694b0a172.png", layout: "pair" }, // fila 1 der
  { file: "47264c03cba3f8ae0ecac112310caaad3ff9a6ae.png", layout: "single", align: "right" }, // fila 2
  { file: "97eb537c332f44fc0a10886e8831035b84bb97e0.png", layout: "pair" }, // fila 3 izq
  { file: "08e3e6494d0bbdd5214ffd47cbb6d67c07ced4f7.png", layout: "pair" }, // fila 3 der
  { file: "efbcf0817560b1a553aedf8723adea94ffbaa9dd.png", layout: "single", align: "left" }, // fila 4
  { file: "139017b13816e934b500d7a15d2c100db9c4ea7f.png", layout: "single", align: "right" }, // fila 5
  { file: "b149bcfd7d4a45dad0e02bbc9da6e594664b54a4.png", layout: "pair" }, // fila 6 izq
  { file: "accc6cc83b9d45eb7b680019750dec63e496d378.png", layout: "pair" }, // fila 6 der
  { file: "3a6d68103c53c72c16c99e47d885119cb14ae35f.png", layout: "single", align: "right" }, // fila 7
  { file: "65d9d6b956f96e9f4b41bed51ae0ce48dd2b5258.png", layout: "pair" }, // fila 8 izq
  { file: "6617a8d3a538daf8d5e3cc37fd16ae7411e9da68.png", layout: "pair" }, // fila 8 der
  { file: "fe5d17ace2ad17d447951be28828627ff9c17100.png", layout: "single", align: "left" }, // fila 9
  { file: "c1b397b61f18961c9b03ff3e4c8396b6ccb80f60.png", layout: "single", align: "right" }, // fila 10
  { file: "bd0742351d3da2485515c42da8787ab754c44759.png", layout: "single", align: "left" }, // fila 11
  { file: "15a6e7908715a33a71bed8cadd1b1a3ead0cc4d0.png", layout: "wide" }, // fila 12 ancho
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
  const existing = await db.query.projects.findFirst({ where: eq(projects.slug, SLUG) });
  if (existing) {
    console.log(`· ${SLUG} ya existe, lo salto`);
    return;
  }

  // Lo colocamos al final del archivo.
  const all = await db.select({ sortOrder: projects.sortOrder }).from(projects);
  const nextOrder = all.length ? Math.max(...all.map((p) => p.sortOrder)) + 1 : 0;

  const [created] = await db
    .insert(projects)
    .values({
      slug: SLUG,
      name: "Palau Fugit",
      description: DESCRIPTION,
      chromeCenter: "Palau Fugit",
      chromeBottom: "Branding — Girona",
      category: "Branding",
      year: "2024",
      services: SERVICES,
      agency: AGENCY,
      collabs: COLLABS,
      coverUrl: `${DIR}/65d9d6b956f96e9f4b41bed51ae0ce48dd2b5258.png`,
      sortOrder: nextOrder,
      published: true,
    })
    .returning({ id: projects.id });

  await db.insert(images).values(
    SEQUENCE.map((img, idx) => ({
      projectId: created.id,
      url: `${DIR}/${img.file}`,
      kind: "image" as const,
      alt: "",
      section: "",
      layout: img.layout,
      align: img.align ?? ("left" as ImageAlign),
      sortOrder: idx,
    })),
  );

  console.log(`✓ ${SLUG} (${SEQUENCE.length} imágenes)`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
