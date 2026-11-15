// Build-time snapshot of what the admin publishes (M8/M9): published blog posts, projects switched on for the
// website, and the public site settings. Runs before every build (package.json "prebuild", before the photo
// pipeline). Reads Firestore's REST API with the public web settings only: the security rules allow exactly these
// reads, so no secret is needed on Netlify.
//
// Never breaks the build: with no Firebase project configured (demo mode) it leaves the snapshot as it is (the
// site then uses its content files); if Firebase can't be reached it keeps the last snapshot and says so.
//
// Writes src/generated/cms-settings.json (small; read by config/site.ts and flags.ts, so it reaches the browser),
// cms-projects.json (read with the project content) and cms-posts.json (blog pages only, never a browser bundle). Photos are downloaded into photos/
// as blog-<slug>.<ext> and project-<slug>-<n>.<ext>, so scripts/optimize-images.mjs gives them srcsets.
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const GEN = join(root, "src", "generated");
const PHOTOS = join(root, "photos");
const SETTINGS_FILE = join(GEN, "cms-settings.json");
const PROJECTS_FILE = join(GEN, "cms-projects.json");
const POSTS_FILE = join(GEN, "cms-posts.json");
const MANAGED = /^(blog-[a-z0-9-]+|project-[a-z0-9-]+-\d+)\.cms\.(jpg|png|webp)$/; // photos this script owns

// .env.local is read by Next, not by this script; load it here too so local builds behave like Netlify.
async function loadEnvLocal() {
  try {
    for (const line of (await readFile(join(root, ".env.local"), "utf8")).split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
}

/** Firestore REST value → plain JSON. */
function decode(v) {
  if (!v || typeof v !== "object") return null;
  if ("stringValue" in v) return v.stringValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("nullValue" in v) return null;
  if ("arrayValue" in v) return (v.arrayValue.values ?? []).map(decode);
  if ("mapValue" in v) return decodeFields(v.mapValue.fields ?? {});
  return null;
}
const decodeFields = (fields) => Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, decode(v)]));

async function writeJson(file, data) {
  await writeFile(file, JSON.stringify(data, null, 2) + "\n");
}

async function main() {
  await loadEnvLocal();
  await mkdir(GEN, { recursive: true });
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  // Make sure both files exist, so imports always resolve (first run, or a fresh clone in demo mode).
  for (const [file, empty] of [
    [SETTINGS_FILE, { source: "none", fetchedAt: null, settings: null, postCount: 0 }],
    [PROJECTS_FILE, { source: "none", fetchedAt: null, projects: null }],
    [POSTS_FILE, { source: "none", fetchedAt: null, posts: [] }],
  ]) {
    try {
      JSON.parse(await readFile(file, "utf8"));
    } catch {
      await writeJson(file, empty);
    }
  }
  if (!projectId || !apiKey) {
    console.log("fetch-cms: no Firebase project configured (demo mode); using the content files and the saved snapshot");
    return;
  }

  const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
  const get = async (url, init) => {
    const res = await fetch(`${url}${url.includes("?") ? "&" : "?"}key=${apiKey}`, { ...init, signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url.replace(base, "")}`);
    return res.json();
  };
  const query = async (collectionId, field, value) => {
    const rows = await get(`${base}:runQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ structuredQuery: { from: [{ collectionId }], where: { fieldFilter: { field: { fieldPath: field }, op: "EQUAL", value } } } }),
    });
    return rows.filter((r) => r.document).map((r) => ({ id: r.document.name.split("/").pop(), ...decodeFields(r.document.fields ?? {}) }));
  };

  try {
    const [settingsDoc, posts, projects] = await Promise.all([
      get(`${base}/settings/site`).then((d) => decodeFields(d.fields ?? {})).catch((e) => (String(e.message).startsWith("404") ? null : Promise.reject(e))),
      query("posts", "status", { stringValue: "published" }),
      query("projects", "showOnWebsite", { booleanValue: true }),
    ]);

    // Photos: download each into photos/ under the name the site already looks for; remove ones no longer used.
    const wanted = new Map();
    for (const p of posts) if (p.cover?.url && p.slug) wanted.set(`blog-${p.slug}`, p.cover.url);
    for (const p of projects) (p.photos ?? []).forEach((ph, i) => ph?.url && p.slug && wanted.set(`project-${p.slug}-${i + 1}`, ph.url));
    await mkdir(PHOTOS, { recursive: true });
    const existing = (await readdir(PHOTOS)).filter((f) => MANAGED.test(f));
    for (const f of existing) if (!wanted.has(f.replace(/\.cms\.\w+$/, ""))) await rm(join(PHOTOS, f));
    for (const [name, url] of wanted) {
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`photo ${name}: ${res.status}`);
      const type = res.headers.get("content-type") ?? "";
      const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
      for (const f of existing.filter((f) => f.startsWith(`${name}.cms.`))) await rm(join(PHOTOS, f), { force: true });
      await writeFile(join(PHOTOS, `${name}.cms.${ext}`), Buffer.from(await res.arrayBuffer()));
    }

    const fetchedAt = new Date().toISOString();
    // postCount lets the nav show "Blog" only once there is something to read, without bundling the posts.
    await writeJson(SETTINGS_FILE, { source: "firebase", fetchedAt, settings: settingsDoc, postCount: posts.length });
    await writeJson(POSTS_FILE, { source: "firebase", fetchedAt, posts: posts.map(({ cover, ...p }) => ({ ...p, cover: cover ? { alt: cover.alt ?? "" } : null })) });
    await writeJson(PROJECTS_FILE, { source: "firebase", fetchedAt, projects: projects.map(({ photos, ...p }) => ({ ...p, photoAlts: (photos ?? []).map((ph) => ph?.alt ?? "") })) });
    console.log(`fetch-cms: ${posts.length} post(s), ${projects.length} project(s), settings ${settingsDoc ? "found" : "not set"}, ${wanted.size} photo(s)`);
  } catch (err) {
    // Keep building from the last snapshot. Netlify shows this line in the deploy log.
    console.warn(`fetch-cms: could not read Firebase (${err.message}); building from the last saved snapshot`);
  }
}

await main();
