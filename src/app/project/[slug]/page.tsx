import { notFound } from "next/navigation";
import { getProjectBySlug, listPublishedProjects } from "@/db/queries";
import { buildSections } from "@/lib/taqta";
import { ProjectView } from "./project-view";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  const description = project.description || `${project.name} — Laia Torres.`;
  return {
    title: project.name,
    description,
    openGraph: { title: `${project.name} — Laia Torres`, description },
  };
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
      name={project.name}
      about={about.length ? about : [project.description]}
      services={project.services}
      agency={project.agency}
      collabs={project.collabs}
      sections={buildSections(project.images)}
      nextHref={`/project/${next.slug}`}
    />
  );
}
