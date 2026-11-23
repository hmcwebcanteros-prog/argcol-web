import type { APIRoute } from "astro";
import { allPosts, excerpt, plainText, postPath } from "../lib/posts";

export const GET: APIRoute = async () => {
  const posts = await allPosts();
  const items = posts.map((post) => ({
    title: post.data.title,
    url: postPath(post),
    section: post.data.section,
    date: post.data.date.toISOString(),
    tags: post.data.tags,
    description: excerpt(post, 220),
    text: plainText(post).slice(0, 1200),
  }));

  return new Response(JSON.stringify(items), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
