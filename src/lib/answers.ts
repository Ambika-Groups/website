// Turns the launch answers file (src/config/launch-answers.ts) into the same shapes the admin's Site settings use,
// and merges the two: an answer in the admin (CMS snapshot) wins, then the file, then the site's built-in defaults.
// Pure functions with no framework imports, so Next.js, `npm run launch-check` and the unit tests all use them.
import { launchAnswers, type LaunchAnswers } from "../config/launch-answers.ts";
import type { CmsProject, CmsSettings } from "./cms.ts";

/** True when a value holds something: text, a non-empty list with content, an object with content, or `true`. */
export function hasContent(v: unknown): boolean {
  if (typeof v === "string") return v.trim() !== "";
  if (typeof v === "boolean") return v === true;
  if (typeof v === "number") return true;
  if (Array.isArray(v)) return v.some(hasContent);
  if (v && typeof v === "object") return Object.values(v).some(hasContent);
  return false;
}

const isPlain = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

/**
 * Per value: the admin's (`cms`) when it has content, otherwise the file's. Objects merge field by field. An empty,
 * blank or switched-off admin value therefore never wipes out an answer typed in the file.
 */
export function merge<T>(file: T, cms: T): T {
  if (isPlain(file) && isPlain(cms)) {
    const out: Record<string, unknown> = {};
    for (const k of new Set([...Object.keys(file), ...Object.keys(cms)])) out[k] = merge(file[k], cms[k]);
    return out as T;
  }
  return hasContent(cms) ? cms : file !== undefined ? file : cms;
}

/** A YouTube link or an 11-character id → the id; anything else → "". */
export function youtubeId(v: string): string {
  const t = v.trim();
  const m = t.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  if (m) return m[1];
  return /^[\w-]{11}$/.test(t) ? t : "";
}

const t = (s: string) => s.trim();
const nonEmpty = (s: string) => t(s) !== "";

export function answersToSettings(a: LaunchAnswers = launchAnswers): CmsSettings {
  const numbers = a.q32_numbers.filter((n) => nonEmpty(n.value) && nonEmpty(n.label));
  const clients = a.q33_trusted.clients.filter(nonEmpty);
  const copyApproved = a.q9_contactCopyApproved && a.q13_servicesCopyApproved && a.q14_governmentCopyApproved && a.q15_homeCopyApproved && a.q16_consentCopyApproved;
  return {
    contact: {
      phoneDisplay: t(a.q5_phone.display),
      phoneE164: t(a.q5_phone.dialling),
      whatsappDisplay: t(a.q6_whatsapp.display),
      whatsappDigits: t(a.q6_whatsapp.number),
      email: t(a.q7_email),
      street: t(a.q8_address.line),
      locality: t(a.q8_address.city),
      region: t(a.q8_address.state),
      postalCode: t(a.q8_address.pin),
      hours: t(a.q18_hours),
      serviceArea: t(a.q19_serviceArea),
      mapUrl: t(a.q20_mapUrl),
    },
    identity: { name: t(a.q4_tradingName), legalName: t(a.q23_legalName), gstin: t(a.q24_gstin), pan: t(a.q25_pan) },
    wording: { closingStatement: t(a.q34_closingStatement), responseTime: t(a.q22_responseTime), copyApproved },
    about: { story: a.q30_aboutStory.filter(nonEmpty).map(t), people: a.q31_aboutPeople.filter((p) => nonEmpty(p.name) && nonEmpty(p.role)) },
    government: { registrations: a.q26_registrations.filter((r) => nonEmpty(r.label) && nonEmpty(r.value)), departments: a.q27_departments.filter(nonEmpty).map(t) },
    realEstate: { projects: a.q29_realEstateProjects.filter((p) => nonEmpty(p.title)) },
    privacy: { approved: a.q10_privacyApproved, retention: t(a.q11_retention), updated: t(a.q12_lastUpdated) },
    videoId: youtubeId(a.q21_videoId),
    numbers: { show: numbers.length > 0, items: numbers },
    trust: { show: clients.length > 0, logos: clients, certifications: a.q33_trusted.certificates.filter(nonEmpty).map(t) },
  };
}

/** The projects typed in the file, in the shape of the admin's published projects. */
export function answersToProjects(a: LaunchAnswers = launchAnswers): CmsProject[] {
  return a.q28_projects
    .filter((p) => nonEmpty(p.slug) && nonEmpty(p.title))
    .map((p, i) => ({
      id: `file-${p.slug}`,
      slug: t(p.slug),
      title: t(p.title),
      service: p.service,
      location: t(p.location),
      year: t(p.year),
      clientType: t(p.clientType),
      status: p.status,
      summary: t(p.summary),
      scope: p.scope.filter(nonEmpty).map(t),
      photoAlts: Array.from({ length: Math.max(1, p.photos) }, () => t(p.title)),
      order: i + 1,
    }));
}

/** Which answers the file has filled in (question numbers), for the launch check's "from the file" count. */
export function filledAnswerNumbers(a: LaunchAnswers = launchAnswers): number[] {
  return Object.entries(a)
    .filter(([, v]) => hasContent(v))
    .map(([k]) => Number(k.match(/^q(\d+)_/)?.[1]));
}
