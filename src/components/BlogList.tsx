import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { routes } from "@/config/routes";
import { getContent } from "@/content";
import { localePath, type Locale } from "@/i18n/config";
import { allTags, readingMinutes, tagSlug } from "@/lib/blog";
import type { CmsPost } from "@/lib/cms";
import { hasPhoto, Photo } from "./Photo";
import { arrowClass, card } from "./ui";

const dateFmt = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

/** Tag chips: "All topics" plus one per tag; the current one is marked. */
export function BlogTags({ locale, current }: { locale: Locale; current?: string }) {
  const t = getContent(locale).blog;
  if (!allTags.length) return null;
  const chip = (active: boolean) =>
    `inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors ${
      active ? "border-brand-strong bg-selected text-text" : "border-divider text-text-2 hover:border-rule hover:text-text"
    }`;
  return (
    <nav aria-label="Topics">
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link href={localePath(locale, routes.blog)} aria-current={!current ? "page" : undefined} className={chip(!current)}>
            {t.allTags}
          </Link>
        </li>
        {allTags.map((tag) => (
          <li key={tag}>
            <Link href={localePath(locale, `${routes.blog}/tag/${tagSlug(tag)}`)} aria-current={current === tag ? "page" : undefined} className={chip(current === tag)}>
              {tag}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** `priorityFirst`: the first card is in the first screen, so its cover is preloaded and the card shows at once (no reveal). */
export function BlogList({ locale, posts, priorityFirst = false }: { locale: Locale; posts: CmsPost[]; priorityFirst?: boolean }) {
  const { blog: t, common } = getContent(locale);
  if (!posts.length) return <p className="text-text-2">{t.empty}</p>;
  return (
    <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {posts.map((post, i) => {
        const href = localePath(locale, `${routes.blog}/${post.slug}`);
        const first = priorityFirst && i === 0;
        return (
          <li key={post.slug} data-reveal={first ? undefined : ""} style={{ "--reveal-delay": `${(i % 3) * 80}ms` } as React.CSSProperties}>
            <article data-spotlight="" className={`${card} group flex h-full flex-col overflow-hidden`}>
              {hasPhoto(`blog-${post.slug}`) && (
                <Photo
                  name={`blog-${post.slug}`}
                  alt={post.cover?.alt ?? ""}
                  sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
                  placeholderLabel={common.placeholder.photo}
                  illustrativeLabel={common.placeholder.illustrative}
                  className="aspect-[16/10]"
                  rounded={false}
                  priority={first}
                />
              )}
              <div className="flex flex-1 flex-col p-6">
                <p className="t-meta text-text-2">
                  <time dateTime={post.publishedAt}>{dateFmt(post.publishedAt)}</time> · {t.minutes(readingMinutes(post.body))}
                </p>
                <h2 className="t-h3 mt-3">
                  <Link href={href} className="after:absolute after:inset-0">
                    {post.title}
                  </Link>
                </h2>
                {post.excerpt && <p className="mt-3 text-text-2">{post.excerpt}</p>}
                <p className="mt-auto flex items-center gap-2 pt-6 text-sm font-medium" aria-hidden="true">
                  {t.readMore} <ArrowRight size={16} className={arrowClass} />
                </p>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
