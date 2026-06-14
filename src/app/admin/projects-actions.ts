"use server";

import { del } from "@vercel/blob";
import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { images, projects, type CreditGroups } from "@/db/schema";
import { requireAuth } from "@/lib/session";
import { slugify } from "@/lib/slug";

export type ImageInput = {
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
};

export type ProjectInput = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  chromeCenter: string;
  chromeBottom: string;
  credits: CreditGroups;
  published: boolean;
  images: ImageInput[];
};

export type SaveResult = { ok: true; id: string; slug: string } | { ok: false; error: string };

function normalize(input: ProjectInput) {
  const name = input.name.trim();
  const slug = (input.slug.trim() ? slugify(input.slug) : slugify(name)) || "proyecto";
  // Filtra créditos/imágenes vacíos.
  const credits: CreditGroups = (input.credits ?? [])
    .map((group) => group.filter((c) => c.label.trim() || c.value.trim()))
    .filter((group) => group.length > 0);
  const imgs = (input.images ?? []).filter((i) => i.url.trim());
  return { name, slug, credits, imgs };
}

async function ensureUniqueSlug(slug: string, ignoreId?: string): Promise<string> {
  let candidate = slug;
  let n = 2;
  // Reintenta con sufijo -2, -3… si choca con otro proyecto.
  for (;;) {
    const existing = await db.query.projects.findFirst({
      where: eq(projects.slug, candidate),
      columns: { id: true },
    });
    if (!existing || existing.id === ignoreId) return candidate;
    candidate = `${slug}-${n++}`;
  }
}

export async function saveProject(input: ProjectInput): Promise<SaveResult> {
  await requireAuth();

  const { name, slug: baseSlug, credits, imgs } = normalize(input);
  if (!name) return { ok: false, error: "El nombre es obligatorio." };

  const slug = await ensureUniqueSlug(baseSlug, input.id);

  if (input.id) {
    // UPDATE
    await db
      .update(projects)
      .set({
        slug,
        name,
        description: input.description.trim(),
        chromeCenter: input.chromeCenter.trim(),
        chromeBottom: input.chromeBottom.trim(),
        credits,
        published: input.published,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, input.id));

    await replaceImages(input.id, imgs);
    revalidatePath("/admin");
    revalidatePath(`/project/${slug}`);
    return { ok: true, id: input.id, slug };
  }

  // CREATE — al final del orden actual.
  const last = await db
    .select({ sortOrder: projects.sortOrder })
    .from(projects)
    .orderBy(asc(projects.sortOrder));
  const nextOrder = last.length ? last[last.length - 1].sortOrder + 1 : 0;

  const [created] = await db
    .insert(projects)
    .values({
      slug,
      name,
      description: input.description.trim(),
      chromeCenter: input.chromeCenter.trim(),
      chromeBottom: input.chromeBottom.trim(),
      credits,
      published: input.published,
      sortOrder: nextOrder,
    })
    .returning({ id: projects.id });

  await replaceImages(created.id, imgs);
  revalidatePath("/admin");
  revalidatePath(`/project/${slug}`);
  return { ok: true, id: created.id, slug };
}

// Estrategia simple: borra las imágenes del proyecto y reinserta la lista nueva
// (el orden = índice). Limpia de Blob las que se hayan quitado.
async function replaceImages(projectId: string, imgs: ImageInput[]) {
  const current = await db
    .select({ url: images.url })
    .from(images)
    .where(eq(images.projectId, projectId));

  const keepUrls = new Set(imgs.map((i) => i.url));
  const removed = current.filter((c) => !keepUrls.has(c.url)).map((c) => c.url);
  await deleteBlobs(removed);

  await db.delete(images).where(eq(images.projectId, projectId));
  if (imgs.length) {
    await db.insert(images).values(
      imgs.map((i, idx) => ({
        projectId,
        url: i.url,
        alt: i.alt.trim(),
        width: i.width,
        height: i.height,
        sortOrder: idx,
      })),
    );
  }
}

export async function deleteProject(id: string): Promise<void> {
  await requireAuth();
  const imgs = await db.select({ url: images.url }).from(images).where(eq(images.projectId, id));
  await deleteBlobs(imgs.map((i) => i.url));
  await db.delete(projects).where(eq(projects.id, id)); // cascade borra images
  revalidatePath("/admin");
}

export async function setPublished(id: string, published: boolean): Promise<void> {
  await requireAuth();
  await db.update(projects).set({ published, updatedAt: new Date() }).where(eq(projects.id, id));
  revalidatePath("/admin");
}

// Reordena todo el archivo según el array de ids recibido.
export async function reorderProjects(orderedIds: string[]): Promise<void> {
  await requireAuth();
  await Promise.all(
    orderedIds.map((id, idx) =>
      db.update(projects).set({ sortOrder: idx }).where(eq(projects.id, id)),
    ),
  );
  revalidatePath("/admin");
}

// Borra blobs de Vercel; ignora los que no estén alojados allí (p.ej. /projects
// locales de la migración inicial).
async function deleteBlobs(urls: string[]) {
  const hosted = urls.filter((u) => u.startsWith("https://") && u.includes(".blob.vercel-storage.com"));
  if (!hosted.length) return;
  try {
    await del(hosted);
  } catch {
    // No bloqueamos la operación si falla la limpieza del blob.
  }
}
