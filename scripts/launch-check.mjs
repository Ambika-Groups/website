// Launch check: is the production build ready to go live? Lists every unanswered question (LAUNCH-QUESTIONS.md,
// numbered Q1…) and every placeholder still visible in out/, with where to answer it.
//
//   npm run launch-check            full report; exit 1 if a must-have is unanswered or a placeholder is visible
//   node scripts/launch-check.mjs --soft   short summary, always exit 0 (this is what runs after every build)
//   LAUNCH_STRICT=1 npm run build   makes that after-build run fail the build (set it in Netlify when ready to launch)
//
// It reads: out/ (the production build), the settings snapshot src/generated/cms-*.json (what the admin published),
// the build's environment (.env.local and process env), and public/ (logo and share image).
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { launchAnswers } from "../src/config/launch-answers.ts";
import { answersToProjects, answersToSettings, hasContent, merge } from "../src/lib/answers.ts";
import { questions } from "./launch-questions.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const soft = process.argv.includes("--soft");
const strictEnv = process.env.LAUNCH_STRICT === "1";

// ── inputs ────────────────────────────────────────────────────────────────────────────────────────────────────
// Same precedence as Next.js: the process environment (Netlify) > .env.local > .env.
const env = { ...readEnvFile(".env"), ...readEnvFile(".env.local"), ...process.env };
function readEnvFile(name) {
  const out = {};
  try {
    for (const line of readFileSync(join(root, name), "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
  return out;
}
const readJson = (p, fallback) => {
  try {
    return JSON.parse(readFileSync(join(root, p), "utf8"));
  } catch {
    return fallback;
  }
};
// Where each answer comes from, in priority order: the admin's published settings (the CMS snapshot), then the launch
// answers file (src/config/launch-answers.ts), then the site's built-in defaults (which are placeholders).
const adminSettings = readJson("src/generated/cms-settings.json", {}).settings ?? {};
const fileSettings = answersToSettings();
const settings = merge(fileSettings, adminSettings);
const adminProjects = readJson("src/generated/cms-projects.json", {}).projects;
const projectsSnap = adminProjects?.length ? adminProjects : answersToProjects().length ? answersToProjects() : adminProjects ?? [];
const postCount = readJson("src/generated/cms-settings.json", {}).postCount ?? 0;
const get = (path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), settings);
const real = (v) => typeof v === "string" && v.trim() !== "" && !v.trim().startsWith("[");
const getFrom = (obj, path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
// The settings path(s) that hold each answer, to tell the admin's answers from the file's.
const PROVENANCE = {
  tradingName: ["identity.name"], phone: ["contact.phoneDisplay"], whatsapp: ["contact.whatsappDisplay"], email: ["contact.email"],
  address: ["contact.street"], hours: ["contact.hours"], serviceArea: ["contact.serviceArea"], mapUrl: ["contact.mapUrl"],
  videoId: ["videoId"], responseTime: ["wording.responseTime"], legalName: ["identity.legalName"], gstin: ["identity.gstin"],
  pan: ["identity.pan"], registrations: ["government.registrations"], departments: ["government.departments"],
  realEstate: ["realEstate.projects"], aboutStory: ["about.story"], aboutPeople: ["about.people"], numbers: ["numbers.items"],
  trust: ["trust.logos"], closingStatement: ["wording.closingStatement"], privacyApproved: ["privacy.approved"],
  retention: ["privacy.retention"], lastUpdated: ["privacy.updated"],
};
const sourceOf = (key) => {
  if (key === "projects") return hasContent(adminProjects) ? "admin" : answersToProjects().length ? "file" : null;
  if (key === "enquiryDelivery") return "env";
  if (key === "siteUrl") return env.NEXT_PUBLIC_SITE_URL && !/example\.com/.test(env.NEXT_PUBLIC_SITE_URL) ? "env" : launchAnswers.q1_siteUrl.trim() ? "file" : null;
  const q = questions.find((x) => x.key === key);
  if (q?.answerKey && /Approved$/.test(q.answerKey)) return getFrom(adminSettings, "wording.copyApproved") === true ? "admin" : launchAnswers[q.answerKey] === true ? "file" : null;
  const paths = PROVENANCE[key] ?? [];
  if (paths.some((pth) => hasContent(getFrom(adminSettings, pth)))) return "admin";
  if (paths.some((pth) => hasContent(getFrom(fileSettings, pth)))) return "file";
  return null;
};

// ── the build ─────────────────────────────────────────────────────────────────────────────────────────────────
const outDir = join(root, "out");
const hasOut = existsSync(join(outDir, "index.html"));
const pages = new Map(); // "about.html" → visible text
const rawHtml = new Map();
if (hasOut) {
  (function walk(dir, prefix = "") {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) {
        if (!["_next", "images"].includes(e.name) && !e.name.startsWith("__next")) walk(join(dir, e.name), `${prefix}${e.name}/`);
      } else if (e.name.endsWith(".html")) {
        const html = readFileSync(join(dir, e.name), "utf8");
        rawHtml.set(prefix + e.name, html);
        pages.set(
          prefix + e.name,
          html
            .replace(/<script[\s\S]*?<\/script>/g, " ")
            .replace(/<style[\s\S]*?<\/style>/g, " ")
            .replace(/<[^>]+>/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&#x27;|&#39;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/\s+/g, " "),
        );
      }
    }
  })(outDir);
}
const sha = (p) => {
  try {
    return createHash("sha256").update(readFileSync(join(root, p))).digest("hex");
  } catch {
    return "";
  }
};
// Hashes of the placeholder files that ship in the repo (the generic share card and the red "AG" mark).
const PLACEHOLDER_ASSETS = { "public/og.png": "ae869401d56a0fad6c90", "public/icon.svg": "77c20e3fad5df1548bb2", "public/apple-icon.png": "f81eea15291ed72d1bf6" };

// Visible placeholder text → the question it belongs to.
const PLACEHOLDER_MAP = [
  [/\+91 00000 00000/, "phone"],
  [/info@example\.com/, "email"],
  [/Office address line|\[City\]|\[State\]|\[000000\]/, "address"],
  [/\[Mon–Sat, 10:00–18:00\]/, "hours"],
  [/\[City \/ region\]/, "serviceArea"],
  [/Registered legal name/, "legalName"],
  [/GSTIN to be supplied/, "gstin"],
  [/PAN to be supplied/, "pan"],
  [/Contractor registration|\[Class\]|Department and registration/, "registrations"],
  [/Sample project|\[Location\]|\[Year\]|\[Scope item|One or two sentences|\[Private client\]|\[Government department\]|\[Housing society\]|\[Completed\]|\[Ongoing\]/, "projects"],
  [/How and when the company|What the company does today/, "aboutStory"],
  [/\[Name\]|\[Role/, "aboutPeople"],
  [/\[0+\]\+?/, "numbers"],
  [/Client logo|ISO or quality|Safety certificate/, "trust"],
  [/Current project name|Upcoming project name|\[Location · /, "realEstate"],
  [/Period to be decided/, "retention"],
  [/\[date\]/, "lastUpdated"],
  [/Your enquiry is stored|When an enquiry arrives|Until our database is switched on|Once our customer records/, "privacyApproved"],
];

const placeholdersByKey = new Map(); // key → Set of "page: text"
const unmapped = [];
for (const [file, text] of pages) {
  for (const m of text.matchAll(/\[[^\]\[]{2,}\]/g)) {
    const hit = PLACEHOLDER_MAP.find(([re]) => re.test(m[0]));
    const label = `${file.replace(/\.html$/, "")}: ${m[0].slice(0, 70)}`;
    if (hit) (placeholdersByKey.get(hit[1]) ?? placeholdersByKey.set(hit[1], new Set()).get(hit[1])).add(label);
    else unmapped.push(label);
  }
  if (/0000000000/.test(rawHtml.get(file))) (placeholdersByKey.get("phone") ?? placeholdersByKey.set("phone", new Set()).get("phone")).add(`${file.replace(/\.html$/, "")}: a phone/WhatsApp link to 0000000000`);
}
const stockPhotoPages = [...pages].filter(([, t]) => /Illustrative photo/.test(t)).length;

// ── per-question checks: [state, detail] ──────────────────────────────────────────────────────────────────────
// ok | missing (not answered) | confirm (cannot be checked from the build) | skipped (nice-to-have, hidden or default)
const ok = (detail = "") => ["ok", detail];
const missing = (detail) => ["missing", detail];
const confirm = (detail) => ["confirm", detail];
const skipped = (detail) => ["skipped", detail];
const have = (path, label) => (real(get(path)) ? ok() : missing(`${label} is not set`));
const all = (...pairs) => {
  const lacking = pairs.filter(([p]) => !real(get(p))).map(([, l]) => l);
  return lacking.length ? missing(`not set: ${lacking.join(", ")}`) : ok();
};
const approved = (key) => {
  const q = questions.find((x) => x.key === key);
  return getFrom(adminSettings, "wording.copyApproved") === true || launchAnswers[q.answerKey] === true
    ? ok()
    : missing(`approval not recorded (set ${q.answerKey} to true in src/config/launch-answers.ts, or Site settings → Wording)`);
};
const optional = (state) => (state[0] === "missing" ? skipped(state[1]) : state);
const endpoint = env.NEXT_PUBLIC_ENQUIRY_ENDPOINT || "";
const usesBackend = !!endpoint && !/web3forms\.com/.test(endpoint);

const checks = {
  siteUrl() {
    const url = (env.NEXT_PUBLIC_SITE_URL && !/example\.com/.test(env.NEXT_PUBLIC_SITE_URL) ? env.NEXT_PUBLIC_SITE_URL : "") || launchAnswers.q1_siteUrl.trim();
    if (!url) {
      const msg = "no real site address yet (q1_siteUrl in src/config/launch-answers.ts, or NEXT_PUBLIC_SITE_URL)";
      // Known pre-deploy item: fine on a local build until the real domain exists; on Netlify it must be set.
      return process.env.NETLIFY ? missing(msg) : confirm(`${msg}. Fine locally until the real domain exists; this check FAILS on Netlify without it`);
    }
    if (!/^https:\/\/[^/\s]+$/.test(url)) return missing(`"${url}" should look like https://www.example.in (https, no slash at the end)`);
    if (!hasOut) return confirm("no build found in out/ to check the links against; run npm run build first");
    const bad = [];
    const idx = rawHtml.get("index.html") ?? "";
    // Only the default site address counts: "name@example.com" is just the sample in the form's email hint.
    if (/(^|[^@\w.-])www\.example\.com/.test(idx.replace(/name@example\.com/g, ""))) bad.push("pages still use www.example.com (rebuild after setting it)");
    if (!idx.includes(`rel="canonical" href="${url}`) && !idx.includes(`rel="canonical" href="/`)) bad.push("canonical link does not use the address");
    const robots = existsSync(join(outDir, "robots.txt")) ? readFileSync(join(outDir, "robots.txt"), "utf8") : "";
    if (!robots.includes(`${url}/sitemap.xml`)) bad.push("robots.txt does not point to the sitemap at the address");
    const map = existsSync(join(outDir, "sitemap.xml")) ? readFileSync(join(outDir, "sitemap.xml"), "utf8") : "";
    if (!map.includes(`<loc>${url}`)) bad.push("sitemap.xml does not list the address");
    return bad.length ? missing(bad.join("; ")) : ok();
  },
  enquiryDelivery() {
    if (endpoint && !/^https:\/\//.test(endpoint)) return missing("NEXT_PUBLIC_ENQUIRY_ENDPOINT must start with https://");
    if (usesBackend) return ok("posts to the website back end");
    const key = env.NEXT_PUBLIC_WEB3FORMS_KEY || "";
    if (!key || /^your|^YOUR|…/.test(key) || key.length < 20) return missing("no real Web3Forms key (NEXT_PUBLIC_WEB3FORMS_KEY) and no back-end address (NEXT_PUBLIC_ENQUIRY_ENDPOINT)");
    return ok("posts to Web3Forms");
  },
  ownerEmail: () => (usesBackend ? confirm("cannot be checked from the build: OWNER_EMAIL and the Resend key live in the back end (DEPLOY.md C6)") : ok("not needed with Web3Forms")),
  tradingName: () => (real(get("identity.name")) ? ok() : confirm("keeps the default 'Ambika Group'; confirm the spelling")),
  phone: () =>
    real(get("contact.phoneDisplay")) && /^\+\d{10,14}$/.test(get("contact.phoneE164") ?? "") ? ok() : missing("phone (as shown and for dialling) is not set"),
  whatsapp: () =>
    real(get("contact.whatsappDisplay")) && /^\d{11,14}$/.test(get("contact.whatsappDigits") ?? "") ? ok() : missing("WhatsApp (as shown and the number) is not set"),
  email: () => have("contact.email", "email"),
  address: () => all(["contact.street", "address line"], ["contact.locality", "city"], ["contact.region", "state"], ["contact.postalCode", "PIN code"]),
  privacyApproved: () => (get("privacy.approved") === true ? ok() : missing("not marked approved (q10_privacyApproved in src/config/launch-answers.ts, or Site settings → Privacy policy)")),
  retention: () => have("privacy.retention", "the retention period"),
  lastUpdated: () => have("privacy.updated", "the 'Last updated' date"),
  contactCopy: () => approved("contactCopy"),
  servicesCopy: () => approved("servicesCopy"),
  governmentCopy: () => approved("governmentCopy"),
  homeCopy: () => approved("homeCopy"),
  consentCopy: () => approved("consentCopy"),

  backend: () => (env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && env.NEXT_PUBLIC_FIREBASE_API_KEY ? ok() : skipped("not set up: /admin stays a demo, enquiries go through Web3Forms")),
  hours: () => optional(have("contact.hours", "hours")),
  serviceArea: () => optional(have("contact.serviceArea", "service area")),
  mapUrl: () => optional(have("contact.mapUrl", "the Maps link")),
  legalName: () => optional(have("identity.legalName", "the legal name")),
  gstin: () => optional(have("identity.gstin", "GSTIN")),
  pan: () => optional(have("identity.pan", "PAN")),
  registrations: () => ((get("government.registrations") ?? []).some((r) => real(r.label) && real(r.value)) ? ok() : skipped("no registrations: the section is left out")),
  departments: () => ((get("government.departments") ?? []).some(real) ? ok() : skipped("only Nagar Nigam and PWD are listed")),
  closingStatement: () => optional(have("wording.closingStatement", "the closing statement")),
  responseTime: () => (real(get("wording.responseTime")) ? ok() : skipped("no promise is made")),
  videoId: () => (/^[\w-]{11}$/.test(get("videoId") ?? "") ? ok() : skipped("no video: the section is hidden")),
  projects: () => ((projectsSnap ?? []).length ? ok(`${projectsSnap.length} shown`) : skipped("no projects shown: Projects links and showcase are left out")),
  realEstate: () => ((get("realEstate.projects") ?? []).some((p) => real(p.title)) ? ok() : skipped("the list is left out")),
  aboutStory: () => ((get("about.story") ?? []).some(real) ? ok() : skipped("the section is left out")),
  aboutPeople: () => ((get("about.people") ?? []).some((p) => real(p.name) && real(p.role)) ? ok() : skipped("the section is left out")),
  numbers: () => (get("numbers.show") === true ? ok() : skipped("the section is hidden")),
  trust: () => (get("trust.show") === true ? ok() : skipped("the section is hidden")),
  photos: () => (!hasOut ? skipped("no build to check") : stockPhotoPages ? skipped(`${stockPhotoPages} page(s) still show labelled stock photos`) : ok()),
  logo: () => (["public/icon.svg", "public/apple-icon.png"].some((f) => sha(f).startsWith(PLACEHOLDER_ASSETS[f])) ? skipped("the red 'AG' mark is still used") : ok()),
  ogImage: () => (sha("public/og.png").startsWith(PLACEHOLDER_ASSETS["public/og.png"]) ? skipped("the generic share card is still used") : ok()),
  blog: () => (postCount > 0 ? ok(`${postCount} published`) : skipped("no articles: there is no Blog link")),
  hindi: () => skipped("English only (Hindi pages are not built)"),
};

// ── run ───────────────────────────────────────────────────────────────────────────────────────────────────────
const results = questions.map((q, i) => {
  const [state, detail] = checks[q.key] ? checks[q.key]() : confirm("no automatic check");
  const seen = [...(placeholdersByKey.get(q.key) ?? [])];
  const source = state === "ok" ? sourceOf(q.key) : null;
  return { n: i + 1, ...q, state: seen.length ? "visible" : state, detail: seen.length ? "placeholder text is visible in the build" : state === "ok" && source ? `answered (from ${source === "file" ? "src/config/launch-answers.ts" : source === "admin" ? "the admin" : "the environment"})` : detail, seen, source };
});

const fromFile = results.filter((r) => r.state === "ok" && r.source === "file").length;
const fromAdmin = results.filter((r) => r.state === "ok" && r.source === "admin").length;
const fromEnv = results.filter((r) => r.state === "ok" && r.source === "env").length;
const answersLine = `Answers: ${fromFile} from src/config/launch-answers.ts, ${fromAdmin} from the admin, ${fromEnv} from the environment.`;
const mustMissing = results.filter((r) => r.tier === "must" && r.state === "missing");
const visible = results.filter((r) => r.state === "visible");
const toConfirm = results.filter((r) => r.state === "confirm");
const niceOpen = results.filter((r) => r.tier === "nice" && r.state === "skipped");
const failing = [...new Set([...mustMissing, ...visible])].sort((a, b) => a.n - b.n);
const fail = failing.length > 0 || unmapped.length > 0 || !hasOut;

const line = (r) => `  Q${r.n}  [${r.page.split(" (")[0]}] ${r.question.split("? ")[0].replace(/\?$/, "")}?\n        ${r.detail}\n        Answer in: ${r.answerKey ? `src/config/launch-answers.ts → ${r.answerKey}  (or ${r.where})` : r.where}`;
const out = [];
if (soft) {
  out.push(
    `launch-check: ${failing.length + unmapped.length} item(s) to fix before launch, ${toConfirm.length} to confirm, ${niceOpen.length} optional left unanswered` +
      (failing.length ? ` (Q${failing.map((r) => r.n).join(", Q")})` : "") +
      `. ${answersLine} Details: npm run launch-check. ${strictEnv ? "LAUNCH_STRICT=1: this build " + (fail ? "FAILS." : "passes.") : "Not blocking (set LAUNCH_STRICT=1 to make it block)."}`,
  );
} else {
  out.push(`Launch check (${hasOut ? "production build in out/" : "NO BUILD FOUND: run npm run build first"})`, "");
  out.push(answersLine, "");
  out.push(`${results.length} questions: ${results.filter((r) => r.tier === "must").length} must-have, ${results.filter((r) => r.tier === "nice").length} nice-to-have. Full list: LAUNCH-QUESTIONS.md`, "");
  if (failing.length || unmapped.length) {
    out.push("MUST FIX BEFORE LAUNCH");
    for (const r of failing) {
      out.push(line(r));
      for (const s of r.seen.slice(0, 4)) out.push(`        seen: ${s}`);
    }
    if (unmapped.length) {
      out.push("", "  Placeholder text in the build that no question covers (report it to the developer):");
      for (const u of [...new Set(unmapped)].slice(0, 12)) out.push(`        ${u}`);
    }
    out.push("");
  }
  if (toConfirm.length) {
    out.push("CONFIRM BY HAND (cannot be checked from the build)");
    for (const r of toConfirm) out.push(line(r));
    out.push("");
  }
  if (niceOpen.length) {
    out.push("NOT ANSWERED, SAFE TO SKIP (hidden or default on the live site)");
    for (const r of niceOpen) out.push(`  Q${r.n}  ${r.page.split(" (")[0]}: ${r.question.split("? ")[0].replace(/\?$/, "")}?  →  ${r.detail}`);
    out.push("");
  }
  out.push(fail ? `RESULT: NOT READY. ${failing.length + unmapped.length} item(s) to fix.` : "RESULT: READY. Every must-have is answered and no placeholder is visible.");
}
console.log(out.join("\n"));
process.exit(soft ? (strictEnv && fail ? 1 : 0) : fail ? 1 : 0);
