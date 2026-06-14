// Migración de los proyectos hardcodeados a la base de datos.
//
// Las imágenes siguen apuntando a /projects/... (assets estáticos ya commiteados
// en public/), así que no hay que resubir nada a Blob. Idempotente: si el slug
// ya existe, lo salta.
//
//   pnpm db:seed
import { eq } from "drizzle-orm";
import { db } from "./index";
import { images, projects, type CreditGroups } from "./schema";

const V = "/projects/verano-2025";
const N = "/projects/navidad-2024";
const M = "/projects/dia-de-la-madre-2025";
const B = "/projects/back-to-beauty-2025";
const S = "/projects/smyl";

type SeedProject = {
  slug: string;
  name: string;
  description: string;
  chromeCenter: string;
  chromeBottom: string;
  credits: CreditGroups;
  imageUrls: string[];
};

const SEED: SeedProject[] = [
  {
    slug: "julia-perfumeries",
    name: "Julia Perfumeries",
    chromeCenter: "Julia Perfumeries",
    chromeBottom: "Seasonal Campaigns — 2024/2025",
    description:
      "Dirección de arte para las campañas estacionales de Julia Perfumeries —Navidad, Back to Beauty, Día de la Madre y Verano—. Un lenguaje visual común que da identidad a la marca a lo largo del año, traduciendo cada temporada a su propia atmósfera con un tratamiento coherente de la luz, el producto y la composición.",
    imageUrls: [
      `${V}/01-w.jpg`,
      `${B}/01-w.jpg`,
      `${N}/01-w.jpg`,
      `${V}/02-w.jpg`,
      `${B}/02-w.jpg`,
      `${M}/01-w.jpg`,
      `${V}/04-w.jpg`,
      `${N}/03-w.jpg`,
    ],
    credits: [
      [
        { label: "Dirección de arte", value: "Laia Torres" },
        { label: "Diseño gráfico", value: "Laia Torres" },
      ],
      [{ label: "Servicios", value: "Dirección de arte, Diseño gráfico, Campañas estacionales, Contenido para redes" }],
      [{ label: "Año", value: "2024–2025" }],
    ],
  },
  {
    slug: "smyl",
    name: "Smyl",
    chromeCenter: "Smyl",
    chromeBottom: "Brand Identity — 2024",
    description:
      "Identidad visual y dirección de arte para SMYL, una marca a caballo entre el cuidado oral y la autoexpresión estética —grillz y joyas dentales—. Construimos un posicionamiento distintivo y un sistema visual replicable, alejado del imaginario clínico, que conecta el producto con códigos de joyería y lifestyle en campañas, web y packaging.",
    imageUrls: [
      `${S}/7464a093706a54a56e7c77599de6e88e0558040c.png`,
      `${S}/048c65103c6e3508c5b622134c15384b5fe60476.png`,
      `${S}/e9e9e5adc444eb9c93cfb17d40b3c7c01333efc7.png`,
      `${S}/785dc1fb7e07f900e63dde121de469083223849a.png`,
      `${S}/c0987069fa8c019189de1cf31be3486ee3bd9967.png`,
      `${S}/15497042b0b523cef25bd70c0b748061b3ca1a56.png`,
      `${S}/d1edacfbc6c2d59403e8ba7491791fb137120fcf.png`,
      `${S}/2c6ed738d515495271bd98e57da443486eae20fc.png`,
      `${S}/c5c69a10c1461956d9559756a4565c8495163791.png`,
      `${S}/ea802cbdcf297aa3017bfaadfe2fc98317fdb396.png`,
      `${S}/f1ceb6b08d806ea032271b01934c1d326bff8aae.png`,
      `${S}/d802e01ce94fa053ca10405ca79551a4dd3d135a.png`,
      `${S}/49578e16c4e8fb53028da0080f6ca796aac8698d.png`,
      `${S}/5265f497ff241eff058cb21b3516fe493db36dfc.png`,
      `${S}/70d82d46fcdc34066e4bc5a4d6485964613e838c.png`,
      `${S}/4fe40f98bbcb48a7b570831710db049f423493e0.png`,
      `${S}/a6c704932aff4108ac0c394a2fba97ae62a7996c.png`,
      `${S}/05247636540587ec1003953d2349d092f0746567.png`,
      `${S}/5634e504e5726ee8ed6266295697260c6750e62f.png`,
      `${S}/427c217d426c7ee7f4bc20ea837063a01b88ccef.png`,
      `${S}/1b185e42777ee4c90c9907fff962431ecc3d7a78.png`,
      `${S}/847236ad9c7990af101d6b0eb5b9e5920cd65fec.png`,
    ],
    credits: [
      [
        { label: "Dirección creativa", value: "Laia Torres" },
        { label: "Naming", value: "Laia Torres" },
        { label: "Diseño gráfico", value: "Laia Torres" },
      ],
      [{ label: "Servicios", value: "Identidad visual, Dirección de arte, Diseño gráfico, Aplicaciones" }],
      [{ label: "Fotografía", value: "Gedvile Tamosiunaite for DeathToStock" }],
      [{ label: "Año", value: "2024" }],
    ],
  },
];

async function main() {
  for (let i = 0; i < SEED.length; i++) {
    const p = SEED[i];
    const existing = await db.query.projects.findFirst({ where: eq(projects.slug, p.slug) });
    if (existing) {
      console.log(`· ${p.slug} ya existe, lo salto`);
      continue;
    }

    const [created] = await db
      .insert(projects)
      .values({
        slug: p.slug,
        name: p.name,
        description: p.description,
        chromeCenter: p.chromeCenter,
        chromeBottom: p.chromeBottom,
        credits: p.credits,
        sortOrder: i,
        published: true,
      })
      .returning({ id: projects.id });

    await db.insert(images).values(
      p.imageUrls.map((url, idx) => ({ projectId: created.id, url, alt: "", sortOrder: idx })),
    );

    console.log(`✓ ${p.slug} (${p.imageUrls.length} imágenes)`);
  }
  console.log("Seed completado.");
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
