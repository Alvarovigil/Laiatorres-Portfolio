// Seed del proyecto "Mahou" (ficha V3, trabajo con Firma y Rosàs). Sigue el
// orden de la ficha original de wearefirma.com/es/project/mahou: los bloques a
// ancho completo van "wide", los de dos columnas en "pair" y los que allí van
// junto a un texto, como "single". 00.webp es solo la portada de la home.
// Si el slug ya existe, actualiza sus campos y re-sincroniza las imágenes.
//
//   pnpm tsx --env-file=.env.local src/db/seed-mahou.ts
import { eq } from "drizzle-orm";
import { db } from "./index";
import { images, projects, type Collab, type ImageAlign, type ImageLayout, type VideoMode } from "./schema";

const SLUG = "mahou";
const DIR = "/projects/mahou";

type Img = {
  file: string;
  layout: ImageLayout;
  align?: ImageAlign;
  kind?: "image" | "video";
  videoMode?: VideoMode;
};
const V = { kind: "video", videoMode: "ambient" } as const;
const SEQUENCE: Img[] = [
  { file: "01.webp", layout: "wide" }, // producto (hero)
  { file: "02.mp4", layout: "wide", ...V }, // cortes
  { file: "03.mp4", layout: "single", align: "right", ...V }, // carrusel
  { file: "04.mp4", layout: "wide", ...V }, // estrellas
  { file: "05.webp", layout: "wide" }, // valla 1
  { file: "06.mp4", layout: "wide", ...V }, // fotografía
  { file: "07.webp", layout: "pair" }, // wayfinding (portada)
  { file: "08.mp4", layout: "pair", ...V }, // fotos
  { file: "09.mp4", layout: "single", align: "left", ...V }, // type morph
  { file: "10.webp", layout: "wide" }, // overview de assets
  { file: "11.webp", layout: "pair" }, // tote bag
  { file: "12.mp4", layout: "pair", ...V }, // ilustración
  { file: "13.webp", layout: "wide" }, // presentación
  { file: "14.mp4", layout: "wide", ...V }, // credenciales
  { file: "15.webp", layout: "single", align: "right" }, // toldos
  { file: "16.webp", layout: "wide" }, // valla 2
  { file: "17.webp", layout: "pair" }, // rótulo
  { file: "18.webp", layout: "pair" }, // social media
  { file: "19.mp4", layout: "wide", ...V }, // Darwin
  { file: "20.webp", layout: "single", align: "left" }, // tono de voz
  { file: "21.webp", layout: "wide" }, // valla con copas (cierre)
];

const SERVICES = [
  "Estrategia de marca",
  "Motion Design",
  "Campañas",
  "Manual de marca",
  "Producción de eventos",
  "Tono de voz",
  "Copywriting",
  "Experiencia digital",
  "Social Media",
];

const DESCRIPTION = [
  "Mahou Cinco Estrellas, la cerveza más consumida de España y el buque insignia de Mahou, buscaba consolidar su liderazgo y elevar su posicionamiento de marca para poner en valor el concepto de grandeza. Para lograrlo, redefinimos su identidad visual, ampliando su universo gráfico y, al mismo tiempo, iconizando y sistematizando sus principales activos de marca.",
  "Trabajamos junto a la agencia Rosàs para dar forma a una nueva expresión de marca coherente y con impacto, perfectamente alineada con el renovado posicionamiento y la visión de futuro de Mahou. Esta evolución no solo refuerza el legado de la marca, sino que también sienta las bases para una presencia más icónica y aspiracional en el mercado cervecero global.",
  "Reforzamos la identidad visual de Mahou con recursos gráficos y elementos que potencian su mensaje, amplificando su impacto y asegurando una experiencia coherente en cada interacción.",
  "Impulsamos la marca hacia un futuro escalable y flexible creando un sistema de expresión de marca no solo sólido, sino también adaptable a distintos contextos y audiencias.",
].join("\n\n");

const AGENCY = "Firma · Rosàs";

const COLLABS: Collab[] = [];

async function main() {
  const fields = {
    name: "Mahou",
    description: DESCRIPTION,
    chromeCenter: "Mahou",
    chromeBottom: "Branding & Campañas — 2025",
    category: "Branding & Campañas",
    year: "2025",
    services: SERVICES,
    agency: AGENCY,
    collabs: COLLABS,
    coverUrl: `${DIR}/00.webp`,
    published: true,
    comingSoon: false,
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

  console.log(`✓ ${SLUG} (${existing ? "actualizado" : "creado"}, ${SEQUENCE.length} medios)`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
