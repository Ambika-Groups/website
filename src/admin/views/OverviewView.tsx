"use client";

import { useMemo, useState } from "react";
import {
  cityOf,
  countBy,
  funnel,
  inPeriod,
  median,
  overTime,
  previousPeriod,
  responseHours,
  sourceOf,
  type Grain,
} from "@/lib/admin-analytics";
import { creditsThisMonth } from "../credits";
import type { AdminStore, Enquiry, Post, Project, PublishEntry, PublishState } from "../types";
import { Badge, BarList, fmtDate, inputClass, panel, TimeBars, useLoad } from "../ui";

const periods = [
  { id: "7", label: "Last 7 days", days: 7, grain: "day" },
  { id: "30", label: "Last 30 days", days: 30, grain: "day" },
  { id: "90", label: "Last 90 days", days: 90, grain: "week" },
  { id: "365", label: "Last 12 months", days: 365, grain: "month" },
] as const;

const workLabels: Record<string, string> = { house: "House", apartment: "Apartment", road: "Road", interlocking: "Interlocking / paver", other: "Other" };

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className={`${panel} p-4`}>
      <p className="t-meta text-text-2">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tabular">{value}</p>
      {sub && <p className="mt-1 text-sm text-text-2">{sub}</p>}
    </div>
  );
}

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`${panel} p-5 ${className}`} aria-label={title}>
      <h2 className="mb-4 text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}

const hours = (h: number | null) => (h === null ? "—" : h < 1 ? `${Math.round(h * 60)} min` : h < 48 ? `${h.toFixed(1)} h` : `${(h / 24).toFixed(1)} days`);

