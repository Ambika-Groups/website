import type { Metadata } from "next";
import { BlogList, BlogTags } from "@/components/BlogList";
import { PageHeader } from "@/components/PageHeader";
import { container } from "@/components/ui";
import { routes } from "@/config/routes";
import { getContent } from "@/content";
import { localePath, type Locale } from "@/i18n/config";
import { posts } from "@/lib/blog";
import { pageMetadata } from "../../metadata";

const locale: Locale = "en";
const { blog } = getContent(locale);

export const metadata: Metadata = {
  ...pageMetadata({ locale, path: localePath(locale, routes.blog), title: blog.meta.title, description: blog.meta.description, absoluteTitle: true }),
  // No articles yet: the page stays out of search results until there is something to read.
  ...(posts.length === 0 && { robots: { index: false, follow: true } }),
};

// Static at build: the posts come from the admin's snapshot (scripts/fetch-cms.mjs), so every article is indexed.
export default function BlogPage() {
  return (
    <>
      <PageHeader label={blog.title} title={blog.title} intro={blog.intro} />
      <div className={`${container} section-y space-y-10`}>
        <BlogTags locale={locale} />
        <BlogList locale={locale} posts={posts} priorityFirst />
      </div>
    </>
  );
}
