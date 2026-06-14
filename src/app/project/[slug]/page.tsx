import { notFound } from "next/navigation";
import { getProjectBySlug, listPublishedProjects } from "@/db/queries";
import { ProjectView } from "./project-view";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return { title: `${project.name} — Laia Torres`, description: project.description };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [project, published] = await Promise.all([getProjectBySlug(slug), listPublishedProjects()]);
  if (!project || !project.published) notFound();

  const idx = published.findIndex((p) => p.id === project.id);
  const next = published[(idx + 1) % published.length] ?? project;

  return (
    <ProjectView
      index={String(idx + 1).padStart(2, "0")}
      name={project.name}
      description={project.description}
      chromeCenter={project.chromeCenter || project.name}
      chromeBottom={project.chromeBottom}
      images={project.images.map((i) => i.url)}
      credits={project.credits}
      nextHref={`/project/${next.slug}`}
      nextLabel="→ Siguiente proyecto"
    />
  );
}
