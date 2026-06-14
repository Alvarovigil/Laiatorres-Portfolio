import type { Block, Section } from "@/components/project-taqta";

// Imagen tal y como la necesita el constructor de secciones.
export type TaqtaImage = {
  url: string;
  section: string;
  layout: "wide" | "pair" | "single";
  width: number | null;
  height: number | null;
};

function ratioOf(img: TaqtaImage): number | undefined {
  if (img.width && img.height) return img.width / img.height;
  return undefined;
}

// Agrupa las imágenes (en orden) por su etiqueta de sección y dentro de cada
// sección las convierte en bloques. Dos imágenes "pair" consecutivas se unen en
// un bloque par; una "pair" suelta cae a "single".
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
        blocks.push({ type: "single", src: pendingPair.url, ratio: ratioOf(pendingPair) });
        pendingPair = null;
      }
    };

    for (const img of imgs) {
      if (img.layout === "pair") {
        if (pendingPair) {
          blocks.push({
            type: "pair",
            src: [pendingPair.url, img.url],
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
      blocks.push({ type: img.layout, src: img.url, ratio: ratioOf(img) });
    }
    flushLonePair();

    return { label, blocks };
  });
}
