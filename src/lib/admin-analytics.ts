// Dashboard analytics, computed from the enquiries themselves (never estimated or invented). Pure functions, no
// DOM or Firebase, so they are unit-tested with node --test (admin-analytics.test.ts).

export type Grain = "day" | "week" | "month";

export interface AnalyticsEnquiry {
  createdAt: string;
  status: string;
  work_type: string;
  location: string;
  source: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  source_url: string;
  sourcePath: string;
  form_id: string;
  firstContactAt: string | null;
}

export interface Count {
  key: string;
  count: number;
}

const DAY = 86_400_000;

/** Start of the bucket (UTC dates, so results don't depend on the viewer's time zone). Weeks start on Monday. */
export function bucketStart(iso: string, grain: Grain): string {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  if (grain === "month") return `${y}-${String(m + 1).padStart(2, "0")}`;
  const day = new Date(Date.UTC(y, m, d.getUTCDate()));
  if (grain === "week") day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7));
  return day.toISOString().slice(0, 10);
}

/** Every bucket from `from` to `to` (inclusive), so empty periods show as 0 instead of disappearing. */
export function buckets(fromIso: string, toIso: string, grain: Grain): string[] {
  const out: string[] = [];
  const end = bucketStart(toIso, grain);
  let d = new Date(`${bucketStart(fromIso, grain)}${grain === "month" ? "-01" : ""}T00:00:00Z`);
  for (let guard = 0; guard < 1000; guard++) {
    const key = bucketStart(d.toISOString(), grain);
    if (out[out.length - 1] !== key) out.push(key);
    if (key === end) break;
    if (grain === "month") d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
    else d = new Date(d.getTime() + (grain === "week" ? 7 : 1) * DAY);
  }
  return out;
}

export function inPeriod<T extends { createdAt: string }>(items: T[], fromIso: string, toIso: string): T[] {
  const from = Date.parse(fromIso);
  const to = Date.parse(toIso);
  return items.filter((e) => {
    const t = Date.parse(e.createdAt);
    return t >= from && t <= to;
  });
}

export function overTime(items: AnalyticsEnquiry[], fromIso: string, toIso: string, grain: Grain): Count[] {
  const counts = new Map(buckets(fromIso, toIso, grain).map((k) => [k, 0]));
  for (const e of items) {
    const k = bucketStart(e.createdAt, grain);
    if (counts.has(k)) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts].map(([key, count]) => ({ key, count }));
}

/** Counts by a key, largest first; ties alphabetical. Blank keys count as `blank`. */
export function countBy<T>(items: T[], key: (item: T) => string, blank = "(not set)"): Count[] {
  const m = new Map<string, number>();
  for (const it of items) {
    const k = key(it).trim() || blank;
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m].map(([k, count]) => ({ key: k, count })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

/** Location as typed, grouped case-insensitively on its first part ("Lucknow, Gomti Nagar" → "Lucknow"). */
export const cityOf = (location: string) => {
  const first = location.split(/[,/-]/)[0].trim();
  return first ? first.charAt(0).toUpperCase() + first.slice(1).toLowerCase() : "";
};

/** Source for the "by source" chart: UTM source (with medium), else the referrer-less "direct". */
export const sourceOf = (e: AnalyticsEnquiry) => (e.utm_source ? (e.utm_medium ? `${e.utm_source} / ${e.utm_medium}` : e.utm_source) : "direct");

export const funnelOrder = ["new", "contacted", "quoted", "won", "lost"] as const;

/**
 * The status funnel: how many enquiries reached each stage. A won or quoted enquiry has also been contacted,
 * so stages count everything at or beyond them; "lost" is reported on its own.
 */
export function funnel(items: AnalyticsEnquiry[]) {
  const rank: Record<string, number> = { new: 0, contacted: 1, quoted: 2, won: 3 };
  const total = items.length;
  const reached = (r: number) => items.filter((e) => e.status !== "lost" && (rank[e.status] ?? 0) >= r).length;
  const lost = items.filter((e) => e.status === "lost").length;
  const won = items.filter((e) => e.status === "won").length;
  return {
    total,
    stages: [
      { key: "received", count: total },
      { key: "contacted", count: reached(1) + lost },
      { key: "quoted", count: reached(2) },
      { key: "won", count: won },
    ],
    lost,
    /** Won ÷ all enquiries in the period. null when there are none (never a made-up 0%). */
    conversion: total ? won / total : null,
  };
}

/** Hours from enquiry to first contact, for enquiries that have been contacted. */
export function responseHours(items: AnalyticsEnquiry[]): number[] {
  return items
    .filter((e) => e.firstContactAt)
    .map((e) => (Date.parse(e.firstContactAt as string) - Date.parse(e.createdAt)) / 3_600_000)
    .filter((h) => Number.isFinite(h) && h >= 0)
    .sort((a, b) => a - b);
}

export function median(sorted: number[]): number | null {
  if (!sorted.length) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** The comparison period just before [from, to], the same length. */
export function previousPeriod(fromIso: string, toIso: string): [string, string] {
  const from = Date.parse(fromIso);
  const len = Date.parse(toIso) - from;
  return [new Date(from - len - 1).toISOString(), new Date(from - 1).toISOString()];
}
