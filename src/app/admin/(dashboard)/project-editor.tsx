"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type DragEvent } from "react";
import { upload } from "@vercel/blob/client";
import { Button } from "@/components/ui/button";
import type { Collab, CreditGroups, ImageAlign, ImageLayout, VideoMode } from "@/db/schema";
import { slugify } from "@/lib/slug";
import { isVideoFile } from "@/lib/video";
import { cn } from "@/lib/utils";
import { saveProject, type ImageInput, type ProjectInput } from "../projects-actions";

// La galería es una lista ordenada de 3 tipos de elemento: líneas de SECCIÓN,
// IMÁGENES (subidas al Blob) y VÍDEOS (por enlace). Cada medio pertenece a la
// sección de la línea que tenga encima.
type ImageItem = {
  kind: "image";
  key: string;
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
  layout: ImageLayout;
  align: ImageAlign;
  uploading?: boolean;
  localUrl?: string;
};
type VideoItem = {
  kind: "video";
  key: string;
  url: string;
  alt: string;
  layout: ImageLayout;
  align: ImageAlign;
  videoMode: VideoMode;
};
type SectionItem = { kind: "section"; key: string; label: string };
type Item = ImageItem | VideoItem | SectionItem;

// Claves estables y deterministas (mismo orden en SSR e hidratación).
let _uid = 0;
const uid = () => `it-${_uid++}`;

// Reconstruye la lista intercalada a partir de los medios guardados: inserta una
// línea de sección cada vez que cambia la etiqueta de sección.
function buildInitialItems(media: ImageInput[]): Item[] {
  const out: Item[] = [];
  let prev: string | null = null;
  for (const m of media) {
    if (m.section !== prev) {
      if (m.section) out.push({ kind: "section", key: uid(), label: m.section });
      prev = m.section;
    }
    if (m.kind === "video") {
      out.push({ kind: "video", key: uid(), url: m.url, alt: m.alt, layout: m.layout, align: m.align, videoMode: m.videoMode });
    } else {
      out.push({
        kind: "image",
        key: uid(),
        url: m.url,
        alt: m.alt,
        width: m.width,
        height: m.height,
        layout: m.layout,
        align: m.align,
      });
    }
  }
  return out;
}

const LAYOUTS: { value: ImageLayout; label: string }[] = [
  { value: "wide", label: "Ancho" },
  { value: "pair", label: "Par" },
  { value: "single", label: "Individual" },
];

const ALIGNS: { value: ImageAlign; label: string }[] = [
  { value: "left", label: "Izquierda" },
  { value: "right", label: "Derecha" },
];

const VIDEO_MODES: { value: VideoMode; label: string }[] = [
  { value: "ambient", label: "Ambiente (auto, bucle, sin sonido)" },
  { value: "player", label: "Reproductor (controles, sonido)" },
];

export type EditorInitial = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  chromeCenter: string;
  chromeBottom: string;
  coverUrl: string;
  secondCoverUrl: string;
  category: string;
  year: string;
  homeCaption: string;
  services: string[];
  agency: string;
  collabs: Collab[];
  credits: CreditGroups;
  published: boolean;
  comingSoon: boolean;
  images: ImageInput[];
};

const field =
  "h-10 w-full rounded-[10px] border border-border bg-card px-3.5 text-[14px] text-foreground outline-none transition placeholder:text-muted-foreground/70 focus-visible:border-foreground/30 focus-visible:ring-2 focus-visible:ring-foreground/10";
const label = "ad-eyebrow";

