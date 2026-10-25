// Works around a Next 16.4 static-export mismatch: the exporter writes per-segment prefetch
// files nested (out/contact/__next.!KGVuKQ/contact/__PAGE__.txt), while the client requests
// them flattened with dots (out/contact/__next.!KGVuKQ.contact.__PAGE__.txt), so every
// prefetch 404s and links fall back to full page loads. This copies each nested file to the
// flat name. Remove once `next build` writes the flat names itself.
import { copyFile, readdir, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("../out/", import.meta.url));

async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

let copied = 0;
for (const file of await walk(OUT)) {
  if (!file.endsWith(".txt")) continue;
  const parts = relative(OUT, file).split(sep);
  const idx = parts.findIndex((p) => p.startsWith("__next."));
  // Only nested files: some directory named __next.* sits above the file.
  if (idx === -1 || idx === parts.length - 1) continue;
  const flat = parts.slice(idx).join(".");
  const target = join(OUT, ...parts.slice(0, idx), flat);
  try {
    await stat(target);
  } catch {
    await copyFile(file, target);
    copied++;
  }
}
console.log(`flatten-segment-prefetch: ${copied} file(s) copied`);
