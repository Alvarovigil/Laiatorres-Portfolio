import { listPublishedProjects } from "@/db/queries";
import { HomeView, type HomeCard } from "./home-view";

export default async function Home() {
  const projects = await listPublishedProjects();

  // Portada de cada proyecto: la imagen marcada como portada o, si no hay, la
  // primera imagen (no vídeo) de su galería.
  const cards: HomeCard[] = projects
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      cover: p.coverUrl || p.images.find((i) => i.kind === "image")?.url || "",
    }))
    .filter((c) => c.cover);

  return <HomeView cards={cards} />;
}
