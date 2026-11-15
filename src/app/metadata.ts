import type { Metadata } from "next";
import { site } from "@/config/site";
import logoManifest from "@/generated/logo.json";

const logo = logoManifest as { present: boolean; icon: string; apple: string };
import type { Locale } from "@/i18n/config";

const ogLocale: Record<Locale, string> = { en: "en_IN", hi: "hi_IN" };

const openGraphBase = (locale: Locale) => ({
  siteName: site.name,
  locale: ogLocale[locale],
  type: "website" as const,
  images: [{ url: "/og.png", width: 1200, height: 630, alt: site.name }],
});

/** Site-wide metadata shared by every root layout. */
export function baseMetadata(locale: Locale): Metadata {
  return {
    metadataBase: new URL(site.url),
    title: { default: site.name, template: `%s | ${site.name}` },
    applicationName: site.name,
    // The red "AG" mark until a logo file is dropped into photos/ (scripts/prepare-logo.mjs makes the icons from it).
    icons: logo.present
      ? { icon: [{ url: logo.icon, type: "image/png" }], apple: logo.apple }
      : {
          icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
          apple: "/apple-icon.png",
        },
    openGraph: openGraphBase(locale),
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: false },
  };
}

/**
 * Per-page metadata. Next replaces (not merges) nested objects such as openGraph, so every page
 * goes through here to keep the share image, site name and locale.
 * `absoluteTitle` skips the "| Ambika Groups" suffix for titles that already contain the name.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  absoluteTitle = false,
  image,
  article,
}: {
  locale: Locale;
  /** Locale-specific path, e.g. "/services/road-works". */
  path: string;
  title: string;
  description: string;
  absoluteTitle?: boolean;
  /** Share image for this page (e.g. a blog cover); the site's og.png otherwise. */
  image?: { url: string; width: number; height: number; alt: string } | null;
  /** Blog posts: shared as an article with its dates and tags. */
  article?: { publishedTime: string; modifiedTime?: string; tags?: string[] };
}): Metadata {
  const base = openGraphBase(locale);
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      ...base,
      ...(image && { images: [image] }),
      ...(article && { type: "article" as const, publishedTime: article.publishedTime, modifiedTime: article.modifiedTime, tags: article.tags }),
      title,
      description,
      url: path,
    },
  };
}
