"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { CreditGroups } from "@/db/schema";
import { slugify } from "@/lib/slug";
import { saveProject, type ImageInput, type ProjectInput } from "../projects-actions";

type EditorImage = ImageInput & { uploading?: boolean; localUrl?: string };

export type EditorInitial = {
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
  const [published, setPublished] = useState(initial.published);
  const [credits, setCredits] = useState<CreditGroups>(
    initial.credits.length ? initial.credits : [[{ label: "", value: "" }]],
  );
  const [imgs, setImgs] = useState<EditorImage[]>(initial.images);
  const fileRef = useRef<HTMLInputElement>(null);

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
      const placeholder: EditorImage = {
        url: "",
        alt: "",
        width: width || null,
        height: height || null,
        uploading: true,
        localUrl,
      };
      setImgs((prev) => [...prev, placeholder]);

      const form = new FormData();
      form.append("file", file);
      form.append("slug", effectiveSlug || "tmp");
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: form });
        if (!res.ok) throw new Error((await res.json()).error ?? "Error al subir");
        const { url } = await res.json();
        setImgs((prev) =>
          prev.map((i) => (i.localUrl === localUrl ? { ...i, url, uploading: false } : i)),
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al subir imagen");
        setImgs((prev) => prev.filter((i) => i.localUrl !== localUrl));
      }
    }
  }

  function moveImg(index: number, dir: -1 | 1) {
    setImgs((prev) => {
      const next = [...prev];
      const t = index + dir;
      if (t < 0 || t >= next.length) return prev;
      [next[index], next[t]] = [next[t], next[index]];
      return next;
    });
  }

  function removeImg(index: number) {
    setImgs((prev) => prev.filter((_, i) => i !== index));
  }

  function setAlt(index: number, alt: string) {
    setImgs((prev) => prev.map((i, idx) => (idx === index ? { ...i, alt } : i)));
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
    if (imgs.some((i) => i.uploading)) {
      setError("Espera a que terminen de subir las imágenes.");
      return;
    }
    const input: ProjectInput = {
      id: initial.id,
      slug: effectiveSlug,
      name,
      description,
      chromeCenter,
      chromeBottom,
      credits,
      published,
      images: imgs.map(({ url, alt, width, height }) => ({ url, alt, width, height })),
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
            className={`${field} h-32 resize-y py-2`}
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

      {/* Imágenes */}
      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <span className={label}>Imágenes ({imgs.length})</span>
          <button
            onClick={() => fileRef.current?.click()}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            + Añadir
          </button>
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
          {imgs.map((img, i) => (
            <li key={img.url || img.localUrl || i} className="flex items-center gap-3 rounded-lg border border-border p-2">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-muted">
                {/* next/image no optimiza blobs locales; usamos <img> nativo aquí */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url || img.localUrl}
                  alt=""
                  className={`h-full w-full object-cover ${img.uploading ? "opacity-50" : ""}`}
                />
              </div>
              <input
                className={`${field} flex-1`}
                placeholder="Texto alternativo (alt)"
                value={img.alt}
                onChange={(e) => setAlt(i, e.target.value)}
              />
              <div className="flex items-center gap-1 text-muted-foreground">
                <button onClick={() => moveImg(i, -1)} disabled={i === 0} className="px-1 disabled:opacity-25">▲</button>
                <button onClick={() => moveImg(i, 1)} disabled={i === imgs.length - 1} className="px-1 disabled:opacity-25">▼</button>
                <button onClick={() => removeImg(i)} className="px-1 text-destructive/80 hover:text-destructive">✕</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Créditos */}
      <section className="grid gap-3">
        <span className={label}>Créditos</span>
        {credits.map((group, g) => (
          <div key={g} className="grid gap-2 rounded-lg border border-border p-3">
            {group.map((c, r) => (
              <div key={r} className="flex items-center gap-2">
                <input
                  className={`${field} w-40`}
                  placeholder="Etiqueta"
                  value={c.label}
                  onChange={(e) => setCredit(g, r, "label", e.target.value)}
                />
                <input
                  className={`${field} flex-1`}
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
