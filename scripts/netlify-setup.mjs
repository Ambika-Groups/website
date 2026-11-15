// One command to get the site onto Netlify without the web dashboard.
//
//   npm run netlify:setup               check the Netlify login, link (or create) the site for the GitHub repo, push the
//                                       settings from .env.local to Netlify
//   npm run netlify:setup -- --dry-run  only report what it would do; changes nothing
//   options: --repo owner/name (default Ambika-Groups/website)   --site <id-or-name> (skip the repo lookup)
//
// What it pushes (only real values, never placeholders): NEXT_PUBLIC_WEB3FORMS_KEY, NEXT_PUBLIC_SITE_URL,
// NEXT_PUBLIC_ENQUIRY_ENDPOINT. It never prints a value: only names, lengths and what it did. Values go to Netlify in a
// temporary file (not on the command line, which other programs on the machine could read), deleted straight after,
// and anything the Netlify CLI prints is scrubbed of every value before it is shown.
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

process.noDeprecation = true; // the Windows shell warning for npx is expected and harmless
const root = fileURLToPath(new URL("..", import.meta.url));
const args = process.argv.slice(2);
const dry = args.includes("--dry-run");
const opt = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const repo = opt("--repo", "Ambika-Groups/website");
const siteArg = opt("--site", "");
const CLI = ["--yes", "netlify-cli@27.14.2"]; // the same pinned version as `npm run preview:netlify`

// ── the values to push (read, never printed) ─────────────────────────────────────────────────────────────────────
function readEnv(name) {
  const out = {};
  try {
    for (const line of readFileSync(join(root, name), "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
  return out;
}
const env = { ...readEnv(".env"), ...readEnv(".env.local") };
const candidates = [
  { name: "NEXT_PUBLIC_WEB3FORMS_KEY", real: (v) => v.length >= 20 && !/^your|…/i.test(v), why: "the enquiry form cannot deliver without it" },
  { name: "NEXT_PUBLIC_SITE_URL", real: (v) => /^https:\/\/[^/\s]+$/.test(v) && !/example\.com/.test(v), why: "known pending item until the real domain is connected (LAUNCH-QUESTIONS.md, Q1)" },
  { name: "NEXT_PUBLIC_ENQUIRY_ENDPOINT", real: (v) => /^https:\/\//.test(v), why: "optional: only once the website's own back end exists" },
];
const toPush = candidates.filter((c) => c.real(env[c.name] ?? "")).map((c) => ({ ...c, value: env[c.name] }));
const secrets = toPush.map((c) => c.value).filter((v) => v.length >= 6);
const redact = (text) => secrets.reduce((t, v) => t.split(v).join("***"), String(text ?? ""));

// ── running the Netlify CLI ──────────────────────────────────────────────────────────────────────────────────────
function cli(cliArgs, { inherit = false } = {}) {
  const r = spawnSync("npx", [...CLI, ...cliArgs], { cwd: root, encoding: "utf8", shell: process.platform === "win32", stdio: inherit ? "inherit" : "pipe", timeout: inherit ? undefined : 120000 });
  return { ok: r.status === 0, out: redact(r.stdout), err: redact(r.stderr) };
}
// The CLI may print notices around its JSON, so parse from the first bracket to the last.
const json = (text) => {
  const i = text.search(/[[{]/);
  if (i < 0) return null;
  try {
    return JSON.parse(text.slice(i, Math.max(text.lastIndexOf("}"), text.lastIndexOf("]")) + 1));
  } catch {
    return null;
  }
};
const step = (n, text) => console.log(`\n${n}. ${text}`);
const say = (text) => console.log(`   ${text}`);

console.log(`Netlify setup${dry ? " (dry run: nothing will be changed)" : ""} for the GitHub repo ${repo}`);

// 1. login
step(1, "Netlify login");
const st = cli(["status", "--json"]);
const status = json(st.out);
let loggedIn = !!(st.ok && status && (status.account || status.siteData || status.user));
if (loggedIn) {
  say(`logged in as ${status.account?.email ?? status.account?.name ?? "an account"}`);
} else if (dry) {
  say("NOT logged in. A real run opens the browser to log in (npx netlify-cli login).");
} else {
  say("not logged in: opening the browser to log in…");
  cli(["login"], { inherit: true });
  const again = cli(["status", "--json"]);
  loggedIn = again.ok && !!json(again.out)?.account;
  say(loggedIn ? "logged in" : "still not logged in; stopping.");
  if (!loggedIn) process.exit(1);
}

// 2. the site
step(2, `Site for ${repo}`);
let siteId = status?.siteData?.["site-id"] ?? status?.siteData?.id ?? "";
if (siteId) {
  say(`already linked to "${status.siteData["site-name"] ?? status.siteData.name ?? siteId}" (${status.siteData["site-url"] ?? ""})`.trim());
} else if (!loggedIn) {
  say("cannot look for the site until logged in.");
} else {
  let found = null;
  if (siteArg) {
    found = { id: siteArg, name: siteArg };
  } else {
    const list = json(cli(["sites:list", "--json"]).out);
    found = Array.isArray(list) ? list.find((s) => (s.build_settings?.repo_url ?? s.repo_url ?? "").toLowerCase().includes(repo.toLowerCase())) : null;
  }
  if (found) {
    say(`found the Netlify site "${found.name}" for this repo`);
    if (dry) say("a real run links this folder to it (netlify link).");
    else {
      const linked = cli(["link", "--id", found.id]);
      say(linked.ok ? "linked" : `link failed: ${linked.err.split("\n")[0]}`);
      siteId = found.id;
    }
  } else if (dry) {
    say("no Netlify site is connected to this repo yet. A real run starts Netlify's own setup (netlify init):");
    say("it creates the site, asks you to authorise GitHub once, and sets the build command and folder from netlify.toml.");
  } else {
    say("no Netlify site is connected to this repo yet: starting Netlify's own setup (create a new site, authorise GitHub once)…");
    const init = cli(["init"], { inherit: true });
    if (!init.ok) {
      say("setup did not finish; stopping.");
      process.exit(1);
    }
  }
}

// 3. settings
step(3, "Settings (from .env.local, values are never shown)");
for (const c of candidates) {
  const hit = toPush.find((p) => p.name === c.name);
  say(`${c.name}: ${hit ? `real value found (${hit.value.length} characters) → ${dry ? "would be pushed" : "pushing"}` : `not pushed (${env[c.name] ? "still a placeholder" : "empty"}): ${c.why}`}`);
}
if (!toPush.length) say("nothing to push.");
else if (!dry) {
  const dir = mkdtempSync(join(tmpdir(), "netlify-env-"));
  const file = join(dir, "values.env");
  try {
    writeFileSync(file, toPush.map((c) => `${c.name}=${c.value}`).join("\n") + "\n", { mode: 0o600 });
    const r = cli(["env:import", file]); // merges with what Netlify already has; nothing is replaced or removed
    say(r.ok ? `pushed ${toPush.length} setting(s): ${toPush.map((c) => c.name).join(", ")}` : `push failed: ${r.err.split("\n")[0] || r.out.split("\n")[0]}`);
    if (!r.ok) process.exitCode = 1;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

step(4, "What happens next");
say("production builds (the main branch) run in strict mode (netlify.toml): they FAIL until the launch check is READY,");
say("so an unfinished site cannot be published. The site address (Q1) is the pending item.");
say("To see the site on a .netlify.app address in the meantime: npm run deploy:preview (or push any other branch).");
say("After a deploy: npm run verify:live -- https://<your-site>.netlify.app");
if (dry) console.log("\nDry run finished: nothing was changed.");
