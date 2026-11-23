import { getCollection, type CollectionEntry } from "astro:content";
import { SITE, type SectionKey } from "./site";

export type Post = CollectionEntry<"posts">;

const TZ = "America/Argentina/Buenos_Aires";

const ymFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
});

const longFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: TZ,
  day: "numeric",
  month: "long",
  year: "numeric",
});

const shortFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: TZ,
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: TZ,
  month: "long",
});

const dayFormatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: TZ,
  day: "2-digit",
  month: "short",
});

export function yearMonth(date: Date): { year: string; month: string } {
  const parts = ymFormatter.formatToParts(date);
  return {
    year: parts.find((p) => p.type === "year")?.value ?? "1970",
    month: parts.find((p) => p.type === "month")?.value ?? "01",
  };
}

export function postPath(post: Post): string {
  const { year, month } = yearMonth(post.data.date);
  return `/${post.data.section}/${year}/${month}/${post.data.slug}/`;
}

export const postUrl = (post: Post): string => SITE.url + postPath(post);

/** Primera imagen del cuerpo (útil para las entradas migradas sin hero). */
export function firstBodyImage(post: Post): string | undefined {
  const body = post.body ?? "";
  const md = body.match(/!\[[^\]]*\]\(([^)\s"']+)/);
  if (md) return md[1];
  const raw = body.match(/<img[^>]+src=["']([^"'\s>]+)["']/i);
  return raw?.[1];
}

/** Imagen de portada: la del frontmatter o la primera del cuerpo. */
export function coverImage(post: Post): string | undefined {
  return post.data.hero?.trim() || firstBodyImage(post) || undefined;
}

export const formatDate = (date: Date): string => longFormatter.format(date);

export const formatShortDate = (date: Date): string =>
  shortFormatter
    .format(date)
    .replace(/\bde\s+/g, "")
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();

export function monthName(date: Date): string {
  const name = monthFormatter.format(date);
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function dayMonth(date: Date): { day: string; month: string } {
  const parts = dayFormatter.formatToParts(date);
  return {
    day: parts.find((part) => part.type === "day")?.value ?? "01",
    month: (parts.find((part) => part.type === "month")?.value ?? "").replace(/\./g, ""),
  };
}

export async function allPosts(): Promise<Post[]> {
  const posts = await getCollection("posts", ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function sectionPosts(section: SectionKey): Promise<Post[]> {
  const posts = await allPosts();
  return posts.filter((post) => post.data.section === section);
}

export function paginate<T>(items: T[], page: number, perPage = SITE.perPage) {
  const total = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(1, page), total);
  const start = (current - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    page: current,
    totalPages: total,
    hasPrev: current > 1,
    hasNext: current < total,
    totalItems: items.length,
  };
}

/** Artículos anterior y siguiente dentro de la misma sección. */
export function neighbours(posts: Post[], index: number) {
  return {
    prev: index > 0 ? posts[index - 1] : null, // más reciente
    next: index < posts.length - 1 ? posts[index + 1] : null, // más viejo
  };
}

/** Texto plano a partir del Markdown, para meta description de respaldo. */
export function plainText(post: Post): string {
  const raw = post.body ?? "";
  return raw
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function excerpt(post: Post, max = 157): string {
  if (post.data.description?.trim()) return post.data.description.trim();
  const text = plainText(post);
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

export function postYear(post: Post): string {
  return yearMonth(post.data.date).year;
}

export function readingTime(post: Post): number {
  const words = plainText(post).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function groupByYear(posts: Post[]): { year: string; posts: Post[] }[] {
  const map = new Map<string, Post[]>();
  for (const post of posts) {
    const year = postYear(post);
    const list = map.get(year);
    if (list) list.push(post);
    else map.set(year, [post]);
  }
  return [...map.entries()]
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([year, list]) => ({ year, posts: list }));
}

/**
 * Entradas relacionadas: primero las que comparten etiquetas, después las
 * de la misma sección, sin repetir la actual.
 */
export function relatedPosts(post: Post, posts: Post[], limit = 3): Post[] {
  const current = new Set((post.data.tags ?? []).map((tag) => tag.toLowerCase()));
  const scored = posts
    .filter((item) => item.id !== post.id)
    .map((item) => {
      const tags = (item.data.tags ?? []).map((tag) => tag.toLowerCase());
      const shared = tags.filter((tag) => current.has(tag)).length;
      const sameSection = item.data.section === post.data.section ? 1 : 0;
      return { item, score: shared * 3 + sameSection };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.item.data.date.getTime() - a.item.data.date.getTime());

  return scored.slice(0, limit).map((entry) => entry.item);
}
