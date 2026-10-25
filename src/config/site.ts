// Every company contact detail lives here, so swapping placeholders for real values is a
// one-file edit. Values in [square brackets] are placeholders and render as-is in the UI.

export const PLACEHOLDER_PREFIX = "[";

export const site = {
  // Trading name shown across the site. TODO(content): confirm ("Ambika Group" vs "Ambika Groups").
  name: "Ambika Group",
  // TODO(content): registered legal name, exactly as on the GST certificate.
  legalName: "[Registered legal name]",
  shortMark: "AG",
  // TODO(content): real domain. Read from env so builds for staging/production can differ.
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.example.com").replace(/\/$/, ""),
  // TODO(content): main phone, as dialled and as displayed.
  phone: { e164: "+910000000000", display: "[+91 00000 00000]" },
  // TODO(content): WhatsApp number, digits only with country code (used in wa.me links).
  whatsapp: { digits: "910000000000", display: "[+91 00000 00000]" },
  // TODO(content): enquiry email.
  email: "[info@example.com]",
  // TODO(content): registered office address.
  address: {
    street: "[Office address line]",
    locality: "[City]",
    region: "[State]",
    postalCode: "[000000]",
    country: "IN",
  },
  // TODO(content): GSTIN.
  gstin: "[GSTIN to be supplied]",
  // TODO(content): primary service area, e.g. "Lucknow and nearby districts".
  serviceArea: "[City / region]",
  // TODO(content): Google Maps share link for the office. While empty, links search the address.
  mapUrl: "",
  // TODO(content): office hours.
  hours: "[Mon–Sat, 10:00–18:00]",
} as const;

export function isPlaceholder(value: string): boolean {
  return value.startsWith(PLACEHOLDER_PREFIX);
}

export function whatsappLink(text?: string): string {
  const base = `https://wa.me/${site.whatsapp.digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function addressLine(): string {
  const a = site.address;
  return `${a.street}, ${a.locality}, ${a.region} ${a.postalCode}`;
}

export function mapsLink(): string {
  return site.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.name}, ${addressLine()}`)}`;
}

/** Keyless Google Maps embed, loaded only after the visitor clicks "Show map". */
export function mapsEmbedUrl(): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(`${site.name}, ${addressLine()}`)}&output=embed`;
}

export function telLink(): string {
  return `tel:${site.phone.e164}`;
}
