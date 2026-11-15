import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogList, BlogTags } from "@/components/BlogList";
import { PageHeader } from "@/components/PageHeader";
import { container } from "@/components/ui";
import { routes } from "@/config/routes";
import { getContent } from "@/content";
import { localePath, type Locale } from "@/i18n/config";
import { allTags, posts, tagSlug } from "@/lib/blog";
import { pageMetadata } from "../../../../metadata";

const locale: Locale = "en";
const { blog } = getContent(locale);

export const dynamicParams = false;

// A static export needs at least one page here; with no tags yet, a stand-in renders the 404 (never linked).
export function generateStaticParams() {
  return allTags.length ? allTags.map((tag) => ({ tag: tagSlug(tag) })) : [{ tag: "none" }];
}

type Props = { params: Promise<{ tag: string }> };
const findTag = async (params: Props["params"]) => {
  const { tag } = await params;
  return allTags.find((t) => tagSlug(t) === tag);
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tag = await findTag(params);
  if (!tag) return {};
  return pageMetadata({ locale, path: localePath(locale, `${routes.blog}/tag/${tagSlug(tag)}`), title: blog.taggedTitle(tag), description: blog.meta.description });
}

export default async function BlogTagPage({ params }: Props) {
  const tag = await findTag(params);
  if (!tag) notFound();
  return (
    <>
      <PageHeader parent={{ href: localePath(locale, routes.blog), label: blog.title }} title={blog.taggedTitle(tag)} />
      <div className={`${container} section-y space-y-10`}>
        <BlogTags locale={locale} current={tag} />
        <BlogList locale={locale} posts={posts.filter((p) => p.tags?.includes(tag))} priorityFirst />
      </div>
    </>
  );
}
