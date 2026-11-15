import assert from "node:assert/strict";
import { test } from "node:test";
import {
  bucketStart,
  buckets,
  cityOf,
  countBy,
  funnel,
  inPeriod,
  median,
  overTime,
  previousPeriod,
  responseHours,
  sourceOf,
  type AnalyticsEnquiry,
} from "./admin-analytics.ts";
import { csvCell, toCsv } from "./csv.ts";

const e = (over: Partial<AnalyticsEnquiry>): AnalyticsEnquiry => ({
  createdAt: "2026-10-05T10:00:00Z",
  status: "new",
  work_type: "house",
  location: "Lucknow",
  source: "direct",
  utm_source: "",
  utm_medium: "",
  utm_campaign: "",
  source_url: "https://x.in/contact",
  sourcePath: "/contact",
  form_id: "contact-page",
  firstContactAt: null,
  ...over,
});

test("buckets: weeks start on Monday, months are YYYY-MM", () => {
  assert.equal(bucketStart("2026-10-07T23:00:00Z", "week"), "2026-10-05"); // Wednesday → Monday
  assert.equal(bucketStart("2026-10-05T00:00:00Z", "week"), "2026-10-05");
  assert.equal(bucketStart("2026-10-11T12:00:00Z", "week"), "2026-10-05"); // Sunday
  assert.equal(bucketStart("2026-10-31T12:00:00Z", "month"), "2026-10");
  assert.deepEqual(buckets("2026-10-30T00:00:00Z", "2026-11-02T00:00:00Z", "day"), ["2026-10-30", "2026-10-31", "2026-11-01", "2026-11-02"]);
  assert.deepEqual(buckets("2026-11-15T00:00:00Z", "2027-01-02T00:00:00Z", "month"), ["2026-11", "2026-12", "2027-01"]);
});

test("over time keeps empty periods at 0", () => {
  const items = [e({ createdAt: "2026-10-01T09:00:00Z" }), e({ createdAt: "2026-10-01T15:00:00Z" }), e({ createdAt: "2026-10-03T09:00:00Z" })];
  assert.deepEqual(overTime(items, "2026-10-01T00:00:00Z", "2026-10-03T23:59:59Z", "day"), [
    { key: "2026-10-01", count: 2 },
    { key: "2026-10-02", count: 0 },
    { key: "2026-10-03", count: 1 },
  ]);
});

test("period filter and the previous period", () => {
  const items = [e({ createdAt: "2026-09-30T23:59:59Z" }), e({ createdAt: "2026-10-01T00:00:00Z" })];
  assert.equal(inPeriod(items, "2026-10-01T00:00:00Z", "2026-10-31T23:59:59Z").length, 1);
  const [pf, pt] = previousPeriod("2026-10-11T00:00:00Z", "2026-10-20T00:00:00Z");
  assert.ok(Date.parse(pt) < Date.parse("2026-10-11T00:00:00Z"));
  assert.equal(Date.parse("2026-10-20T00:00:00Z") - Date.parse("2026-10-11T00:00:00Z"), Date.parse(pt) - Date.parse(pf));
});

test("counts, cities and sources", () => {
  const items = [e({ location: "lucknow, Gomti Nagar" }), e({ location: "Lucknow" }), e({ location: "Kanpur" }), e({ location: "" })];
  assert.deepEqual(countBy(items, (x) => cityOf(x.location)), [
    { key: "Lucknow", count: 2 },
    { key: "(not set)", count: 1 },
    { key: "Kanpur", count: 1 },
  ]);
  assert.equal(sourceOf(e({ utm_source: "meta", utm_medium: "paid" })), "meta / paid");
  assert.equal(sourceOf(e({})), "direct");
});

test("funnel and conversion are computed, never invented", () => {
  assert.equal(funnel([]).conversion, null);
  const f = funnel([e({ status: "new" }), e({ status: "contacted" }), e({ status: "quoted" }), e({ status: "won" }), e({ status: "lost" })]);
  assert.deepEqual(f.stages.map((s) => s.count), [5, 4, 2, 1]);
  assert.equal(f.lost, 1);
  assert.equal(f.conversion, 0.2);
});

test("response time in hours and its median", () => {
  const hours = responseHours([
    e({ createdAt: "2026-10-01T10:00:00Z", firstContactAt: "2026-10-01T12:00:00Z" }),
    e({ createdAt: "2026-10-01T10:00:00Z", firstContactAt: "2026-10-01T11:00:00Z" }),
    e({ createdAt: "2026-10-01T10:00:00Z", firstContactAt: null }),
  ]);
  assert.deepEqual(hours, [1, 2]);
  assert.equal(median(hours), 1.5);
  assert.equal(median([]), null);
});

test("CSV quotes cells and defuses formulas", () => {
  assert.equal(csvCell('He said "hi"'), '"He said ""hi"""');
  assert.equal(csvCell("=HYPERLINK(1)"), `"'=HYPERLINK(1)"`);
  assert.equal(csvCell("+91 98765"), `"'+91 98765"`);
  assert.equal(csvCell(null), '""');
  assert.ok(toCsv(["a", "b"], [[1, "x,y"]]).endsWith('"a","b"\r\n"1","x,y"\r\n'));
});