export function ProjectEditor({ initial }: { initial: EditorInitial }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));
  const [description, setDescription] = useState(initial.description);
  const [chromeCenter, setChromeCenter] = useState(initial.chromeCenter);
  const [chromeBottom, setChromeBottom] = useState(initial.chromeBottom);
  const [coverUrl, setCoverUrl] = useState(initial.coverUrl);
  const [coverUploading, setCoverUploading] = useState(false);
  // Progreso (0–100) de la subida de un vídeo de la home, por campo.
  const [coverProgress, setCoverProgress] = useState<number | null>(null);
  const [secondProgress, setSecondProgress] = useState<number | null>(null);
  const [secondCoverUrl, setSecondCoverUrl] = useState(initial.secondCoverUrl);
  const [secondUploading, setSecondUploading] = useState(false);
  const [category, setCategory] = useState(initial.category);
  const [year, setYear] = useState(initial.year);
  const [homeCaption, setHomeCaption] = useState(initial.homeCaption);
  const [services, setServices] = useState<string[]>(initial.services.length ? initial.services : [""]);
  const [agency, setAgency] = useState(initial.agency);
  const [collabs, setCollabs] = useState<Collab[]>(initial.collabs);
  const [published, setPublished] = useState(initial.published);
  const [comingSoon, setComingSoon] = useState(initial.comingSoon);
  const [credits, setCredits] = useState<CreditGroups>(
    initial.credits.length ? initial.credits : [[{ label: "", value: "" }]],
  );
  const [items, setItems] = useState<Item[]>(() => buildInitialItems(initial.images));
  const fileRef = useRef<HTMLInputElement>(null);

  // ---- reordenar arrastrando ----
  // `draggingKey` activa `draggable` solo en el elemento cuyo asa se está
  // sujetando (así no se interfiere con la selección de texto en los inputs).
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragFrom = useRef<number | null>(null);

  function reorder(from: number, to: number) {
    setItems((prev) => {
      if (from === to || to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  function resetDrag() {
    dragFrom.current = null;
    setDraggingKey(null);
    setOverIndex(null);
  }

  function itemDragProps(i: number, key: string) {
    return {
      draggable: draggingKey === key,
      onDragStart: (e: DragEvent) => {
        dragFrom.current = i;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", key);
      },
      onDragEnter: () => {
        if (dragFrom.current !== null) setOverIndex(i);
      },
      onDragOver: (e: DragEvent) => {
        if (dragFrom.current !== null) e.preventDefault();
      },
      onDrop: (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (dragFrom.current !== null) reorder(dragFrom.current, i);
        resetDrag();
      },
      onDragEnd: resetDrag,
    };
  }

  const mediaCount = items.reduce((n, it) => n + (it.kind === "section" ? 0 : 1), 0);
  const isUploading = items.some((it) => it.kind === "image" && it.uploading);

  const effectiveSlug = slugTouched ? slug : slugify(name);

  function onNameChange(v: string) {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  // ---- imágenes ----
  function readDimensions(file: File): Promise<{ width: number; height: number; localUrl: string }> {
    return new Promise((resolve) => {
      const localUrl = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight, localUrl });
      img.onerror = () => resolve({ width: 0, height: 0, localUrl });
      img.src = localUrl;
    });
  }

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    for (const file of list) {
      const { width, height, localUrl } = await readDimensions(file);
      const placeholder: ImageItem = {
        kind: "image",
        key: uid(),
        url: "",
        alt: "",
        width: width || null,
        height: height || null,
        layout: "single",
        align: "left",
        uploading: true,
        localUrl,
      };
      setItems((prev) => [...prev, placeholder]);

      try {
        const url = await uploadToBlob(file, slugify(effectiveSlug) || "tmp");
        setItems((prev) =>
          prev.map((it) =>
            it.kind === "image" && it.localUrl === localUrl ? { ...it, url, uploading: false } : it,
          ),
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al subir imagen");
        setItems((prev) => prev.filter((it) => !(it.kind === "image" && it.localUrl === localUrl)));
      }
    }
  }

  // Sube uno de los dos medios de la home (portada o foto 2): imagen o vídeo.
  async function uploadCover(file: File, which: "cover" | "second") {
    const isVideo = file.type.startsWith("video/");
    if (!isVideo && !file.type.startsWith("image/")) return;
    const setUploading = which === "cover" ? setCoverUploading : setSecondUploading;
    const setProgress = which === "cover" ? setCoverProgress : setSecondProgress;
    setUploading(true);
    setError(null);
    try {
      setProgress(0);
      const url = await uploadToBlob(file, `${slugify(effectiveSlug) || "tmp"}-cover`, setProgress);
      (which === "cover" ? setCoverUrl : setSecondCoverUrl)(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir el medio de la home");
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }

  function moveItem(index: number, dir: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const t = index + dir;
      if (t < 0 || t >= next.length) return prev;
      [next[index], next[t]] = [next[t], next[index]];
      return next;
    });
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function patchImage(index: number, patch: Partial<ImageItem>) {
    setItems((prev) =>
      prev.map((it, i) => (i === index && it.kind === "image" ? { ...it, ...patch } : it)),
    );
  }

  function patchVideo(index: number, patch: Partial<VideoItem>) {
    setItems((prev) =>
      prev.map((it, i) => (i === index && it.kind === "video" ? { ...it, ...patch } : it)),
    );
  }

  function addVideo() {
    setItems((prev) => [
      ...prev,
      { kind: "video", key: uid(), url: "", alt: "", layout: "wide", align: "left", videoMode: "ambient" },
    ]);
  }

  function setSectionLabel(index: number, labelValue: string) {
    setItems((prev) =>
      prev.map((it, i) => (i === index && it.kind === "section" ? { ...it, label: labelValue } : it)),
    );
  }

  function addSection() {
    setItems((prev) => [...prev, { kind: "section", key: uid(), label: "" }]);
  }

  // ---- servicios ----
  function setService(index: number, v: string) {
    setServices((prev) => prev.map((s, i) => (i === index ? v : s)));
  }
  function addService() {
    setServices((prev) => [...prev, ""]);
  }
  function removeService(index: number) {
    setServices((prev) => prev.filter((_, i) => i !== index));
  }

  // ---- colabs (footer ficha V3) ----
  function setCollab(index: number, key: "handle" | "href", v: string) {
    setCollabs((prev) => prev.map((c, i) => (i === index ? { ...c, [key]: v } : c)));
  }
  function addCollab() {
    setCollabs((prev) => [...prev, { handle: "", href: "" }]);
  }
  function removeCollab(index: number) {
    setCollabs((prev) => prev.filter((_, i) => i !== index));
  }

  // ---- créditos ----
  function setCredit(g: number, r: number, key: "label" | "value", v: string) {
    setCredits((prev) =>
      prev.map((group, gi) =>
        gi === g ? group.map((c, ri) => (ri === r ? { ...c, [key]: v } : c)) : group,
      ),
    );
  }
  function addRow(g: number) {
    setCredits((prev) => prev.map((group, gi) => (gi === g ? [...group, { label: "", value: "" }] : group)));
  }
  function removeRow(g: number, r: number) {
    setCredits((prev) =>
      prev
        .map((group, gi) => (gi === g ? group.filter((_, ri) => ri !== r) : group))
        .filter((group) => group.length > 0),
    );
  }
  function addGroup() {
    setCredits((prev) => [...prev, [{ label: "", value: "" }]]);
  }

  // ---- guardar ----
  function save() {
    setError(null);
    if (isUploading || coverUploading || secondUploading) {
      setError("Espera a que terminen de subir las imágenes.");
      return;
    }
    // Recorre la lista en orden; cada imagen hereda la sección de la última línea
    // de sección vista por encima.
    let currentSection = "";
    const images: ImageInput[] = [];
    for (const it of items) {
      if (it.kind === "section") {
        currentSection = it.label.trim();
        continue;
      }
      if (it.kind === "video") {
        if (!it.url.trim()) continue; // ignora vídeos sin enlace
        images.push({
          url: it.url.trim(),
          kind: "video",
          videoMode: it.videoMode,
          alt: it.alt,
          width: null,
          height: null,
          section: currentSection,
          layout: it.layout,
          align: it.align,
        });
        continue;
      }
      images.push({
        url: it.url,
        kind: "image",
        videoMode: "ambient",
        alt: it.alt,
        width: it.width,
        height: it.height,
        section: currentSection,
        layout: it.layout,
        align: it.align,
      });
    }
    const input: ProjectInput = {
      id: initial.id,
      slug: effectiveSlug,
      name,
      description,
      chromeCenter,
      chromeBottom,
      coverUrl,
      secondCoverUrl,
      category,
      year,
      homeCaption,
      services,
      agency,
      collabs,
      credits,
      published,
      comingSoon,
      images,
    };
    startTransition(async () => {
      const res = await saveProject(input);
      if (res.ok) router.push("/admin");
      else setError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          ← Volver
        </Link>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Publicado
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={comingSoon} onChange={(e) => setComingSoon(e.target.checked)} />
            Próximamente
          </label>
          <Button onClick={save} disabled={pending}>
            {pending ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </div>

      {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

      {/* Datos básicos */}
      <section className="ad-card grid gap-4 p-6">
        <div className="grid gap-1.5">
          <span className={label}>Nombre</span>
          <input className={field} value={name} onChange={(e) => onNameChange(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <span className={label}>Slug (URL)</span>
          <input
            className={field}
            value={effectiveSlug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
          />
          <span className="text-xs text-muted-foreground">/project/{effectiveSlug || "…"}</span>
        </div>
        <div className="grid gap-1.5">
          <span className={label}>Descripción</span>
          <textarea
            className={cn(field, "h-32 resize-y py-2")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <span className={label}>Cabecera · centro</span>
            <input className={field} value={chromeCenter} onChange={(e) => setChromeCenter(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <span className={label}>Cabecera · inferior</span>
            <input className={field} value={chromeBottom} onChange={(e) => setChromeBottom(e.target.value)} />
          </div>
        </div>
      </section>

      {/* Meta de la ficha (V2): portada, categoría, año, servicios */}
      <section className="ad-card grid gap-4 p-6">
        <CoverPicker
          title="Portada (home)"
          url={coverUrl}
          uploading={coverUploading}
          progress={coverProgress}
          onPick={(f) => uploadCover(f, "cover")}
          onClear={() => setCoverUrl("")}
          hint="Imagen o vídeo (en bucle, sin sonido) y nombre que aparecen en la home, a la izquierda. Si lo dejas vacío, se usa la primera imagen de la galería."
        />
        <CoverPicker
          title="Foto 2 (home)"
          url={secondCoverUrl}
          uploading={secondUploading}
          progress={secondProgress}
          onPick={(f) => uploadCover(f, "second")}
          onClear={() => setSecondCoverUrl("")}
          hint="Segunda imagen o vídeo del proyecto en la home, a la derecha. Si lo dejas vacío, se usa la siguiente de la galería."
        />
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <span className={label}>Categoría</span>
            <input
              className={field}
              placeholder="Campañas estacionales"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <span className={label}>Año</span>
            <input
              className={field}
              placeholder="2024 / 2025"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-1.5">
          <span className={label}>Pie en la home</span>
          <input
            className={field}
            placeholder="IDENTIDAD | PACKAGING | DIRECCIÓN DE ARTE - 2024"
            value={homeCaption}
            onChange={(e) => setHomeCaption(e.target.value)}
          />
          <span className="text-xs text-muted-foreground">
            Texto bajo la primera imagen del proyecto en la home. Si lo dejas vacío, se usa categoría + año.
          </span>
        </div>
        <div className="grid gap-2">
          <span className={label}>Servicios</span>
          {services.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className={cn(field, "min-w-0 flex-1")}
                placeholder="Dirección de arte"
                value={s}
                onChange={(e) => setService(i, e.target.value)}
              />
              <button
                onClick={() => removeService(i)}
                className="px-1 text-destructive/80 hover:text-destructive"
              >
                ✕
              </button>
            </div>
          ))}
          <button onClick={addService} className="justify-self-start text-xs text-muted-foreground hover:text-foreground">
            + Añadir servicio
          </button>
        </div>
        <div className="grid gap-1.5">
          <span className={label}>Agencia / producción</span>
          <input
            className={field}
            placeholder="Firma Branding&Innovation Agency"
            value={agency}
            onChange={(e) => setAgency(e.target.value)}
          />
          <span className="text-xs text-muted-foreground">Aparece en el pie de la ficha: “Agency and production: …”.</span>
        </div>
        <div className="grid gap-2">
          <span className={label}>Colabs (footer)</span>
          {collabs.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className={cn(field, "w-44 shrink-0")}
                placeholder="@handle"
                value={c.handle}
                onChange={(e) => setCollab(i, "handle", e.target.value)}
              />
              <input
                className={cn(field, "min-w-0 flex-1")}
                placeholder="https://instagram.com/handle"
                value={c.href}
                onChange={(e) => setCollab(i, "href", e.target.value)}
              />
              <button onClick={() => removeCollab(i)} className="px-1 text-destructive/80 hover:text-destructive">
                ✕
              </button>
            </div>
          ))}
          <button onClick={addCollab} className="justify-self-start text-xs text-muted-foreground hover:text-foreground">
            + Añadir colab
          </button>
        </div>
      </section>

      {/* Galería: lista mixta de líneas de sección + imágenes */}
      <section className="ad-card grid gap-3 p-6">
        <div className="flex items-center justify-between">
          <span className={label}>Galería ({mediaCount})</span>
          <div className="flex items-center gap-3 text-sm">
            <button onClick={addSection} className="text-muted-foreground hover:text-foreground">
              + Sección
            </button>
            <button onClick={() => fileRef.current?.click()} className="text-muted-foreground hover:text-foreground">
              + Imágenes
            </button>
            <button onClick={addVideo} className="text-muted-foreground hover:text-foreground">
              + Vídeo
            </button>
          </div>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
          }}
          onClick={() => fileRef.current?.click()}
          className="ad-card-dashed cursor-pointer px-4 py-8 text-center text-sm text-muted-foreground transition hover:bg-muted/40"
        >
          Arrastra imágenes aquí o haz clic para seleccionar
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />

        <ul className="grid gap-2">
          {items.map((it, i) => {
            const dragging = draggingKey === it.key;
            const isOver = overIndex === i && draggingKey !== null && !dragging;
            const dragClass = cn(
              "transition-opacity",
              dragging && "opacity-40",
              isOver && "ring-2 ring-ring ring-offset-1",
            );
            const ctrlBtn =
              "flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-20";
            const controls = (
              <div className="flex shrink-0 flex-col items-center gap-0.5">
                <button
                  type="button"
                  aria-label="Arrastrar para reordenar"
                  title="Arrastrar para reordenar"
                  onMouseDown={() => setDraggingKey(it.key)}
                  onTouchStart={() => setDraggingKey(it.key)}
                  className={cn(ctrlBtn, "cursor-grab active:cursor-grabbing")}
                >
                  <GripIcon />
                </button>
                <button onClick={() => moveItem(i, -1)} disabled={i === 0} className={ctrlBtn} aria-label="Subir">
                  <ChevronIcon className="rotate-180" />
                </button>
                <button onClick={() => moveItem(i, 1)} disabled={i === items.length - 1} className={ctrlBtn} aria-label="Bajar">
                  <ChevronIcon />
                </button>
                <button onClick={() => removeItem(i)} className={cn(ctrlBtn, "hover:bg-destructive/10 hover:text-destructive")} aria-label="Eliminar">
                  <CloseIcon />
                </button>
              </div>
            );

            if (it.kind === "section") {
              return (
                <li key={it.key} {...itemDragProps(i, it.key)} className={cn("flex items-center gap-3 rounded-lg border border-border bg-muted/60 px-3 py-2", dragClass)}>
                  <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Sección
                  </span>
                  <input
                    className={cn(field, "min-w-0 flex-1 bg-background font-medium")}
                    placeholder="Nombre de la sección (p. ej. Verano 2025)"
                    value={it.label}
                    onChange={(e) => setSectionLabel(i, e.target.value)}
                  />
                  {controls}
                </li>
              );
            }

            if (it.kind === "video") {
              return (
                <li key={it.key} {...itemDragProps(i, it.key)} className={cn("flex items-start gap-3 rounded-lg border border-border p-2", dragClass)}>
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                    ▶
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <input
                      className={field}
                      placeholder="Enlace del vídeo (YouTube, Vimeo o .mp4)"
                      value={it.url}
                      onChange={(e) => patchVideo(i, { url: e.target.value })}
                    />
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                      <span className="text-[11px] text-muted-foreground">Modo</span>
                      <select
                        className={cn(field, "w-auto min-w-0 flex-1")}
                        value={it.videoMode}
                        onChange={(e) => patchVideo(i, { videoMode: e.target.value as VideoMode })}
                      >
                        {VIDEO_MODES.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                      <span className="text-[11px] text-muted-foreground">Tamaño</span>
                      <select
                        className={cn(field, "w-32 shrink-0")}
                        value={it.layout}
                        onChange={(e) => patchVideo(i, { layout: e.target.value as ImageLayout })}
                      >
                        {LAYOUTS.map((l) => (
                          <option key={l.value} value={l.value}>
                            {l.label}
                          </option>
                        ))}
                      </select>
                      {it.layout === "single" ? (
                        <>
                          <span className="text-[11px] text-muted-foreground">Lado</span>
                          <select
                            className={cn(field, "w-32 shrink-0")}
                            value={it.align}
                            onChange={(e) => patchVideo(i, { align: e.target.value as ImageAlign })}
                          >
                            {ALIGNS.map((a) => (
                              <option key={a.value} value={a.value}>
                                {a.label}
                              </option>
                            ))}
                          </select>
                        </>
                      ) : null}
                    </div>
                  </div>
                  {controls}
                </li>
              );
            }

            return (
              <li key={it.key} {...itemDragProps(i, it.key)} className={cn("flex items-start gap-3 rounded-lg border border-border p-2", dragClass)}>
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-muted">
                  {/* next/image no optimiza blobs locales; usamos <img> nativo aquí */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.url || it.localUrl}
                    alt=""
                    className={`h-full w-full object-cover ${it.uploading ? "opacity-50" : ""}`}
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <input
                    className={field}
                    placeholder="Texto alternativo (alt)"
                    value={it.alt}
                    onChange={(e) => patchImage(i, { alt: e.target.value })}
                  />
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                    <span className="text-[11px] text-muted-foreground">Tamaño</span>
                    <select
                      className={cn(field, "w-32 shrink-0")}
                      value={it.layout}
                      onChange={(e) => patchImage(i, { layout: e.target.value as ImageLayout })}
                    >
                      {LAYOUTS.map((l) => (
                        <option key={l.value} value={l.value}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                    {it.layout === "single" ? (
                      <>
                        <span className="text-[11px] text-muted-foreground">Lado</span>
                        <select
                          className={cn(field, "w-32 shrink-0")}
                          value={it.align}
                          onChange={(e) => patchImage(i, { align: e.target.value as ImageAlign })}
                        >
                          {ALIGNS.map((a) => (
                            <option key={a.value} value={a.value}>
                              {a.label}
                            </option>
                          ))}
                        </select>
                      </>
                    ) : null}
                  </div>
                </div>

                {controls}
              </li>
            );
          })}
        </ul>

        <p className="text-xs text-muted-foreground">
          Añade una <b>línea de sección</b> y coloca debajo sus imágenes y vídeos: todo lo que esté bajo una
          línea pertenece a esa sección hasta la siguiente. Reordena <b>arrastrando desde el asa (⠿)</b> o con
          las flechas. El <b>tamaño</b> define el bloque (“Ancho” ocupa
          todo, “Individual” media columna, dos “Par” seguidas van juntas). Los <b>vídeos</b> van por enlace
          (no ocupan tu almacén): elige <b>Ambiente</b> (auto, bucle, sin sonido) o <b>Reproductor</b>
          (controles y sonido).
        </p>
      </section>

      {/* Créditos */}
      <section className="ad-card grid gap-3 p-6">
        <span className={label}>Créditos</span>
        {credits.map((group, g) => (
          <div key={g} className="grid gap-2 rounded-lg border border-border p-3">
            {group.map((c, r) => (
              <div key={r} className="flex items-center gap-2">
                <input
                  className={cn(field, "w-40 shrink-0")}
                  placeholder="Etiqueta"
                  value={c.label}
                  onChange={(e) => setCredit(g, r, "label", e.target.value)}
                />
                <input
                  className={cn(field, "min-w-0 flex-1")}
                  placeholder="Valor"
                  value={c.value}
                  onChange={(e) => setCredit(g, r, "value", e.target.value)}
                />
                <button onClick={() => removeRow(g, r)} className="px-1 text-destructive/80 hover:text-destructive">✕</button>
              </div>
            ))}
            <button onClick={() => addRow(g)} className="justify-self-start text-xs text-muted-foreground hover:text-foreground">
              + Añadir línea
            </button>
          </div>
        ))}
        <button onClick={addGroup} className="justify-self-start text-sm text-muted-foreground hover:text-foreground">
          + Nuevo grupo de créditos
        </button>
      </section>

      <div className="flex justify-end">
        <Button onClick={save} disabled={pending}>
          {pending ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </div>
  );
}

// ── Iconos de los controles (asa, reordenar, eliminar) ──
function iconProps(className: string) {
  return {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
}

function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

// Asa de arrastre — 6 puntos (drag handle).
function GripIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <circle cx="9" cy="6" r="1.4" />
      <circle cx="15" cy="6" r="1.4" />
      <circle cx="9" cy="12" r="1.4" />
      <circle cx="15" cy="12" r="1.4" />
      <circle cx="9" cy="18" r="1.4" />
      <circle cx="15" cy="18" r="1.4" />
    </svg>
  );
}

// Sube un archivo directo del navegador a Vercel Blob (sin el límite de 4,5 MB
// de las funciones) y devuelve su URL pública. /api/admin/blob-upload firma el
// permiso solo con sesión iniciada. Los archivos grandes van por partes.
async function uploadToBlob(file: File, folder: string, onProgress?: (percentage: number) => void) {
  const name = slugify(file.name.replace(/\.[^.]+$/, "")) || "archivo";
  const ext = (file.name.match(/\.[^.]+$/)?.[0] ?? "").toLowerCase();
  const blob = await upload(`projects/${folder}/${name}${ext}`, file, {
    access: "public",
    handleUploadUrl: "/api/admin/blob-upload",
    contentType: file.type,
    multipart: file.size > 8 * 1024 * 1024,
    onUploadProgress: onProgress ? ({ percentage }) => onProgress(Math.round(percentage)) : undefined,
  });
  return blob.url;
}

// Selector de una imagen de la home: miniatura, subir/cambiar y quitar.
function CoverPicker({
  title,
  url,
  uploading,
  progress,
  onPick,
  onClear,
  hint,
}: {
  title: string;
  url: string;
  uploading: boolean;
  progress: number | null;
  onPick: (file: File) => void;
  onClear: () => void;
  hint: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="grid gap-1.5">
      <span className={label}>{title}</span>
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded border border-border bg-muted">
          {url && isVideoFile(url) ? (
            <video src={url} muted loop autoPlay playsInline className={`h-full w-full object-cover ${uploading ? "opacity-50" : ""}`} />
          ) : url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className={`h-full w-full object-cover ${uploading ? "opacity-50" : ""}`} />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
              vacío
            </div>
          )}
        </div>
        <button onClick={() => ref.current?.click()} className="text-sm text-muted-foreground hover:text-foreground">
          {uploading ? (progress !== null ? `Subiendo… ${progress}%` : "Subiendo…") : url ? "Cambiar" : "Subir imagen o vídeo"}
        </button>
        {url ? (
          <button onClick={onClear} className="text-sm text-destructive/80 hover:text-destructive">
            Quitar
          </button>
        ) : null}
        <input
          ref={ref}
          type="file"
          accept="image/*,video/mp4,video/webm,video/quicktime"
          hidden
          onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])}
        />
      </div>
      <span className="text-xs text-muted-foreground">{hint}</span>
    </div>
  );
}
