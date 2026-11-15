import type { MetadataRoute } from "next";
import { routes, serviceKeys } from "@/config/routes";
import { site } from "@/config/site";
import { getContent } from "@/content";
import { localePath, publishedLocales } from "@/i18n/config";
import { allTags, posts, tagSlug } from "@/lib/blog";

export const dynamic = "force-static";

// Every published page in every published locale. The 404 page is left out on purpose.
export default function sitemap(): MetadataRoute.Sitemap {
  const paths: string[] = [
    routes.home,
    routes.services,
    ...serviceKeys.map((key) => routes[key]),
    routes.governmentWork,
    routes.projects,
    ...getContent("en").projects.items.map((p) => `${routes.projects}/${p.slug}`),
    // The blog index always; each published post and topic once they exist (stand-in 404 pages are never listed).
    routes.blog,
    ...posts.map((p) => `${routes.blog}/${p.slug}`),
    ...allTags.map((t) => `${routes.blog}/tag/${tagSlug(t)}`),
    routes.about,
    routes.contact,
    routes.privacy,
  ];
  const lastModified = new Date();
  return publishedLocales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${site.url}${localePath(locale, path) === "/" ? "" : localePath(locale, path)}`,
      lastModified,
      priority: path === routes.home ? 1 : path === routes.privacy ? 0.2 : 0.7,
    })),
  );
}
