"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { Project } from "@/db/schema";
import { deleteProject, reorderProjects, setComingSoon, setPublished } from "../projects-actions";

export function ProjectList({ projects }: { projects: Project[] }) {
  const [items, setItems] = useState(projects);
  const [pending, startTransition] = useTransition();

  function move(index: number, dir: -1 | 1) {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    startTransition(() => reorderProjects(next.map((p) => p.id)));
  }

  function togglePublish(p: Project) {
    setItems((prev) => prev.map((x) => (x.id === p.id ? { ...x, published: !x.published } : x)));
    startTransition(() => setPublished(p.id, !p.published));
  }

  function toggleComingSoon(p: Project) {
    setItems((prev) => prev.map((x) => (x.id === p.id ? { ...x, comingSoon: !x.comingSoon } : x)));
    startTransition(() => setComingSoon(p.id, !p.comingSoon));
  }

  function remove(p: Project) {
    if (!confirm(`¿Borrar "${p.name}"? Se eliminarán también sus imágenes.`)) return;
    setItems((prev) => prev.filter((x) => x.id !== p.id));
    startTransition(() => deleteProject(p.id));
  }

  return (
    <ul className="ad-card divide-y divide-border/70 overflow-hidden" data-pending={pending}>
      {items.map((p, i) => (
        <li key={p.id} className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-muted/40">
          <div className="flex flex-col">
            <button
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-20"
              aria-label="Subir"
            >
              <Chevron className="rotate-180" />
            </button>
            <button
              onClick={() => move(i, 1)}
              disabled={i === items.length - 1}
              className="flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-20"
              aria-label="Bajar"
            >
              <Chevron />
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <Link href={`/admin/${p.id}`} className="block truncate text-sm font-medium hover:underline">
              {String(i + 1).padStart(2, "0")} · {p.name}
            </Link>
            <p className="truncate text-xs text-muted-foreground">/{p.slug}</p>
          </div>

          <button
            onClick={() => togglePublish(p)}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-medium ${
              p.published
                ? "bg-foreground/[0.08] text-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {p.published ? "Publicado" : "Borrador"}
          </button>

          <button
            onClick={() => toggleComingSoon(p)}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-medium ${
              p.comingSoon
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {p.comingSoon ? "Próximamente: sí" : "Próximamente: no"}
          </button>

          <Link
            href={`/admin/${p.id}`}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Editar
          </Link>
          <button
            onClick={() => remove(p)}
            className="text-xs text-destructive/80 hover:text-destructive"
          >
            Borrar
          </button>
        </li>
      ))}
    </ul>
  );
}

// Chevron fino (apunta hacia abajo; se rota 180º para "subir").
function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
