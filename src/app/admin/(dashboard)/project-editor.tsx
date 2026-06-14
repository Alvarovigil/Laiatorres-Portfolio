"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { CreditGroups, ImageLayout } from "@/db/schema";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";
import { saveProject, type ImageInput, type ProjectInput } from "../projects-actions";

// La galería es una lista ordenada de dos tipos de elemento: líneas de SECCIÓN
// e IMÁGENES. Cada imagen pertenece a la sección de la línea que tenga encima.
type ImageItem = {
  kind: "image";
  key: string;
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
  layout: ImageLayout;
  uploading?: boolean;
  localUrl?: string;
};
type SectionItem = { kind: "section"; key: string; label: string };
type Item = ImageItem | SectionItem;

// Claves estables y deterministas (mismo orden en SSR e hidratación).
let _uid = 0;
const uid = () => `it-${_uid++}`;

// Reconstruye la lista intercalada a partir de las imágenes guardadas: inserta
// una línea de sección cada vez que cambia la etiqueta de sección.
function buildInitialItems(images: ImageInput[]): Item[] {
  const out: Item[] = [];
  let prev: string | null = null;
  for (const im of images) {
    if (im.section !== prev) {
      if (im.section) out.push({ kind: "section", key: uid(), label: im.section });
      prev = im.section;
    }
    out.push({
      kind: "image",
      key: uid(),
      url: im.url,
      alt: im.alt,
      width: im.width,
      height: im.height,
      layout: im.layout,
    });
  }
  return out;
}

const LAYOUTS: { value: ImageLayout; label: string }[] = [
  { value: "wide", label: "Ancho" },
  { value: "pair", label: "Par" },
  { value: "single", label: "Individual" },
];

export type EditorInitial = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  chromeCenter: string;
  chromeBottom: string;
  category: string;
  year: string;
  services: string[];
  credits: CreditGroups;
  published: boolean;
  images: ImageInput[];
};

const field =
  "h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
const label = "text-xs font-medium uppercase tracking-wide text-muted-foreground";

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
  const [category, setCategory] = useState(initial.category);
  const [year, setYear] = useState(initial.year);
  const [services, setServices] = useState<string[]>(initial.services.length ? initial.services : [""]);
  const [published, setPublished] = useState(initial.published);
  const [credits, setCredits] = useState<CreditGroups>(
    initial.credits.length ? initial.credits : [[{ label: "", value: "" }]],
  );
  const [items, setItems] = useState<Item[]>(() => buildInitialItems(initial.images));
  const fileRef = useRef<HTMLInputElement>(null);

  const imageCount = items.reduce((n, it) => n + (it.kind === "image" ? 1 : 0), 0);
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
        uploading: true,
        localUrl,
      };
      setItems((prev) => [...prev, placeholder]);

      const form = new FormData();
      form.append("file", file);
      form.append("slug", effectiveSlug || "tmp");
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: form });
        if (!res.ok) throw new Error((await res.json()).error ?? "Error al subir");
        const { url } = await res.json();
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
    if (isUploading) {
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
      images.push({
        url: it.url,
        alt: it.alt,
        width: it.width,
        height: it.height,
        section: currentSection,
        layout: it.layout,
      });
    }
    const input: ProjectInput = {
      id: initial.id,
      slug: effectiveSlug,
      name,
      description,
      chromeCenter,
      chromeBottom,
      category,
      year,
      services,
      credits,
      published,
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
          <Button onClick={save} disabled={pending}>
            {pending ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </div>

      {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

      {/* Datos básicos */}
      <section className="grid gap-4">
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

      {/* Meta de la ficha (V2): categoría, año, servicios */}
      <section className="grid gap-4">
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
      </section>

      {/* Galería: lista mixta de líneas de sección + imágenes */}
      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <span className={label}>Galería ({imageCount})</span>
          <div className="flex items-center gap-3 text-sm">
            <button onClick={addSection} className="text-muted-foreground hover:text-foreground">
              + Sección
            </button>
            <button onClick={() => fileRef.current?.click()} className="text-muted-foreground hover:text-foreground">
              + Imágenes
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
          className="cursor-pointer rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground hover:bg-muted/40"
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
            const controls = (
              <div className="flex shrink-0 flex-col items-center gap-1 text-muted-foreground">
                <button onClick={() => moveItem(i, -1)} disabled={i === 0} className="px-1 leading-none disabled:opacity-25">▲</button>
                <button onClick={() => moveItem(i, 1)} disabled={i === items.length - 1} className="px-1 leading-none disabled:opacity-25">▼</button>
                <button onClick={() => removeItem(i)} className="px-1 leading-none text-destructive/80 hover:text-destructive">✕</button>
              </div>
            );

            if (it.kind === "section") {
              return (
                <li key={it.key} className="flex items-center gap-3 rounded-lg border border-border bg-muted/60 px-3 py-2">
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

            return (
              <li key={it.key} className="flex items-start gap-3 rounded-lg border border-border p-2">
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
                  </div>
                </div>

                {controls}
              </li>
            );
          })}
        </ul>

        <p className="text-xs text-muted-foreground">
          Añade una <b>línea de sección</b> y arrastra debajo sus imágenes: todas las fotos bajo una línea
          pertenecen a esa sección hasta la siguiente. El <b>tamaño</b> define el bloque: “Ancho” ocupa todo,
          “Individual” media columna, y dos “Par” seguidas van juntas en una fila.
        </p>
      </section>

      {/* Créditos */}
      <section className="grid gap-3">
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
