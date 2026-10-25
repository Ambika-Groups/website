// UTM capture: read from the visit's first page URL, keep in sessionStorage, send on submit.

export const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
export type Utm = Record<(typeof utmKeys)[number], string>;

export const emptyUtm: Utm = {
  utm_source: "",
  utm_medium: "",
  utm_campaign: "",
  utm_term: "",
  utm_content: "",
};

const STORAGE_KEY = "ag_utm";

export function parseUtm(search: string): Utm {
  const params = new URLSearchParams(search);
  const utm = { ...emptyUtm };
  for (const key of utmKeys) utm[key] = (params.get(key) ?? "").trim().slice(0, 200);
  return utm;
}

/** Stores the first page's UTM values once per session; later pages never overwrite them. */
export function captureUtm(search: string, storage: Storage | undefined): void {
  try {
    if (!storage || storage.getItem(STORAGE_KEY) !== null) return;
    storage.setItem(STORAGE_KEY, JSON.stringify(parseUtm(search)));
  } catch {
    // Storage blocked (private mode, disabled cookies): enquiries go without UTM values.
  }
}

export function readUtm(storage: Storage | undefined): Utm {
  try {
    const stored = storage?.getItem(STORAGE_KEY);
    if (!stored) return { ...emptyUtm };
    const parsed: unknown = JSON.parse(stored);
    const utm = { ...emptyUtm };
    if (parsed && typeof parsed === "object") {
      for (const key of utmKeys) {
        const value = (parsed as Record<string, unknown>)[key];
        if (typeof value === "string") utm[key] = value;
      }
    }
    return utm;
  } catch {
    return { ...emptyUtm };
  }
}
