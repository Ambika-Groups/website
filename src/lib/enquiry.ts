// Validation and payload building for the enquiry form, per docs/shared/enquiry-form-contract.md.
// Pure functions (no DOM, no React) so they can be unit-tested with node --test.
import { fieldLimits, WEB3FORMS_FROM_NAME, workTypes, type WorkType } from "../config/forms.ts";
import { normaliseIndianMobile } from "./phone.ts";
import { emptyUtm, type Utm } from "./utm.ts";

export const visibleFields = [
  "name",
  "phone",
  "email",
  "work_type",
  "location",
  "size_or_budget",
  "message",
  "consent",
] as const;
export type VisibleField = (typeof visibleFields)[number];

export type FieldErrorCode =
  | "nameLength"
  | "phoneInvalid"
  | "emailInvalid"
  | "workTypeRequired"
  | "locationRequired"
  | "locationTooLong"
  | "sizeTooLong"
  | "messageRequired"
  | "messageTooLong"
  | "consentRequired";

export type FieldErrors = Partial<Record<VisibleField, FieldErrorCode>>;

type Entries = Iterable<[string, FormDataEntryValue]>;

/** Collapses FormData entries into trimmed strings. File entries never occur in this form. */
export function readFields(entries: Entries): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of entries) {
    if (typeof value === "string") out[key] = value.trim();
  }
  return out;
}

/**
 * `emailValid` comes from the browser's own check (input.validity), which the contract
 * names as the website's email rule.
 */
export function validateEnquiry(raw: Record<string, string>, emailValid: boolean): FieldErrors {
  const errors: FieldErrors = {};
  const name = raw.name ?? "";
  const location = raw.location ?? "";
  const message = raw.message ?? "";

  if (name.length < fieldLimits.nameMin || name.length > fieldLimits.nameMax) errors.name = "nameLength";
  if (normaliseIndianMobile(raw.phone ?? "") === null) errors.phone = "phoneInvalid";
  if ((raw.email ?? "") !== "" && !emailValid) errors.email = "emailInvalid";
  if (!workTypes.includes(raw.work_type as WorkType)) errors.work_type = "workTypeRequired";
  if (location === "") errors.location = "locationRequired";
  else if (location.length > fieldLimits.location) errors.location = "locationTooLong";
  if ((raw.size_or_budget ?? "").length > fieldLimits.sizeOrBudget) errors.size_or_budget = "sizeTooLong";
  if (message === "") errors.message = "messageRequired";
  else if (message.length > fieldLimits.message) errors.message = "messageTooLong";
  if (raw.consent !== "yes") errors.consent = "consentRequired";
  return errors;
}

export interface PayloadContext {
  /** Web3Forms key; omit for the CRM endpoint, and access_key is then left out entirely. */
  accessKey?: string;
  formId: string;
  lang: "en" | "hi";
  sourceUrl: string;
  utm: Utm;
  /** English label for the subject line, which the owner reads in their inbox. */
  workTypeLabel: string;
  /** A service that has no work_type of its own (sent as "other"): its name replaces the label and heads the message. */
  serviceLabel?: string;
}

/** "Service: Plumbing and sewage" on the first line, unless that would push the message over the contract's 2,000 characters. */
function withService(message: string, serviceLabel?: string): string {
  if (!serviceLabel) return message;
  const text = `Service: ${serviceLabel}\n${message}`;
  return text.length <= fieldLimits.message ? text : message;
}

/** Call only after validateEnquiry returned no errors. */
export function buildPayload(raw: Record<string, string>, ctx: PayloadContext): Record<string, string> {
  const utm = { ...emptyUtm, ...ctx.utm };
  const payload: Record<string, string> = {
    ...(ctx.accessKey !== undefined && { access_key: ctx.accessKey }),
    subject: `New website enquiry: ${ctx.serviceLabel ?? ctx.workTypeLabel} in ${raw.location}`,
    from_name: WEB3FORMS_FROM_NAME,
    name: raw.name,
    phone: normaliseIndianMobile(raw.phone) ?? "",
    email: raw.email ?? "",
    work_type: raw.work_type,
    location: raw.location,
    size_or_budget: raw.size_or_budget ?? "",
    message: withService(raw.message, ctx.serviceLabel),
    consent: raw.consent,
    source_url: ctx.sourceUrl,
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_campaign: utm.utm_campaign,
    utm_term: utm.utm_term,
    utm_content: utm.utm_content,
    form_id: ctx.formId,
    lang: ctx.lang,
  };
  // Honeypot: present only if a bot ticked the hidden box (contract: "botcheck").
  if ("botcheck" in raw) payload.botcheck = raw.botcheck;
  return payload;
}

/** Contract v2: success needs a 2xx status AND `success: true` in the body. */
export function isEnquirySuccess(httpOk: boolean, body: unknown): boolean {
  return httpOk && !!body && typeof body === "object" && (body as { success?: unknown }).success === true;
}
