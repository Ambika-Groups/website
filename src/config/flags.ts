/**
 * Sections whose content must never ship as placeholders (brand.md v3, "Numbers and trust sections").
 * They render in development (`npm run dev`) with clearly marked placeholders, and are left out of
 * production builds (`npm run build`, Netlify) until real values or logos exist.
 *
 * To preview them in a production build for review only: NEXT_PUBLIC_PREVIEW_UNVERIFIED=1 npm run build.
 * TODO(content): when real figures arrive, put them in content/en/home.ts and set the matching flag to true.
 */
import { cmsSettings } from "@/lib/cms";

const preview = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_PREVIEW_UNVERIFIED === "1";

// Once the website back end is live, the admin's Site settings switch each section on (with its real values); the
// switch only takes effect when every value is real (no "[placeholder]"), so a placeholder can never ship.
const real = (values: string[] | undefined) => !!values?.length && values.every((v) => v.trim() !== "" && !v.startsWith("["));
const numbers = cmsSettings?.numbers;
const trust = cmsSettings?.trust;

export const showNumbers = preview || (numbers?.show === true && real(numbers.items.flatMap((i) => [i.value, i.label])));
export const showTrustedBy = preview || (trust?.show === true && real([...trust.logos, ...trust.certifications]));
