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
        credits: project.credits,
        published: project.published,
        images: project.images.map((i) => ({
          url: i.url,
          alt: i.alt,
          width: i.width,
          height: i.height,
        })),
      }}
    />
  );
}
