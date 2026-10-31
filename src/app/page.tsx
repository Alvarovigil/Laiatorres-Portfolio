import { listPublishedProjects } from "@/db/queries";
import { isVideoFile } from "@/lib/video";
import { HomeView2, type WorkProject } from "./home-view-2";

// Selección manual de medios para la home, por proyecto (orden visual 1,2,3).
// Índices en p.images (orden sortOrder). Julia: 18.jpg (portada) + 05.jpg.
const HOME_MEDIA: Record<string, number[]> = {
  "julia-perfumeries": [17, 4],
  "palau-fugit": [0, 1], // solo 2 imágenes
  relats: [0, 13], // vídeo hero + stickers (evita el vídeo largo de la landing)
};

// Medio de la home elegido en el admin (portada o foto 2): imagen o vídeo en
// bucle, según la extensión de la URL.
function homeMedia(url: string): WorkProject["media"][number] {
  return { url, kind: isVideoFile(url) ? "video" : "image", videoMode: "ambient" };
}

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
        // La portada del admin manda sobre la selección manual (izquierda).
        if (p.coverUrl) media.splice(0, 1, homeMedia(p.coverUrl));
      } else {
        // Por defecto: portada (si hay) + primeras imágenes/vídeos.
        if (p.coverUrl) media.push(homeMedia(p.coverUrl));
        for (const i of p.images) {
          if (media.length >= 2) break;
          if (media.some((m) => m.url === i.url)) continue;
          media.push({ url: i.url, kind: i.kind, videoMode: i.videoMode });
        }
      }
      // Foto 2 elegida en el admin: sustituye a la de la derecha.
      if (p.secondCoverUrl) media.splice(1, 1, homeMedia(p.secondCoverUrl));
      return {
        slug: p.slug,
        name: p.name,
        category: p.category,
        year: p.year,
        homeCaption: p.homeCaption,
        comingSoon: p.comingSoon,
        media,
      };
    })
    .filter((p) => p.media.length > 0);

  return <HomeView2 work={work} />;
}
