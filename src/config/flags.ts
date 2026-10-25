/**
 * Sections whose content must never ship as placeholders (brand.md v3, "Numbers and trust sections").
 * They render in development (`npm run dev`) with clearly marked placeholders, and are left out of
 * production builds (`npm run build`, Netlify) until real values or logos exist.
 *
 * To preview them in a production build for review only: NEXT_PUBLIC_PREVIEW_UNVERIFIED=1 npm run build.
 * TODO(content): when real figures arrive, put them in content/en/home.ts and set the matching flag to true.
 */
const preview = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_PREVIEW_UNVERIFIED === "1";

export const showNumbers = preview; // TODO(content): true once home.numbers holds real figures
export const showTrustedBy = preview; // TODO(content): true once real client logos (with permission) exist
