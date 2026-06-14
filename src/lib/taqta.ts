import type { Block, Media, Section } from "@/components/project-taqta";
import type { MediaKind, VideoMode } from "@/db/schema";

// Medio tal y como lo necesita el constructor de secciones.
export type TaqtaImage = {
  url: string;
  kind: MediaKind;
  videoMode: VideoMode;
  alt: string;
  section: string;
  layout: "wide" | "pair" | "single";
  width: number | null;
  height: number | null;
};

function ratioOf(img: TaqtaImage): number | undefined {
  if (img.width && img.height) return img.width / img.height;
  return undefined;
}

function mediaOf(img: TaqtaImage): Media {
  return { url: img.url, kind: img.kind, videoMode: img.videoMode, alt: img.alt };
}

// Agrupa los medios (en orden) por su etiqueta de sección y dentro de cada
// sección los convierte en bloques. Dos medios "pair" consecutivos se unen en
// un bloque par; uno "pair" suelto cae a "single".
export function buildSections(images: TaqtaImage[]): Section[] {
  const order: string[] = [];
  const groups = new Map<string, TaqtaImage[]>();
  for (const img of images) {
    const key = img.section || "";
    if (!groups.has(key)) {
      groups.set(key, []);
      order.push(key);
    }
    groups.get(key)!.push(img);
  }

  return order.map((label) => {
    const imgs = groups.get(label)!;
    const blocks: Block[] = [];
    let pendingPair: TaqtaImage | null = null;

    const flushLonePair = () => {
      if (pendingPair) {
        blocks.push({ type: "single", media: mediaOf(pendingPair), ratio: ratioOf(pendingPair) });
        pendingPair = null;
      }
    };

    for (const img of imgs) {
      if (img.layout === "pair") {
        if (pendingPair) {
          blocks.push({
            type: "pair",
            media: [mediaOf(pendingPair), mediaOf(img)],
            ratio: ratioOf(pendingPair) ?? ratioOf(img),
          });
          pendingPair = null;
        } else {
          pendingPair = img;
        }
        continue;
      }
      // wide / single rompen una pareja pendiente.
      flushLonePair();
      blocks.push({ type: img.layout, media: mediaOf(img), ratio: ratioOf(img) });
    }
    flushLonePair();

    return { label, blocks };
  });
}
