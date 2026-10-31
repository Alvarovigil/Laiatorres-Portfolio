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
  // «Próximamente» no es navegable: ni ficha ni siguiente proyecto.
  if (!project || !project.published || project.comingSoon) notFound();

  const open = published.filter((p) => !p.comingSoon);
  const idx = open.findIndex((p) => p.id === project.id);
  const next = open[(idx + 1) % open.length] ?? project;

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
