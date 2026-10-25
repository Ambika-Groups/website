// English lives at the bare URLs (/contact); every other locale gets a prefix (/hi/contact).
// Adding Hindi never moves an English URL.
export const locales = ["en", "hi"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** Locales that have published pages. Add "hi" once app/(hi)/hi has pages. */
export const publishedLocales: readonly Locale[] = ["en"];

export function localePath(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}
