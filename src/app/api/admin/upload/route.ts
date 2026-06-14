import { put } from "@vercel/blob";
import type { NextRequest } from "next/server";
import { isAuthenticated } from "@/lib/session";
import { slugify } from "@/lib/slug";

// Sube una imagen a Vercel Blob y devuelve su URL pública.
// El cliente la llama por cada archivo arrastrado al editor.
export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const projectSlug = String(form.get("slug") ?? "tmp");

  if (!(file instanceof File)) {
    return Response.json({ error: "Falta el archivo." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "Solo se permiten imágenes." }, { status: 400 });
  }

  const folder = slugify(projectSlug) || "tmp";
  const safeName = slugify(file.name.replace(/\.[^.]+$/, "")) || "img";
  const ext = (file.name.match(/\.[^.]+$/)?.[0] ?? "").toLowerCase();

  const blob = await put(`projects/${folder}/${safeName}${ext}`, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type,
  });

  return Response.json({ url: blob.url });
}
