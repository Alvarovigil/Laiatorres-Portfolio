// Seed del proyecto "Leyma" (ficha V3). Reproduce la maquetación del preview
// entregado (04_Refinar_AlDetalle): wide (hero desayuno) · single der (logo) ·
// pair (propósito azul + nevera) · single izq · single der · single izq (azul) ·
// single der · pair (tipografía + mesa) · single izq · single der · single izq.
// Si el slug ya existe, actualiza sus campos y re-sincroniza las imágenes.
//
//   pnpm tsx --env-file=.env.local src/db/seed-leyma.ts
import { eq } from "drizzle-orm";
import { db } from "./index";
import { images, projects, type Collab, type ImageAlign, type ImageLayout, type VideoMode } from "./schema";

const SLUG = "leyma";
const DIR = "/projects/leyma";

type Img = {
  file: string;
  layout: ImageLayout;
  align?: ImageAlign;
  kind?: "image" | "video";
  videoMode?: VideoMode;
};
const SEQUENCE: Img[] = [
  { file: "01.webp", layout: "wide" }, // desayuno, mano con brik (hero horizontal)
  { file: "02.webp", layout: "single", align: "right" }, // logo LEYMA sobre retícula
  { file: "03.webp", layout: "pair" }, // panel azul "Fortalecemos…"
  { file: "04.mp4", layout: "pair", kind: "video", videoMode: "ambient" }, // gif nevera (mano cogiendo botella)
  { file: "05.webp", layout: "single", align: "left" }, // chica cargando las cajas
  { file: "06.webp", layout: "single", align: "right" }, // chica sonriendo con briks
  { file: "07.mp4", layout: "single", align: "left", kind: "video", videoMode: "ambient" }, // vídeo de colores
  { file: "08.webp", layout: "single", align: "right" }, // encimera con briks y mochila
  { file: "09.webp", layout: "pair" }, // tipografía "LO QUE DEFINE / 100% GALEGO"
  { file: "10.webp", layout: "pair" }, // mesa de desayuno, mantel azul
  { file: "11.webp", layout: "single", align: "left" }, // nevera abierta, mano con brik
  { file: "12.webp", layout: "single", align: "right" }, // briks de espaldas (packaging)
  { file: "13.webp", layout: "single", align: "left" }, // lineal de súper (cierre)
];

const SERVICES = ["Identidad", "Dirección de arte", "Packaging"];

const DESCRIPTION =
  "Actualización de la identidad de una marca láctea histórica recuperando su esencia familiar y los códigos gráficos de sus orígenes, adaptándola a las nuevas generaciones. Generamos también nuevos assets de marca para subproductos de la marca como batidos y expresiones de marca en otros canales.";

const AGENCY = "Casa Bien Agency";

const COLLABS: Collab[] = [];

async function main() {
  const fields = {
    name: "Leyma",
    description: DESCRIPTION,
    chromeCenter: "Leyma",
    chromeBottom: "Branding — Lácteos",
    category: "Identidad | Dirección de arte | Packaging",
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
      kind: img.kind ?? ("image" as const),
      videoMode: img.videoMode ?? ("ambient" as VideoMode),
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
