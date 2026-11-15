// Typed access to the admin's published content, snapshotted at build time by scripts/fetch-cms.mjs.
// In demo mode (no Firebase project) every accessor returns null / [], and the site uses its content files.
import type { ServiceKey } from "@/config/routes";
import settingsSnapshot from "@/generated/cms-settings.json";
import projectsSnapshot from "@/generated/cms-projects.json";

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

export const cmsSettings: CmsSettings | null = (settingsSnapshot as { settings: CmsSettings | null }).settings;

/** Published posts in the snapshot (the nav shows "Blog" only when there are some). */
export const cmsPostCount: number = (settingsSnapshot as { postCount?: number }).postCount ?? 0;

/** null = no Firebase snapshot: use the content files. [] = the admin has switched every project off. */
export const cmsProjects: CmsProject[] | null = (projectsSnapshot as { projects: CmsProject[] | null }).projects;

/** Non-empty trimmed string, or undefined (so `??` falls back to the content-file value). */
export const filled = (v: string | undefined): string | undefined => (v && v.trim() ? v.trim() : undefined);
