import { notFound } from "next/navigation";
import { getProjectBySlug, listPublishedProjects } from "@/db/queries";
import { buildSections } from "@/lib/taqta";
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

  // La descripción se parte en párrafos por líneas en blanco.
  const about = project.description
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <ProjectView
      index={String(idx + 1).padStart(3, "0")}
      name={project.name}
      category={project.category}
      year={project.year}
      about={about.length ? about : [project.description]}
      services={project.services}
      // ProjectTaqta usa una lista plana de créditos: aplanamos los grupos.
      credits={project.credits.flat()}
      sections={buildSections(project.images)}
      nextHref={`/project/${next.slug}`}
      nextLabel="↳ Siguiente proyecto"
    />
  );
}
