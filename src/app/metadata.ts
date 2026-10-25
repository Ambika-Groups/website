import type { Metadata } from "next";
import { site } from "@/config/site";
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
    // TODO(content): replace the "AG" mark icons with the real logo once supplied.
    icons: {
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
 * `absoluteTitle` skips the "| Ambika Group" suffix for titles that already contain the name.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  absoluteTitle = false,
}: {
  locale: Locale;
  /** Locale-specific path, e.g. "/services/road-works". */
  path: string;
  title: string;
  description: string;
  absoluteTitle?: boolean;
}): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { ...openGraphBase(locale), title, description, url: path },
  };
}
