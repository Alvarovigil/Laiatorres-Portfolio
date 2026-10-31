import type { VideoMode } from "@/db/schema";

// Resultado para el render: un <iframe> (YouTube/Vimeo u otro embed) o un
// archivo de vídeo nativo (<video> con .mp4/.webm/...).
export type VideoEmbed =
  | { type: "iframe"; src: string }
  | { type: "file"; src: string; ambient: boolean };

function youtubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  return m ? m[1] : null;
}

function vimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

const FILE_RE = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i;

// ¿La URL es un archivo de vídeo (no un embed)? Sirve para las imágenes de la
// home, que guardan solo la URL.
export function isVideoFile(url: string): boolean {
  return FILE_RE.test(url);
}

export function videoEmbed(url: string, mode: VideoMode): VideoEmbed {
  const ambient = mode === "ambient";

  const yt = youtubeId(url);
  if (yt) {
    const src = ambient
      ? `https://www.youtube.com/embed/${yt}?autoplay=1&mute=1&loop=1&playlist=${yt}&controls=0&playsinline=1&rel=0&modestbranding=1`
      : `https://www.youtube.com/embed/${yt}?rel=0&modestbranding=1`;
    return { type: "iframe", src };
  }

  const vi = vimeoId(url);
  if (vi) {
    // background=1 = autoplay silencioso en bucle y sin controles (modo ambiente).
    const src = ambient
      ? `https://player.vimeo.com/video/${vi}?autoplay=1&muted=1&loop=1&background=1`
      : `https://player.vimeo.com/video/${vi}`;
    return { type: "iframe", src };
  }

  if (FILE_RE.test(url)) {
    return { type: "file", src: url, ambient };
  }

  // Enlace no reconocido: lo usamos tal cual como iframe (puede ser ya un embed).
  return { type: "iframe", src: url };
}
