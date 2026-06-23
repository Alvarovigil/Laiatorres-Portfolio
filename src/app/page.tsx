import { listPublishedProjects } from "@/db/queries";
import { HomeView2, type WorkProject } from "./home-view-2";

// Selección manual de medios para la home, por proyecto (orden visual 1,2,3).
// Índices en p.images (orden sortOrder). Julia: 18.jpg (portada) + 05.jpg.
const HOME_MEDIA: Record<string, number[]> = {
  "julia-perfumeries": [17, 4],
  "palau-fugit": [0, 1], // solo 2 imágenes
};

export default async function Home() {
  const projects = await listPublishedProjects();

  // Home 2.0: 2–3 medios por proyecto para la composición de "Selected Work".
  const work: WorkProject[] = projects
    .map((p) => {
      const order = HOME_MEDIA[p.slug];
      const media: WorkProject["media"] = [];
      if (order) {
        // Selección manual por índice de galería, en el orden indicado.
        for (const idx of order) {
          const img = p.images[idx];
          if (img) media.push({ url: img.url, kind: img.kind, videoMode: img.videoMode });
        }
      } else {
        // Por defecto: portada (si hay) + primeras imágenes/vídeos.
        if (p.coverUrl) media.push({ url: p.coverUrl, kind: "image", videoMode: "ambient" });
        for (const i of p.images) {
          if (media.length >= 2) break;
          if (media.some((m) => m.url === i.url)) continue;
          media.push({ url: i.url, kind: i.kind, videoMode: i.videoMode });
        }
      }
      return { slug: p.slug, name: p.name, category: p.category, year: p.year, homeCaption: p.homeCaption, media };
    })
    .filter((p) => p.media.length > 0);

  return <HomeView2 work={work} />;
}
