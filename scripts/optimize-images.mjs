// Build-time photo pipeline. Drop original photos (any size, straight from a camera or phone)
// into Website/photos/ and run `npm run images` (also runs before every dev/build).
//
// For each photo it writes AVIF + WebP at several widths to public/images/, named with a hash of
// the original so browsers can cache them for a long time, and records the sizes in
// src/generated/images.json, which <Photo> reads to build srcset/sizes and width/height.
// Orientation from the camera is applied, and all metadata (including GPS location) is removed.
//
// File names decide where a photo appears; see CONTENT-CHECKLIST.md, e.g. hero.jpg,
// service-road-works.jpg, service-road-works-1.jpg, project-sample-house-1.jpg.
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("..", import.meta.url));
const SRC = join(root, "photos");
const OUT = join(root, "public", "images");
const MANIFEST = join(root, "src", "generated", "images.json");

const WIDTHS = [480, 800, 1200, 1600, 2000];
const INPUT_TYPES = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"]);
const NAME_RULE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

async function listPhotos() {
  try {
    return (await readdir(SRC)).filter((f) => INPUT_TYPES.has(extname(f).toLowerCase())).sort();
  } catch {
    return []; // No photos/ folder yet: every slot shows its placeholder.
  }
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

await mkdir(OUT, { recursive: true });
await mkdir(join(root, "src", "generated"), { recursive: true });

const manifest = {};
const keep = new Set();
const problems = [];
let written = 0;

for (const file of await listPhotos()) {
  // "<name>.cms.jpg" files are downloaded by scripts/fetch-cms.mjs (admin uploads); they fill the same slots.
  const name = file.slice(0, -extname(file).length).toLowerCase().replace(/\.cms$/, "");
  if (name === "logo" || name === "logo-dark") continue; // logos are handled by scripts/prepare-logo.mjs
  if (!NAME_RULE.test(name)) {
    problems.push(`${file}: use lowercase letters, digits and hyphens only (e.g. service-road-works-1.jpg)`);
    continue;
  }
  const input = await readFile(join(SRC, file));
  const hash = createHash("sha256").update(input).digest("hex").slice(0, 10);
  // rotate() with no argument applies the camera's EXIF orientation.
  const { width, height } = await sharp(input).rotate().toBuffer({ resolveWithObject: true }).then((r) => r.info);
  const widths = WIDTHS.filter((w) => w < width);
  widths.push(Math.min(width, WIDTHS.at(-1)));
  const unique = [...new Set(widths)].sort((a, b) => a - b);

  for (const w of unique) {
    for (const format of ["avif", "webp"]) {
      const outName = `${name}-${hash}-${w}.${format}`;
      keep.add(outName);
      const outPath = join(OUT, outName);
      if (await exists(outPath)) continue;
      const pipeline = sharp(input).rotate().resize({ width: w, withoutEnlargement: true });
      await (format === "avif" ? pipeline.avif({ quality: 50, effort: 4 }) : pipeline.webp({ quality: 72 })).toFile(outPath);
      written++;
    }
  }
  manifest[name] = { width, height, hash, widths: unique };
}

// Remove outputs for photos that were deleted or replaced.
let removed = 0;
for (const f of await readdir(OUT)) {
  if (!keep.has(f)) {
    await rm(join(OUT, f));
    removed++;
  }
}

await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  `optimize-images: ${Object.keys(manifest).length} photo(s), ${written} file(s) written, ${removed} removed`,
);
for (const p of problems) console.warn(`optimize-images: skipped ${p}`);
