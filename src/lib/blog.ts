// Blog posts for the build (server only: imported by app/(en)/blog and the sitemap, never by a client component,
// so post bodies never reach a browser bundle).
import postsSnapshot from "@/generated/cms-posts.json";
import type { CmsPost } from "./cms";

export { renderMarkdown } from "./markdown";

export const posts: CmsPost[] = [...((postsSnapshot as { posts: CmsPost[] }).posts ?? [])]
  .filter((p) => p.slug && p.title)
  .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));

export const postBySlug = (slug: string) => posts.find((p) => p.slug === slug);

export const allTags = [...new Set(posts.flatMap((p) => p.tags ?? []))].sort();

export const tagSlug = (tag: string) => tag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Reading time at about 200 words a minute (minimum 1). */
export const readingMinutes = (body: string) => Math.max(1, Math.round((body ?? "").split(/\s+/).filter(Boolean).length / 200));
