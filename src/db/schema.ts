import { relations } from "drizzle-orm";
import { pgTable, uuid, text, integer, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";

// Un par etiqueta/valor de los créditos. Los créditos se guardan como grupos
// (líneas en blanco entre grupos), igual que esperaba <ProjectFicha>.
export type Credit = { label: string; value: string };
export type CreditGroups = Credit[][];
export type ImageLayout = "wide" | "pair" | "single";
// Lado de una imagen "single" en la rejilla de la ficha V3 (la otra columna
// queda vacía, creando el ritmo escalonado).
export type ImageAlign = "left" | "right";
export type MediaKind = "image" | "video";
// Marca colaboradora de un proyecto (footer de la ficha V3).
export type Collab = { handle: string; href: string };
// Cómo se reproduce un vídeo: "ambient" = autoplay + bucle + sin sonido;
// "player" = con controles y sonido.
export type VideoMode = "ambient" | "player";

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  // Etiquetas de la cabecera (ArchiveChrome).
  chromeCenter: text("chrome_center").notNull().default(""),
  chromeBottom: text("chrome_bottom").notNull().default(""),
  credits: jsonb("credits").$type<CreditGroups>().notNull().default([]),
  // Campos de la ficha V2 (estilo Taqta).
  // Imagen de portada para la home (si está vacía, se usa la primera del proyecto).
  coverUrl: text("cover_url").notNull().default(""),
  category: text("category").notNull().default(""),
  year: text("year").notNull().default(""),
  // Pie de imagen en la home (línea libre, p. ej. "IDENTIDAD | PACKAGING - 2024").
  // Si está vacío, la home cae a categoría + año.
  homeCaption: text("home_caption").notNull().default(""),
  services: jsonb("services").$type<string[]>().notNull().default([]),
  // Ficha V3: agencia/producción y marcas colaboradoras (footer).
  agency: text("agency").notNull().default(""),
  collabs: jsonb("collabs").$type<Collab[]>().notNull().default([]),
  // Orden en el archivo y número visible ("01"). El número se deriva del orden
  // al renderizar, pero guardamos sortOrder para poder reordenar.
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(false),
  // Próximamente: sale en la home como «Próximamente», sin enlace, y su ficha no se abre.
  comingSoon: boolean("coming_soon").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const images = pgTable(
  "images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    // Para imágenes: URL del Blob. Para vídeos: el enlace (YouTube/Vimeo/.mp4).
    url: text("url").notNull(),
    kind: text("kind", { enum: ["image", "video"] }).notNull().default("image"),
    videoMode: text("video_mode", { enum: ["ambient", "player"] }).notNull().default("ambient"),
    alt: text("alt").notNull().default(""),
    width: integer("width"),
    height: integer("height"),
    // Agrupación y maquetación en la ficha V2.
    section: text("section").notNull().default(""),
    layout: text("layout", { enum: ["wide", "pair", "single"] }).notNull().default("single"),
    // Lado de una imagen "single" en la rejilla escalonada (ficha V3).
    align: text("align", { enum: ["left", "right"] }).notNull().default("left"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("images_project_idx").on(t.projectId)],
);

export const projectsRelations = relations(projects, ({ many }) => ({
  images: many(images),
}));

export const imagesRelations = relations(images, ({ one }) => ({
  project: one(projects, {
    fields: [images.projectId],
    references: [projects.id],
  }),
}));

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectImage = typeof images.$inferSelect;
export type NewProjectImage = typeof images.$inferInsert;
