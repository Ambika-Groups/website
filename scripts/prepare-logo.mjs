// Logo support, with no code change. Drop `logo.svg` (best) or `logo.png` into photos/ and build: the header, the footer
// and the browser tab use it instead of the red "AG" mark. Optionally add `logo-dark.svg` / `logo-dark.png` for a
// version that reads on dark backgrounds (the site's dark theme, the footer and the photo hero); without it the one
// logo is used everywhere. Runs before the photo pipeline (package.json "prebuild").
//
// Writes public/brand/ (git-ignored, content-hashed names) and src/generated/logo.json, which the brand mark and the
// page icons read. With no logo file, logo.json says { "present": false } and nothing else changes.
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("..", import.meta.url));
const PHOTOS = join(root, "photos");
const BRAND = join(root, "public", "brand");
const MANIFEST = join(root, "src", "generated", "logo.json");

const find = (base) => ["svg", "png", "webp"].map((ext) => join(PHOTOS, `${base}.${ext}`)).find(existsSync);

async function prepare(file, tag) {
  const input = await readFile(file);
  const hash = createHash("sha256").update(input).digest("hex").slice(0, 10);
  const svg = file.endsWith(".svg");
  const meta = await sharp(input, { density: 144 }).metadata();
  const name = `${tag}-${hash}.${svg ? "svg" : "png"}`;
  if (svg) await copyFile(file, join(BRAND, name));
  else await sharp(input).resize({ width: 640, withoutEnlargement: true }).png({ compressionLevel: 9 }).toFile(join(BRAND, name));
  const out = svg || !meta.width ? meta : await sharp(join(BRAND, name)).metadata();
  return { input, hash, src: `/brand/${name}`, width: out.width ?? 120, height: out.height ?? 120 };
}

await mkdir(join(root, "src", "generated"), { recursive: true });
await rm(BRAND, { recursive: true, force: true });

const lightFile = find("logo");
if (!lightFile) {
  await writeFile(MANIFEST, JSON.stringify({ present: false }, null, 2) + "\n");
  console.log("prepare-logo: no photos/logo.svg or logo.png; the red AG mark stays");
} else {
  await mkdir(BRAND, { recursive: true });
  const light = await prepare(lightFile, "logo");
  const darkFile = find("logo-dark");
  const dark = darkFile ? await prepare(darkFile, "logo-dark") : null;

  // Browser-tab and home-screen icons from the main logo: transparent 512 px square, and a 180 px square on white.
  const base = sharp(light.input, { density: 300 });
  const icon = `icon-${light.hash}.png`;
  const apple = `apple-${light.hash}.png`;
  await base.clone().resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png({ compressionLevel: 9 }).toFile(join(BRAND, icon));
  await base
    .clone()
    .resize(140, 140, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .extend({ top: 20, bottom: 20, left: 20, right: 20, background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .flatten({ background: "#ffffff" })
    .png({ compressionLevel: 9 })
    .toFile(join(BRAND, apple));

  await writeFile(
    MANIFEST,
    JSON.stringify(
      {
        present: true,
        light: { src: light.src, width: light.width, height: light.height },
        dark: dark ? { src: dark.src, width: dark.width, height: dark.height } : null,
        icon: `/brand/${icon}`,
        apple: `/brand/${apple}`,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`prepare-logo: ${lightFile.split(/[\\/]/).pop()}${darkFile ? ` and ${darkFile.split(/[\\/]/).pop()}` : ""} used for the header, footer and browser tab`);
}
