import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/** Convierte un texto en slug: minúsculas, sin tildes, con guiones. */
function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita diacríticos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 90);
}

// Colección de posts de blog. Cada post vive en
// src/content/posts/{seccion}/YYYY-MM-DD-slug.md
const posts = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/posts",
    // El ID usa la ruta del archivo (sección/nombre) para no chocar
    // cuando dos entradas de años distintos comparten slug.
    generateId: ({ entry }) => entry.replace(/\.mdx?$/, ""),
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    slug: z.string().transform((value) => slugify(value)),
    section: z.enum(["mercado", "inversion", "economia", "empresas", "ratios", "etf", "argcol-e", "documentos"]),
    type: z.string().default("articulo"),
    tags: z.array(z.string()).default([]),
    description: z.string().default(""),
    hero: z.string().default(""),
    heroAlt: z.string().default(""),
    oldUrl: z.string().default(""),
    draft: z.boolean().default(false),
  }),
});

// Fichas de etiquetas, administradas desde el panel (una por archivo).
const etiquetas = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/etiquetas" }),
  schema: z.object({
    name: z.string(),
  }),
});

export const collections = { posts, etiquetas };
