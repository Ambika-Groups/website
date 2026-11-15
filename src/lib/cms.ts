// Typed access to the admin's published content, snapshotted at build time by scripts/fetch-cms.mjs.
// In demo mode (no Firebase project) every accessor returns null / [], and the site uses its content files.
import type { ServiceKey } from "@/config/routes";
import settingsSnapshot from "@/generated/cms-settings.json";
import projectsSnapshot from "@/generated/cms-projects.json";
import { answersToProjects, answersToSettings, merge } from "./answers.ts";

/** settings/site in Firestore. Every field is optional: anything left out keeps the content-file value. */
export interface CmsSettings {
  contact?: Partial<{
    phoneE164: string;
    phoneDisplay: string;
    whatsappDigits: string;
    whatsappDisplay: string;
    email: string;
    street: string;
    locality: string;
    region: string;
    postalCode: string;
    hours: string;
    serviceArea: string;
    mapUrl: string;
  }>;
  /** Company identity. An empty field keeps the default; rows with no real value are hidden in production. */
  identity?: Partial<{ name: string; legalName: string; gstin: string; pan: string }>;
  /** Wording the client decides: the footer's closing statement, an optional response-time promise, and a flag
   *  that the client has approved the draft wording (used only by `npm run launch-check`). */
  wording?: Partial<{ closingStatement: string; responseTime: string; copyApproved: boolean }>;
  /** About page: the company story (paragraphs) and the people shown. Hidden while empty. */
  about?: { story?: string[]; people?: { name: string; role: string }[] };
  /** Government page: registrations (label and value) and further departments. Hidden while empty. */
  government?: { registrations?: { label: string; value: string }[]; departments?: string[] };
  /** Real estate page: the current and upcoming projects listed. Hidden while empty. */
  realEstate?: { projects?: { title: string; hint: string }[] };
  /** Privacy policy: set `approved` once the advocate approves; `retention` and `updated` fill the two gaps. */
  privacy?: Partial<{ approved: boolean; retention: string; updated: string }>;
  /** YouTube id of the Contact video; "" hides the video block. */
  videoId?: string;
  numbers?: { show: boolean; items: { value: string; label: string }[] };
  trust?: { show: boolean; logos: string[]; certifications: string[] };
}

/** projects/{id} in Firestore, as snapshotted (only those switched on for the website). */
export interface CmsProject {
  id: string;
  slug: string;
  title: string;
  service: ServiceKey;
  location: string;
  year: string;
  clientType?: string;
  status: "ongoing" | "completed";
  summary: string;
  scope?: string[];
  photoAlts: string[];
  order?: number;
}

/** posts/{id} in Firestore, as snapshotted (published only). */
export interface CmsPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** Markdown. */
  body: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  publishedAt: string;
  updatedAt?: string;
  cover: { alt: string } | null;
  /** Project slugs shown as "related work" under the post. */
  relatedProjects?: string[];
}

/**
 * The settings the site is built from. Priority: the admin's published settings (the CMS snapshot), then the launch
 * answers file (src/config/launch-answers.ts), then the site's built-in defaults (what each reader falls back to).
 */
export const cmsSettings: CmsSettings = merge(answersToSettings(), (settingsSnapshot as { settings: CmsSettings | null }).settings ?? {});

/** Published posts in the snapshot (the nav shows "Blog" only when there are some). */
export const cmsPostCount: number = (settingsSnapshot as { postCount?: number }).postCount ?? 0;

/**
 * The projects to show. The admin's published projects win; if it has none (an empty list or no snapshot), the
 * projects typed in the launch answers file; null = neither, so the content files apply (review builds) or none show.
 */
export const cmsProjects: CmsProject[] | null = (() => {
  const snapshot = (projectsSnapshot as { projects: CmsProject[] | null }).projects;
  if (snapshot?.length) return snapshot;
  const fromFile = answersToProjects();
  return fromFile.length ? fromFile : snapshot;
})();

/** Non-empty trimmed string, or undefined (so `??` falls back to the content-file value). */
export const filled = (v: string | undefined): string | undefined => (v && v.trim() ? v.trim() : undefined);
