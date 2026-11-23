import type { Post } from "./posts";

export interface TagEntry {
  name: string;
  slug: string;
  count: number;
}

/** slug sin tildes, para URLs de etiquetas. */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export const tagPath = (slug: string): string => `/etiqueta/${slug}/`;

export function buildTagIndex(posts: Post[]): TagEntry[] {
  const map = new Map<string, TagEntry>();
  for (const post of posts) {
    for (const raw of post.data.tags ?? []) {
      const name = raw.trim();
      if (!name) continue;
      const slug = slugify(name);
      if (!slug) continue;
      const found = map.get(slug);
      if (found) found.count += 1;
      else map.set(slug, { name, slug, count: 1 });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "es"));
}

export function postsWithTag(posts: Post[], slug: string): Post[] {
  return posts.filter((post) => (post.data.tags ?? []).some((tag) => slugify(tag) === slug));
}
