// Seed del proyecto "Relats" (ficha V3, trabajo con Firma). Sigue el orden de
// la ficha original de wearefirma.com/es/project/relats: los bloques a ancho
// completo van "wide" y los de dos columnas (imagen + vídeo) van en "pair".
// Los vídeos son locales (sin audio, ambient) en vez de embeds de Vimeo.
// Si el slug ya existe, actualiza sus campos y re-sincroniza las imágenes.
//
//   pnpm tsx --env-file=.env.local src/db/seed-relats.ts
import { eq } from "drizzle-orm";
import { db } from "./index";
import { images, projects, type Collab, type CreditGroups, type ImageAlign, type ImageLayout, type VideoMode } from "./schema";

const SLUG = "relats";
const DIR = "/projects/relats";

type Img = {
  file: string;
  layout: ImageLayout;
  align?: ImageAlign;
  kind?: "image" | "video";
  videoMode?: VideoMode;
};
const V = { kind: "video", videoMode: "ambient" } as const;
const SEQUENCE: Img[] = [
  { file: "01.mp4", layout: "wide", ...V }, // hero (logo Relats)
  { file: "02.mp4", layout: "wide", ...V }, // scroll de la landing
  { file: "03.webp", layout: "pair" }, // app
  { file: "04.mp4", layout: "pair", ...V }, // renders de producto
  { file: "05.mp4", layout: "single", align: "right", ...V }, // innovation & safety
  { file: "06.mp4", layout: "wide", ...V }, // coche
  { file: "07.webp", layout: "pair" }, // mockup página de producto
  { file: "08.mp4", layout: "pair", ...V }, // web en móvil
  { file: "09.mp4", layout: "wide", ...V }, // grid de la web
  { file: "10.mp4", layout: "wide", ...V }, // aerogeneradores
  { file: "11.webp", layout: "pair" }, // pantallas móvil
  { file: "12.mp4", layout: "pair", ...V }, // Relats Industries (web)
  { file: "13.webp", layout: "wide" }, // mockup escritorio
  { file: "14.webp", layout: "pair" }, // stickers
  { file: "15.mp4", layout: "pair", ...V }, // world impact
  { file: "16.webp", layout: "pair" }, // packaging
  { file: "17.mp4", layout: "pair", ...V }, // cable del motor
  { file: "18.mp4", layout: "wide", ...V }, // módulo de camión
  { file: "19.webp", layout: "pair" }, // catálogo
  { file: "20.mp4", layout: "pair", ...V }, // cierre
];

const SERVICES = [
  "Estrategia de marca",
  "Posicionamiento y narrativa",
  "Identidad visual",
  "Design System",
  "Manual de marca",
  "3D Renders",
  "Identidad verbal y tono de voz",
  "UX — Experiencia de usuario",
  "UI — Interfaz de usuario",
  "Desarrollo web",
];

const DESCRIPTION = [
  "Fundada hace más de 60 años como empresa textil, Relats ha evolucionado hasta convertirse en líder mundial en soluciones técnicas de protección y aislamiento para la movilidad eléctrica, el sector energético y las industrias automovilística, ferroviaria y aeroespacial; desempeñando un papel clave para que la movilidad sea más segura y sostenible.",
  "Junto con Relats, adoptamos un enfoque integral y elevamos el discurso hasta presentar la marca como un partner estratégico global, convirtiendo el apellido de Relats en sinónimo de innovación. Creamos una nueva identidad visual y un storytelling que resistieran el paso del tiempo y reflejaran su compromiso con un futuro mejor.",
  "Con una identidad más versátil, dinámica y funcional, el nuevo sistema de diseño fortalece su capacidad de adaptación a diferentes entornos y soluciones, consolidando a la marca como un agente dinámico de cambio.",
  "La nueva visión se ha traducido en una experiencia digital atrevida, con un look & feel premium y techie. Los renders, presentes en todo el recorrido del usuario, evidencian la aplicación del producto en su entorno real, generando una conexión más fuerte con la marca.",
].join("\n\n");

const AGENCY = "Firma";

const COLLABS: Collab[] = [];

const CREDITS: CreditGroups = [[{ label: "Reconocimientos", value: "Site Of The Day · Developer Award" }]];

async function main() {
  const fields = {
    name: "Relats",
    description: DESCRIPTION,
    chromeCenter: "Relats",
    chromeBottom: "Branding & Digital — 2025",
    category: "Branding & Digital",
    year: "2025",
    services: SERVICES,
    agency: AGENCY,
    collabs: COLLABS,
    credits: CREDITS,
    coverUrl: "",
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
