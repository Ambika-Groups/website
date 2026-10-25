// One-off generator for public/apple-icon.png (180×180) and public/og.png (1200×630, the image
// shown when a page is shared on WhatsApp, Facebook, LinkedIn…). Run `node scripts/make-brand-assets.mjs`
// again after changing the mark or the wording. TODO(content): redo both with the real logo.
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const pub = (file) => fileURLToPath(new URL(`../public/${file}`, import.meta.url));
const font = "Arial, Helvetica, sans-serif";

const apple = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">
  <rect width="180" height="180" fill="#c62828"/>
  <text x="90" y="116" text-anchor="middle" font-family="${font}" font-size="76" font-weight="600" letter-spacing="3" fill="#fff">AG</text>
</svg>`;

// White card, red mark, left-aligned type, a thin red bar: the site's own look, no gradient.
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#ffffff"/>
  <rect x="0" y="0" width="1200" height="630" fill="none" stroke="#e0e0e0" stroke-width="2"/>
  <rect x="96" y="112" width="120" height="120" fill="#c62828"/>
  <text x="156" y="194" text-anchor="middle" font-family="${font}" font-size="52" font-weight="600" letter-spacing="2" fill="#fff">AG</text>
  <text x="248" y="196" font-family="${font}" font-size="64" font-weight="600" fill="#1f1f1f">Ambika Group</text>
  <rect x="96" y="304" width="64" height="5" fill="#c62828"/>
  <text x="96" y="380" font-family="${font}" font-size="44" fill="#1f1f1f">Construction · Road works</text>
  <text x="96" y="440" font-family="${font}" font-size="44" fill="#1f1f1f">Interlocking · Real estate</text>
  <text x="96" y="530" font-family="${font}" font-size="30" fill="#5f5f5f">For private clients and government departments</text>
</svg>`;

await sharp(Buffer.from(apple)).png().toFile(pub("apple-icon.png"));
await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toFile(pub("og.png"));
console.log("make-brand-assets: wrote public/apple-icon.png and public/og.png");