export function OverviewView({ store, publishTick }: { store: AdminStore; publishTick: number }) {
  const [periodId, setPeriodId] = useState<(typeof periods)[number]["id"]>("30");
  const period = periods.find((p) => p.id === periodId)!;
  const [grain, setGrain] = useState<Grain | "auto">("auto");
  const g: Grain = grain === "auto" ? period.grain : grain;

  const { data: enquiries, error } = useLoad<Enquiry[]>(() => store.listEnquiries(), []);
  const { data: posts } = useLoad<Post[]>(() => store.listPosts(), []);
  const { data: projects } = useLoad<Project[]>(() => store.listProjects(), []);
  const { data: publishes } = useLoad<PublishEntry[]>(() => store.listPublishes(), [publishTick]);
  const { data: publishState } = useLoad<PublishState>(() => store.getPublishState(), [publishTick]);

  // "Now" is fixed when the page opens, so the period doesn't drift while it stays open.
  const [now] = useState(() => Date.now());
  const stats = useMemo(() => {
    if (!enquiries) return null;
    const to = new Date(now).toISOString();
    const from = new Date(now - period.days * 86_400_000).toISOString();
    const items = inPeriod(enquiries, from, to);
    const [pf, pt] = previousPeriod(from, to);
    const prev = inPeriod(enquiries, pf, pt).length;
    const f = funnel(items);
    const rh = responseHours(items);
    return {
      items,
      prev,
      funnel: f,
      responseMedian: median(rh),
      responded: rh.length,
      series: overTime(items, from, to, g),
      byWork: countBy(items, (e) => workLabels[e.work_type] ?? e.work_type),
      byCity: countBy(items, (e) => cityOf(e.location)).slice(0, 8),
      bySource: countBy(items, sourceOf).slice(0, 8),
      byCampaign: countBy(items.filter((e) => e.utm_campaign), (e) => e.utm_campaign).slice(0, 6),
      byPage: countBy(items, (e) => e.sourcePath || "(unknown)").slice(0, 8),
      byForm: countBy(items, (e) => e.form_id).slice(0, 8),
      needsChecking: enquiries.filter((e) => e.needsChecking).length,
      openNew: enquiries.filter((e) => e.status === "new").length,
    };
  }, [enquiries, period.days, g, now]);

  const credits = creditsThisMonth(publishes ?? []);
  const lastPublish = publishes?.[0];
  const published = posts?.filter((p) => p.status === "published") ?? [];
  const latestPost = [...published].sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="t-h2 !text-3xl">Overview</h1>
          <p className="mt-1 text-text-2">Counted from the enquiries themselves. Nothing here is estimated.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="text-sm">
            <span className="mb-1 block text-text-2">Period</span>
            <select className={inputClass} value={periodId} onChange={(e) => setPeriodId(e.target.value as typeof periodId)}>
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-text-2">Group by</span>
            <select className={inputClass} value={grain} onChange={(e) => setGrain(e.target.value as Grain | "auto")}>
              <option value="auto">Automatic</option>
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </label>
        </div>
      </div>

      {error && <p className="text-error">Could not load enquiries: {error}</p>}
      {!stats ? (
        <p role="status" className="text-text-2">
          Loading…
        </p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Tile
              label="Enquiries"
              value={String(stats.items.length)}
              sub={stats.prev ? `${stats.items.length >= stats.prev ? "+" : ""}${stats.items.length - stats.prev} vs the previous period (${stats.prev})` : "No enquiries in the previous period"}
            />
            <Tile
              label="Conversion"
              value={stats.funnel.conversion === null ? "—" : `${Math.round(stats.funnel.conversion * 100)}%`}
              sub={`${stats.funnel.stages[3].count} won of ${stats.funnel.total}`}
            />
            <Tile label="Median response time" value={hours(stats.responseMedian)} sub={`From enquiry to first contact, ${stats.responded} contacted`} />
            <Tile label="Waiting (all time)" value={String(stats.openNew)} sub={`Still "new"${stats.needsChecking ? ` · ${stats.needsChecking} need checking` : ""}`} />
          </div>

          <Card title={`Enquiries over time (by ${g})`}>
            <TimeBars items={stats.series} label={`Enquiries by ${g}, ${period.label.toLowerCase()}`} />
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Status funnel">
              <BarList label="Enquiries reaching each stage" items={stats.funnel.stages.map((s) => ({ key: s.key.charAt(0).toUpperCase() + s.key.slice(1), count: s.count }))} total={stats.funnel.total} />
              <p className="mt-3 text-sm text-text-2">Lost: {stats.funnel.lost}</p>
            </Card>
            <Card title="By type of work">
              <BarList label="Enquiries by type of work" items={stats.byWork} total={stats.items.length} />
            </Card>
            <Card title="By location (top 8)">
              <BarList label="Enquiries by city" items={stats.byCity} total={stats.items.length} />
            </Card>
            <Card title="By source (UTM)">
              <BarList label="Enquiries by source" items={stats.bySource} total={stats.items.length} />
              {stats.byCampaign.length > 0 && (
                <>
                  <h3 className="mt-5 mb-3 text-sm font-semibold">Campaigns</h3>
                  <BarList label="Enquiries by campaign" items={stats.byCampaign} />
                </>
              )}
            </Card>
            <Card title="Top pages that bring enquiries">
              <BarList label="Enquiries by page" items={stats.byPage} total={stats.items.length} />
            </Card>
            <Card title="By form placement">
              <BarList label="Enquiries by form" items={stats.byForm} total={stats.items.length} />
            </Card>
          </div>
        </>
      )}

      <Card title="Website">
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <dt className="t-meta text-text-2">Blog</dt>
            <dd className="mt-1">
              {posts ? `${published.length} published · ${posts.length - published.length} draft${posts.length - published.length === 1 ? "" : "s"}` : "…"}
              {latestPost && <span className="block text-sm text-text-2">Latest: {latestPost.title} ({fmtDate(latestPost.publishedAt)})</span>}
            </dd>
          </div>
          <div>
            <dt className="t-meta text-text-2">Projects</dt>
            <dd className="mt-1">
              {projects ? `${projects.filter((p) => p.showOnWebsite).length} shown · ${projects.filter((p) => !p.showOnWebsite).length} hidden` : "…"}
              {projects?.some((p) => p.reviewFlag) && (
                <span className="mt-1 block">
                  <Badge tone="warning">{projects.filter((p) => p.reviewFlag).length} completed, to review</Badge>
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="t-meta text-text-2">Last publish</dt>
            <dd className="mt-1">
              {lastPublish ? `${fmtDate(lastPublish.at, true)} · ${lastPublish.status}` : "Never"}
              {publishState?.dirty && <span className="block text-sm text-text-2">{publishState.changes} change(s) waiting to publish</span>}
            </dd>
          </div>
          <div>
            <dt className="t-meta text-text-2">Netlify credits this month</dt>
            <dd className="mt-1">
              {credits.used} of 300 used ({credits.count} publish{credits.count === 1 ? "" : "es"})
              <span className="block text-sm text-text-2">Counted from this site&rsquo;s publish log; 15 credits each.</span>
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
