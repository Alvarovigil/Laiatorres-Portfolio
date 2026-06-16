import { notFound } from "next/navigation";
import { getProjectById } from "@/db/queries";
import { ProjectEditor } from "../project-editor";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  return (
    <ProjectEditor
      initial={{
        id: project.id,
        slug: project.slug,
        name: project.name,
        description: project.description,
        chromeCenter: project.chromeCenter,
        chromeBottom: project.chromeBottom,
        coverUrl: project.coverUrl,
        category: project.category,
        year: project.year,
        services: project.services,
        agency: project.agency,
        collabs: project.collabs,
        credits: project.credits,
        published: project.published,
        images: project.images.map((i) => ({
          url: i.url,
          kind: i.kind,
          videoMode: i.videoMode,
          alt: i.alt,
          width: i.width,
          height: i.height,
          section: i.section,
          layout: i.layout,
          align: i.align,
        })),
      }}
    />
  );
}
