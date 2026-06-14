import { relations } from "drizzle-orm";
import { pgTable, uuid, text, integer, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";

// Un par etiqueta/valor de los créditos. Los créditos se guardan como grupos
// (líneas en blanco entre grupos), igual que esperaba <ProjectFicha>.
export type Credit = { label: string; value: string };
export type CreditGroups = Credit[][];

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  // Etiquetas de la cabecera (ArchiveChrome).
  chromeCenter: text("chrome_center").notNull().default(""),
  chromeBottom: text("chrome_bottom").notNull().default(""),
  credits: jsonb("credits").$type<CreditGroups>().notNull().default([]),
  // Orden en el archivo y número visible ("01"). El número se deriva del orden
  // al renderizar, pero guardamos sortOrder para poder reordenar.
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(false),
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
    url: text("url").notNull(),
    alt: text("alt").notNull().default(""),
    width: integer("width"),
    height: integer("height"),
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
