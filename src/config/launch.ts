import { cmsProjects } from "@/lib/cms";

/**
 * Development and review builds show placeholders (always in [square brackets]) so every slot can be seen.
 * A production build (`npm run build`, Netlify) never shows placeholder text: a section or row with no real
 * content is left out, and `npm run launch-check` lists what is still missing (LAUNCH-QUESTIONS.md).
 */
export const preview = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_PREVIEW_UNVERIFIED === "1";

/** A real value: not empty and not a [bracketed] placeholder. */
export const isReal = (value: string | null | undefined): value is string => !!value && value.trim() !== "" && !value.trim().startsWith("[");

/** True when a value may be shown: real values always, placeholders only in development and review builds. */
export const shown = (value: string | null | undefined): boolean => isReal(value) || preview;

/** The sample projects appear only in development and review builds, and only until the admin has real ones. */
export const usePlaceholderProjects = preview && cmsProjects === null;

/** False in a production build with no real project: the Projects links and Home section are left out. */
export const hasProjects = usePlaceholderProjects || (cmsProjects?.length ?? 0) > 0;
