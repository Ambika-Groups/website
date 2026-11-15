// Every company contact detail lives here, so swapping placeholders for real values is a
// one-file edit. Values in [square brackets] are placeholders and render as-is in the UI.
// Once the website back end is live, the admin's Site settings (Firestore settings/site, snapshotted at build by
// scripts/fetch-cms.mjs) override these values field by field; anything left empty there keeps the value here.
import { cmsSettings, filled } from "@/lib/cms";
import { launchAnswers } from "./launch-answers";

const c = cmsSettings?.contact ?? {};
const id = cmsSettings?.identity ?? {};

export const PLACEHOLDER_PREFIX = "[";

export const site = {
  // Trading name shown across the site. TODO(content): confirm ("Ambika Groups" vs "Ambika Groups").
  name: filled(id.name) ?? "Ambika Groups",
  // TODO(content): registered legal name, exactly as on the GST certificate.
  legalName: filled(id.legalName) ?? "[Registered legal name]",
  shortMark: "AG",
  // TODO(content): real domain. Read from env so builds for staging/production can differ.
  // Priority: Netlify/.env setting, then the launch answers file (Q1), then the placeholder.
  // A setting that is still the example.com placeholder does not count.
  url: ((/example\.com/.test(process.env.NEXT_PUBLIC_SITE_URL ?? "") ? "" : process.env.NEXT_PUBLIC_SITE_URL) || launchAnswers.q1_siteUrl.trim() || "https://www.example.com").replace(/\/$/, ""),
  // TODO(content): main phone, as dialled and as displayed.
  phone: { e164: filled(c.phoneE164) ?? "+910000000000", display: filled(c.phoneDisplay) ?? "[+91 00000 00000]" },
  // TODO(content): WhatsApp number, digits only with country code (used in wa.me links).
  whatsapp: { digits: filled(c.whatsappDigits) ?? "910000000000", display: filled(c.whatsappDisplay) ?? "[+91 00000 00000]" },
  // TODO(content): enquiry email.
  email: filled(c.email) ?? "[info@example.com]",
  // TODO(content): registered office address.
  address: {
    street: filled(c.street) ?? "[Office address line]",
    locality: filled(c.locality) ?? "[City]",
    region: filled(c.region) ?? "[State]",
    // No PIN code given: it is simply left out of the address (never guessed). The placeholder shows only while the
    // whole address is unanswered.
    postalCode: filled(c.postalCode) ?? (filled(c.street) ? "" : "[000000]"),
    country: "IN",
  },
  // TODO(content): GSTIN.
  gstin: filled(id.gstin) ?? "[GSTIN to be supplied]",
  // TODO(content): PAN (shown on the Government work page only).
  pan: filled(id.pan) ?? "[PAN to be supplied]",
  // TODO(content): primary service area, e.g. "Lucknow and nearby districts".
  serviceArea: filled(c.serviceArea) ?? "[City / region]",
  // TODO(content): Google Maps share link for the office. While empty, links search the address.
  mapUrl: filled(c.mapUrl) ?? "",
  // TODO(content): office hours.
  hours: filled(c.hours) ?? "[Mon–Sat, 10:00–18:00]",
} as const;

export function isPlaceholder(value: string): boolean {
  return value.startsWith(PLACEHOLDER_PREFIX);
}

export function whatsappLink(text?: string): string {
  const base = `https://wa.me/${site.whatsapp.digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

const DEVANAGARI = /[\u0900-\u097F]/;

/**
 * The office address on one line; parts that are empty (for example the PIN code) are left out, with no stray comma
 * or space. `native: false` drops any "(देवनागरी)" part in brackets, for the footer, maps and other places that
 * should not need the Devanagari font.
 */
export function addressLine({ native = true }: { native?: boolean } = {}): string {
  const a = site.address;
  const street = native ? a.street : a.street.replace(/\s*\([^)]*\)/g, (m) => (DEVANAGARI.test(m) ? "" : m));
  return [street, a.locality, [a.region, a.postalCode].filter(Boolean).join(" ")].filter(Boolean).join(", ");
}

export function mapsLink(): string {
  return site.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.name}, ${addressLine({ native: false })}`)}`;
}

/** Keyless Google Maps embed, loaded only after the visitor clicks "Show map". */
export function mapsEmbedUrl(): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(`${site.name}, ${addressLine({ native: false })}`)}&output=embed`;
}

export function telLink(): string {
  return `tel:${site.phone.e164}`;
}
