// Server-side checks for submitEnquiry, per docs/shared/enquiry-form-contract.md (version 3, which keeps the field
// rules of version 2.1). Pure functions, no Firebase imports, so they run under `node --test` with no emulator.

export const MAX_BODY_BYTES = 10 * 1024;
export const WORK_TYPES = ["house", "apartment", "road", "interlocking", "other"];
export const LIMITS = { nameMin: 2, nameMax: 100, location: 120, sizeOrBudget: 100, message: 2000 };
const TEXT_CAPS = { source_url: 2000, form_id: 64, subject: 300, from_name: 100, utm: 200 };
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
const FORM_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
// Deliberately simple: the contract says "store it if it parses; otherwise drop the value and keep the lead".
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Copied verbatim from the contract's "Phone rule" (identical on the website, the CRM and here).
export function normaliseIndianMobile(input) {
  let d = String(input ?? "").replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}

const str = (v) => (typeof v === "string" ? v.trim() : "");

/** Honeypot hit: `botcheck` present with any value other than "", "false" or false (contract). */
export function isHoneypotHit(body) {
  if (!body || typeof body !== "object" || !("botcheck" in body)) return false;
  const v = body.botcheck;
  return !(v === "" || v === "false" || v === false);
}

/**
 * Validates and normalises one enquiry. Returns { ok: true, enquiry } or { ok: false, reasons, contactable }.
 * `contactable` (consent "yes" and a usable phone) decides whether a rejected enquiry is kept for checking.
 */
export function validateEnquiry(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { ok: false, reasons: ["body"], contactable: false };
  const reasons = [];
  const name = str(body.name);
  const phone = normaliseIndianMobile(body.phone);
  const emailRaw = str(body.email);
  const workTypeRaw = str(body.work_type);
  const location = str(body.location);
  const size = str(body.size_or_budget);
  const message = str(body.message);
  const consent = body.consent === "yes";
  const formId = str(body.form_id);
  const sourceUrl = str(body.source_url);

  if (name.length < LIMITS.nameMin || name.length > LIMITS.nameMax) reasons.push("name");
  if (!phone) reasons.push("phone");
  if (!WORK_TYPES.includes(workTypeRaw)) reasons.push("work_type");
  if (location === "" || location.length > LIMITS.location) reasons.push("location");
  if (size.length > LIMITS.sizeOrBudget) reasons.push("size_or_budget");
  if (message === "" || message.length > LIMITS.message) reasons.push("message");
  if (!consent) reasons.push("consent");
  if (!FORM_ID.test(formId) || formId.length > TEXT_CAPS.form_id) reasons.push("form_id");
  if (!/^https?:\/\//.test(sourceUrl) || sourceUrl.length > TEXT_CAPS.source_url) reasons.push("source_url");

  const utm = Object.fromEntries(UTM_KEYS.map((k) => [k, str(body[k]).slice(0, TEXT_CAPS.utm)]));
  const enquiry = {
    name,
    phone: phone ? `+91${phone}` : "",
    email: EMAIL.test(emailRaw) ? emailRaw.slice(0, 254) : "",
    work_type: WORK_TYPES.includes(workTypeRaw) ? workTypeRaw : "other",
    work_type_raw: WORK_TYPES.includes(workTypeRaw) ? "" : workTypeRaw.slice(0, 60),
    location: location.slice(0, LIMITS.location),
    size_or_budget: size.slice(0, LIMITS.sizeOrBudget),
    message: message.slice(0, LIMITS.message),
    consent: consent ? "yes" : "",
    source_url: sourceUrl.slice(0, TEXT_CAPS.source_url),
    ...utm,
    form_id: formId.slice(0, TEXT_CAPS.form_id),
    lang: body.lang === "hi" ? "hi" : "en",
    subject: str(body.subject).slice(0, TEXT_CAPS.subject),
  };
  if (reasons.length) return { ok: false, reasons, contactable: consent && !!phone, enquiry };
  return { ok: true, enquiry };
}

/** Path of the page the form was on (for "top pages" in the dashboard), from source_url. */
export function sourcePath(sourceUrl) {
  try {
    return new URL(sourceUrl).pathname.replace(/\/$/, "") || "/";
  } catch {
    return "";
  }
}

/** Referrer-style source for analytics: the UTM source, else "direct". */
export function sourceLabel(enquiry) {
  return enquiry.utm_source || "direct";
}

/** Fixed-window, in-memory rate limit (per instance; run with a low maxInstances, as the contract says). */
export function createRateLimiter({ limit = 5, windowMs = 60 * 60 * 1000, now = () => Date.now() } = {}) {
  const hits = new Map();
  return function allow(key) {
    const t = now();
    const entry = hits.get(key);
    if (!entry || t - entry.start >= windowMs) {
      hits.set(key, { start: t, count: 1 });
      if (hits.size > 5000) for (const [k, v] of hits) if (t - v.start >= windowMs) hits.delete(k);
      return true;
    }
    entry.count += 1;
    return entry.count <= limit;
  };
}

/** Allowed origins: the custom domain(s), any *.netlify.app address (incl. deploy previews), and localhost. */
export function isAllowedOrigin(origin, siteOrigins = []) {
  if (!origin) return false;
  let u;
  try {
    u = new URL(origin);
  } catch {
    return false;
  }
  if (siteOrigins.includes(u.origin)) return true;
  if (u.protocol === "https:" && u.hostname.endsWith(".netlify.app")) return true;
  return (u.hostname === "localhost" || u.hostname === "127.0.0.1") && (u.protocol === "http:" || u.protocol === "https:");
}

/** Idempotency key (D-31): sha256 of the canonical contract fields, so an identical resubmission is a no-op. */
export function canonicalString(enquiry) {
  const keys = ["name", "phone", "email", "work_type", "location", "size_or_budget", "message", "form_id", "lang"];
  return keys.map((k) => `${k}=${enquiry[k] ?? ""}`).join("\n");
}
