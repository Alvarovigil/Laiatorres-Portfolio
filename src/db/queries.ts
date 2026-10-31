import { asc, eq } from "drizzle-orm";
import { db } from "./index";
import { images, projects, type Project, type ProjectImage } from "./schema";

export type ProjectWithImages = Project & { images: ProjectImage[] };

// Lista para el admin (todos, publicados o no), ordenada por sortOrder.
export async function listProjects(): Promise<Project[]> {
  return db.select().from(projects).orderBy(asc(projects.sortOrder), asc(projects.createdAt));
}

// Lista pública (publicados, incluidos los «próximamente») con sus imágenes.
export async function listPublishedProjects(): Promise<ProjectWithImages[]> {
  const rows = await db.query.projects.findMany({
    where: eq(projects.published, true),
    orderBy: [asc(projects.sortOrder), asc(projects.createdAt)],
    with: { images: { orderBy: [asc(images.sortOrder)] } },
  });
  return rows as ProjectWithImages[];
}

export async function getProjectById(id: string): Promise<ProjectWithImages | null> {
  const row = await db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: { images: { orderBy: [asc(images.sortOrder)] } },
  });
  return (row as ProjectWithImages) ?? null;
}

export async function getProjectBySlug(slug: string): Promise<ProjectWithImages | null> {
  const row = await db.query.projects.findFirst({
    where: eq(projects.slug, slug),
    with: { images: { orderBy: [asc(images.sortOrder)] } },
  });
  return (row as ProjectWithImages) ?? null;
}
