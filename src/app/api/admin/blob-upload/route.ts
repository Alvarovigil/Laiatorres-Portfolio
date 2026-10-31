import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import type { NextRequest } from "next/server";
import { isAuthenticated } from "@/lib/session";

// Subida directa del navegador a Vercel Blob (imágenes y vídeos del admin).
// Las funciones cortan los cuerpos de más de 4,5 MB, así que aquí solo se firma
// el permiso de subida; el archivo no pasa por el servidor.
const MAX_BYTES = 200 * 1024 * 1024;
const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export async function POST(request: NextRequest) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!(await isAuthenticated())) throw new Error("No autorizado");
        if (!pathname.startsWith("projects/")) throw new Error("Ruta no permitida");
        return {
          allowedContentTypes: ALLOWED,
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
        };
      },
    });
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Error al subir" }, { status: 400 });
  }
}
