/* eslint-disable @typescript-eslint/no-unused-expressions -- one-line `ok ? pass(...) : fail(...)` checks read best as they are */
// After a deploy: is the live site right? Requests only (light on the machine), no browser.
//
//   npm run verify:live -- https://your-site.netlify.app            a preview deploy: warnings, not failures, for the
//                                                                   site address (it is not the real domain yet)
//   npm run verify:live -- https://www.yourdomain.in --production   the real site: the canonical address, robots.txt and
//                                                                   the sitemap must use the domain, and the launch
//                                                                   check must be READY
// Prints one PASS / WARN / FAIL line per check and ends with READY or NOT READY (exit 0 / 1). It checks: every page,
// the 404, the security and cache headers, the redirects, robots.txt, the sitemap, canonical addresses, that the
// enquiry form has an endpoint and key, that no placeholder text shows, and the launch-check state.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const argv = process.argv.slice(2);
const production = argv.includes("--production");
const target = argv.find((a) => /^https?:\/\//.test(a));
if (!target) {
  console.error("Usage: npm run verify:live -- <https://site-address> [--production]");
  process.exit(2);
}
const base = new URL(target);
const origin = base.origin;
const results = [];
const add = (level, name, detail = "") => results.push({ level, name, detail });
const pass = (n, d) => add("PASS", n, d);
const warn = (n, d) => add("WARN", n, d);
const fail = (n, d) => add("FAIL", n, d);
/** A check that must hold on a real site but is only a heads-up on a preview. */
const prodOnly = (ok, name, detail) => (ok ? pass(name, detail) : production ? fail(name, detail) : warn(name, `${detail} (a preview may differ; this fails with --production)`));

async function get(path, { redirect = "manual" } = {}) {
  try {
    const res = await fetch(new URL(path, origin), { redirect, signal: AbortSignal.timeout(25000), headers: { "user-agent": "ambika-verify-live" } });
    return { status: res.status, headers: res.headers, text: res.headers.get("content-type")?.match(/text|json|xml|html|javascript/) ? await res.text() : "" };
  } catch (e) {
    return { status: 0, headers: new Headers(), text: "", error: String(e.cause?.code ?? e.message) };
  }
}
const h = (r, name) => r.headers.get(name) ?? "";
const visible = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");

// ── the site is up, and which pages exist ────────────────────────────────────────────────────────────────────────
const home = await get("/");
if (home.status !== 200) {
  console.log(`FAIL  ${origin} answered ${home.status || home.error}. Is the deploy finished? Credits used up ("Site not available")?`);
  console.log("\nNOT READY");
  process.exit(1);
}
pass("Home page", "200");

const sitemap = await get("/sitemap.xml");
const sitemapUrls = [...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const required = ["/", "/services", "/services/construction", "/services/road-works", "/services/interlocking-paver", "/services/real-estate-development", "/services/plumbing-sewage", "/government-work", "/about", "/contact", "/privacy"];
const paths = [...new Set([...required, ...sitemapUrls.map((u) => new URL(u).pathname.replace(/\/$/, "") || "/")])].filter((p) => !p.startsWith("/admin"));

// ── every page ───────────────────────────────────────────────────────────────────────────────────────────────────
const pages = new Map();
for (const path of paths) {
  const r = path === "/" ? home : await get(path);
  pages.set(path, r);
  const html = r.text;
  const problems = [];
  if (r.status !== 200) problems.push(`status ${r.status || r.error}`);
  else {
    if (!/<title>[^<]{3,}<\/title>/.test(html)) problems.push("no title");
    if ((html.match(/<h1[\s>]/g) ?? []).length !== 1) problems.push("not exactly one h1");
    if (!/<html[^>]* lang="en/.test(html)) problems.push("no lang");
    if (/<meta name="robots" content="[^"]*noindex/.test(html) && !/\/(none|tag\/none)$/.test(path) && path !== "/projects" && path !== "/blog") problems.push("marked noindex");
  }
  if (problems.length) fail(`Page ${path}`, problems.join(", "));
  else pass(`Page ${path}`, "200, title, one h1, lang");
}

// ── 404 ──────────────────────────────────────────────────────────────────────────────────────────────────────────
const nf = await get("/this-page-does-not-exist-xyz");
if (nf.status === 404 && /not found|couldn.t find|404/i.test(visible(nf.text))) pass("404 page", "unknown address gives 404 with the not-found page");
else fail("404 page", `status ${nf.status}, ${nf.text ? "no not-found text" : "empty"}`);

// ── headers ──────────────────────────────────────────────────────────────────────────────────────────────────────
const headerChecks = [
  ["X-Content-Type-Options", (v) => v.toLowerCase() === "nosniff"],
  ["Referrer-Policy", (v) => v === "strict-origin-when-cross-origin"],
  ["X-Frame-Options", (v) => v.toUpperCase() === "DENY"],
  ["Content-Security-Policy", (v) => /frame-ancestors 'none'/.test(v)],
  ["Permissions-Policy", (v) => /camera=\(\)/.test(v)],
];
for (const [name, ok] of headerChecks) {
  for (const [label, r] of [["page", home], ["404", nf]]) {
    if (ok(h(r, name))) pass(`Header ${name} (${label})`);
    else fail(`Header ${name} (${label})`, h(r, name) ? "has the wrong value" : "missing: is out/_headers deployed?");
  }
}
if (!/immutable/.test(h(home, "cache-control"))) pass("HTML is not cached for a year", h(home, "cache-control") || "(Netlify default)");
else fail("HTML is not cached for a year", h(home, "cache-control"));

const assets = [...home.text.matchAll(/["'(](\/_next\/static\/[^"')\s]+\.(?:js|css))/g)].map((m) => m[1]);
if (assets[0]) {
  const a = await get(assets[0]);
  /immutable/.test(h(a, "cache-control")) && /max-age=31536000/.test(h(a, "cache-control")) ? pass("Cache: /_next/static files", "immutable, one year") : fail("Cache: /_next/static files", h(a, "cache-control") || "no cache-control");
} else warn("Cache: /_next/static files", "no asset link found on the home page");
const img = home.text.match(/\/images\/[^"')\s,]+\.(?:webp|avif)/)?.[0];
if (img) {
  const a = await get(img);
  /immutable/.test(h(a, "cache-control")) ? pass("Cache: /images files", "immutable") : fail("Cache: /images files", h(a, "cache-control") || "no cache-control");
} else warn("Cache: /images files", "no photo found on the home page to test");
const admin = await get("/admin");
/noindex/.test(h(admin, "x-robots-tag")) && /no-store/.test(h(admin, "cache-control")) ? pass("/admin is kept out of search", "X-Robots-Tag noindex, no-store") : fail("/admin is kept out of search", `X-Robots-Tag "${h(admin, "x-robots-tag")}", cache-control "${h(admin, "cache-control")}"`);

// ── redirects ────────────────────────────────────────────────────────────────────────────────────────────────────
for (const [from, to] of [["/index.html", "/"], ["/contact.html", "/contact"], ["/about.html", "/about"]]) {
  const r = await get(from);
  r.status === 301 && new URL(h(r, "location"), origin).pathname === to ? pass(`Redirect ${from}`, `301 → ${to}`) : fail(`Redirect ${from}`, `status ${r.status}, location "${h(r, "location")}" (expected 301 → ${to})`);
}
const slash = await get("/about/");
slash.status === 200 || (slash.status >= 300 && slash.status < 400) ? pass("Trailing slash /about/", `${slash.status}`) : fail("Trailing slash /about/", `${slash.status}`);

// ── robots, sitemap, canonical ───────────────────────────────────────────────────────────────────────────────────
const robots = await get("/robots.txt");
const robotsOk = robots.status === 200 && /Allow: \//.test(robots.text) && !/^Disallow:\s*\/\s*$/m.test(robots.text);
robotsOk ? pass("robots.txt", "200, allows crawling") : fail("robots.txt", `status ${robots.status}`);
const robotsHost = robots.text.match(/Sitemap:\s*(\S+)/)?.[1];
prodOnly(!!robotsHost && new URL(robotsHost).host === base.host, "robots.txt sitemap address", robotsHost ? `points to ${new URL(robotsHost).host}` : "no Sitemap line");
sitemap.status === 200 && sitemapUrls.length >= 10 ? pass("sitemap.xml", `${sitemapUrls.length} addresses`) : fail("sitemap.xml", `status ${sitemap.status}, ${sitemapUrls.length} addresses`);
sitemapUrls.some((u) => /\/admin/.test(u)) ? fail("sitemap.xml excludes /admin", "it lists /admin") : pass("sitemap.xml excludes /admin");
const sitemapHosts = [...new Set(sitemapUrls.map((u) => new URL(u).host))];
prodOnly(sitemapHosts.length === 1 && sitemapHosts[0] === base.host, "sitemap.xml addresses", `host(s): ${sitemapHosts.join(", ")}`);
const wrongCanon = [];
const exampleCanon = [];
for (const [path, r] of pages) {
  const c = r.text.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (r.status !== 200) continue;
  if (!c) wrongCanon.push(path + " (none)");
  else if (new URL(c, origin).host !== base.host) (/example\.com/.test(c) ? exampleCanon : wrongCanon).push(`${path} → ${new URL(c, origin).host}`);
}
!wrongCanon.length && !exampleCanon.length ? pass("Canonical addresses", `every page uses ${base.host}`) : prodOnly(false, "Canonical addresses", `${exampleCanon.length ? "the site address (SITE_URL) is not set yet, so pages say www.example.com; " : ""}${[...exampleCanon, ...wrongCanon].slice(0, 3).join("; ")}`);

// ── the enquiry form ─────────────────────────────────────────────────────────────────────────────────────────────
const contact = pages.get("/contact");
const chunks = [...new Set([...(contact?.text ?? "").matchAll(/\/_next\/static\/chunks\/[^"')\s]+\.js/g)].map((m) => m[0]))];
let formCode = "";
for (const c of chunks) {
  const r = await get(c);
  if (/api\.web3forms\.com|submitEnquiry/.test(r.text)) formCode += r.text;
}
if (!formCode) warn("Enquiry form", "could not find the form code in the Contact page's scripts");
else {
  const web3 = /api\.web3forms\.com/.test(formCode);
  const backend = /cloudfunctions\.net\/submitEnquiry|\/submitEnquiry/.test(formCode);
  const keyPlaceholder = /YOUR_WEB3FORMS_ACCESS_KEY/i.test(formCode);
  const hasKey = /["'`][0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}["'`]/i.test(formCode);
  if (keyPlaceholder) fail("Enquiry form", "the form still has the placeholder access key: enquiries would be lost");
  else if (backend) pass("Enquiry form", "posts to the website's own back end");
  else if (web3 && hasKey) pass("Enquiry form", "posts to Web3Forms with an access key (not shown)");
  else if (web3) fail("Enquiry form", "posts to Web3Forms but no access key was found: set NEXT_PUBLIC_WEB3FORMS_KEY on Netlify and redeploy");
  else warn("Enquiry form", "could not tell where the form posts");
}

// ── no placeholder text ──────────────────────────────────────────────────────────────────────────────────────────
const placeholderPages = [];
let stockPhotoPages = 0;
for (const [path, r] of pages) {
  if (r.status !== 200) continue;
  const text = visible(r.text).replace(/name@example\.com/g, "");
  const hits = [...text.matchAll(/\[[^\]\[]{2,}\]/g)].map((m) => m[0].slice(0, 40));
  if (/0000000000/.test(r.text)) hits.push("phone number 0000000000");
  if (hits.length) placeholderPages.push(`${path}: ${[...new Set(hits)].slice(0, 2).join(", ")}`);
  if (/Illustrative photo/.test(text)) stockPhotoPages += 1;
}
placeholderPages.length ? fail("No placeholder text on any page", placeholderPages.slice(0, 4).join(" | ")) : pass("No placeholder text on any page", "no [bracketed] text and no 0000000000");
stockPhotoPages ? warn("Stock photos", `${stockPhotoPages} page(s) show "Illustrative photo" labels (expected until real photos arrive)`) : pass("Stock photos", "none labelled");

// ── the launch check ─────────────────────────────────────────────────────────────────────────────────────────────
const lc = spawnSync(process.execPath, [fileURLToPath(new URL("./launch-check.mjs", import.meta.url))], { cwd: root, encoding: "utf8", env: { ...process.env, NEXT_PUBLIC_SITE_URL: production ? origin : process.env.NEXT_PUBLIC_SITE_URL ?? "" } });
const result = lc.stdout.match(/RESULT: (READY|NOT READY)[^\n]*/)?.[0];
if (!result) warn("Launch check", "could not run (build the site first: npm run build)");
else if (/RESULT: READY/.test(result)) pass("Launch check", "READY (this folder's last build and settings)");
else prodOnly(false, "Launch check", `${result} Run npm run launch-check for the list.`);

// ── report ───────────────────────────────────────────────────────────────────────────────────────────────────────
const tag = { PASS: "PASS", WARN: "WARN", FAIL: "FAIL" };
for (const r of results) console.log(`${tag[r.level]}  ${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
const fails = results.filter((r) => r.level === "FAIL").length;
const warns = results.filter((r) => r.level === "WARN").length;
console.log(`\n${results.length} checks on ${origin} (${production ? "production" : "preview"} mode): ${results.length - fails - warns} passed, ${warns} warning(s), ${fails} failed.`);
console.log(fails ? "NOT READY" : "READY");
process.exit(fails ? 1 : 0);
