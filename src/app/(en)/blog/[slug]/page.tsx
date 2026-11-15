import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { hasPhoto, Photo, photoImage } from "@/components/Photo";
import { arrowClass, button, card, container } from "@/components/ui";
import { routes } from "@/config/routes";
import { site } from "@/config/site";
import { getContent } from "@/content";
import { localePath, type Locale } from "@/i18n/config";
import { postBySlug, posts, readingMinutes, renderMarkdown, tagSlug } from "@/lib/blog";
import { pageMetadata } from "../../../metadata";

const locale: Locale = "en";
const { blog, common, projects } = getContent(locale);

export const dynamicParams = false;

// A static export needs at least one page here; with no posts yet, a stand-in renders the 404 (never linked,
// not in the sitemap).
export function generateStaticParams() {
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: "none" }];
}

type Props = { params: Promise<{ slug: string }> };
const findPost = async (params: Props["params"]) => postBySlug((await params).slug);
const dateFmt = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await findPost(params);
  if (!post) return {};
  const img = photoImage(`blog-${post.slug}`);
  return pageMetadata({
    locale,
    path: localePath(locale, `${routes.blog}/${post.slug}`),
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || blog.meta.description,
    image: img && { ...img, alt: post.cover?.alt || post.title },
    article: { publishedTime: post.publishedAt, modifiedTime: post.updatedAt, tags: post.tags },
  });
}

export default async function BlogPostPage({ params }: Props) {
  const post = await findPost(params);
  if (!post) notFound();
  const path = localePath(locale, `${routes.blog}/${post.slug}`);
  const cover = `blog-${post.slug}`;
  const img = photoImage(cover);
  const related = (post.relatedProjects ?? []).map((slug) => projects.items.find((p) => p.slug === slug)).filter((p) => !!p);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription || post.excerpt || undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    mainEntityOfPage: `${site.url}${path}`,
    url: `${site.url}${path}`,
    image: img ? `${site.url}${img.url}` : undefined,
    keywords: post.tags?.length ? post.tags.join(", ") : undefined,
    author: { "@type": "Organization", name: site.name, url: site.url },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    inLanguage: "en-IN",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <article>
        <header className="relative isolate overflow-hidden bg-bg pt-16 sm:pt-28 xl:pt-20">
          <div aria-hidden="true" className="hero-glow absolute inset-0 -z-10" />
          <div className="mx-auto w-full max-w-3xl px-4 pt-12 pb-10 sm:px-8 sm:pt-16">
            <Link href={localePath(locale, routes.blog)} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-text hover:underline">
              <ArrowLeft aria-hidden="true" size={16} /> {blog.back}
            </Link>
            <p className="t-meta mt-6 text-text-2">
              {blog.published} <time dateTime={post.publishedAt}>{dateFmt(post.publishedAt)}</time> · {blog.minutes(readingMinutes(post.body))}
            </p>
            <h1 className="t-h1 mt-4">{post.title}</h1>
            {post.excerpt && <p className="t-lead mt-5 text-text-2">{post.excerpt}</p>}
            {post.tags?.length > 0 && (
              <ul aria-label="Topics" className="mt-6 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <li key={tag}>
                    <Link href={localePath(locale, `${routes.blog}/tag/${tagSlug(tag)}`)} className="inline-flex min-h-9 items-center rounded-full border border-divider px-3 text-sm text-text-2 hover:border-rule hover:text-text">
                      {tag}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </header>
        {hasPhoto(cover) && (
          <div className="mx-auto w-full max-w-5xl px-4 sm:px-8">
            <Photo
              name={cover}
              alt={post.cover?.alt ?? ""}
              sizes="(min-width: 1024px) 64rem, 100vw"
              placeholderLabel={common.placeholder.photo}
              illustrativeLabel={common.placeholder.illustrative}
              className="aspect-[16/9]"
              priority
            />
          </div>
        )}
        {/* Reading layout: about 70 characters a line. */}
        <div className="blog-prose mx-auto w-full max-w-3xl px-4 py-12 sm:px-8 sm:py-16" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className={`${container} pb-16`}>
          <h2 id="related-title" className="t-h2">
            {blog.related}
          </h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {related.map((p) => (
              <li key={p.slug}>
                <Link href={localePath(locale, `${routes.projects}/${p.slug}`)} data-spotlight="" className={`${card} group block h-full p-6`}>
                  <p className="t-meta text-text-2">{common.serviceNames[p.service]}</p>
                  <h3 className="t-h3 mt-3">{p.title}</h3>
                  <p className="mt-2 text-text-2">{p.summary}</p>
                  <p className="mt-5 flex items-center gap-2 text-sm font-medium">
                    {blog.viewProject} <ArrowRight aria-hidden="true" size={16} className={arrowClass} />
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="post-cta" className={`${container} pb-[clamp(4.5rem,2.8rem+6vw,9rem)]`}>
        <div className={`${card} flex flex-col items-start gap-5 p-8 sm:flex-row sm:items-center sm:justify-between`}>
          <div>
            <h2 id="post-cta" className="t-h3">
              {blog.ctaTitle}
            </h2>
            <p className="mt-2 text-text-2">{blog.ctaBody}</p>
          </div>
          <Link href={localePath(locale, routes.contact)} className={`${button.primary} group/btn`}>
            {blog.cta} <ArrowRight aria-hidden="true" size={18} className={arrowClass} />
          </Link>
        </div>
      </section>
    </>
  );
}
