import type { APIRoute } from "astro";
import { allPosts, postPath } from "../lib/posts";
import { SECTIONS, SECTION_KEYS, SITE } from "../lib/site";
import { buildTagIndex, tagPath } from "../lib/tags";

const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const GET: APIRoute = async () => {
  const posts = await allPosts();
  const tags = buildTagIndex(posts);

  const staticPaths = [
    "/",
    "/etiquetas/",
    "/archivo/",
    "/buscar/",
    "/sobre/",
    "/contacto/",
    "/privacidad/",
    ...SECTION_KEYS.map((key) => `/${key}/`),
  ];

  const urls = [
    ...staticPaths.map((path) => ({ loc: new URL(path, SITE.url).href, priority: "0.8" })),
    ...posts.map((post) => ({
      loc: new URL(postPath(post), SITE.url).href,
      lastmod: post.data.date.toISOString(),
      priority: "0.7",
    })),
    ...tags.map((tag) => ({
      loc: new URL(tagPath(tag.slug), SITE.url).href,
      priority: "0.5",
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (entry) => `  <url>
    <loc>${escape(entry.loc)}</loc>${
      "lastmod" in entry && entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ""
    }
    <priority>${entry.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
