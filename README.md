# Ambika Group website

Next.js (App Router, TypeScript, Tailwind v4) exported as static files to `out/`, hosted on Netlify as a plain static site. This folder is the root of its own repository.

- **Run it on your computer:** "Run it locally" below.
- **Put it online:** [DEPLOY.md](DEPLOY.md), step by step.

## Commands
- `npm run dev`: local dev server
- `npm run build`: static export to `out/`. `prebuild` turns `photos/` into web images; `postbuild` patches prefetch file names (`scripts/flatten-segment-prefetch.mjs`) and writes `out/_redirects` for Netlify (`scripts/netlify-redirects.mjs`).
- `npm run images`: only the photo step (see "Photos")
- `npm start`: serve `out/` locally (plain static server, port 3000)
- `npm run preview:netlify`: build, then serve as Netlify would (redirects, headers, 404), port 8888
- `npm test`: unit tests (phone rule, enquiry payload and contract v2 rules, UTM capture)
- `npm run lint` / `npm run typecheck`

## Hosting: Netlify
The hosting setup is `netlify.toml` (build settings) plus two files that end up inside `out/`, so they also work when `out/` is dragged into Netlify Drop:
- **Build:** `npm run build`, publish `out`, Node pinned (`NODE_VERSION`, same as development).
- **Plain static site:** `NETLIFY_NEXT_PLUGIN_SKIP=true` turns off the Next.js adapter that Netlify auto-installs for Next projects, so no functions run and nothing else rewrites routing or headers. (Checked in `@netlify/plugin-nextjs` 5.16.4: the variable makes every build hook a no-op.)
- **Clean URLs:** Netlify serves `/contact` from `contact.html`. `/contact.html` and `/index.html` 301 to the clean URL through the generated `out/_redirects`. `/contact/` is served as-is (Netlify treats the trailing-slash form as the same path); every page's canonical link points at the clean URL.
- **404:** `out/404.html`, served with status 404.
- **Headers (`public/_headers`, copied to `out/_headers`; the only place headers are set):** `nosniff`, `Referrer-Policy`, `X-Frame-Options: DENY` plus CSP `frame-ancestors 'none'`, a restrictive `Permissions-Policy`, one-year immutable caching for `/_next/static/*` and `/images/*` (hashed names), one week for the icons and share image.

Local check, no account needed: `npm run preview:netlify` (builds, then serves on port 8888 with the redirects and headers). Note: the CLI's local server always sends `cache-control: max-age=0`, so cache rules only show on the real site.

Connecting the site is done by the account owner: see [DEPLOY.md](DEPLOY.md).

### Free plan: what it allows (checked 25 Oct 2026, netlify.com/pricing and docs "How credits work")
- **300 credits a month, hard cap**, shared by every site in the Netlify team. When they run out, **every site in the team is paused** ("Site not available") until the monthly reset. There is no paid overage on Free.
- **Costs:** production deploy **15 credits**; bandwidth **20 credits per GB**; web requests **2 credits per 10,000**; deploy previews and branch deploys **free**; build minutes are not charged separately (they're covered by the deploy cost).
- The website gets its own free team, separate from the CRM, so website traffic can never pause the CRM.

**Estimate for this site** (measured page weights, milestone 3; photos at the srcset sizes a phone downloads):
- A visit of about 3 pages transfers about **0.6 MB** (first page about 400 KB including scripts, font and photos; later pages reuse the cached scripts) and makes about **25 requests**.
- Per 1,000 visits: 0.6 GB × 20 = 12 credits, plus 25,000 requests × 2/10,000 = 5 credits, so **about 17 credits per 1,000 visits**.
- With **4 production releases a month** (60 credits), 240 credits remain: **about 14,000 visits a month** before the cap. With 10 releases (150 credits): about 8,800 visits.
- Search-engine and other bots count as traffic too, so keep a margin. If traffic approaches about 10,000 visits a month, plan for the Personal plan.

**Working rule:** use deploy previews (free) for review, and make a production deploy only for a real release.

## Next.js version pin
`next` and `eslint-config-next` are pinned to exactly 16.4.3. Three things depend on that version:
- `scripts/flatten-segment-prefetch.mjs` works around 16.4.3 writing prefetch files under names the client does not request.
- `experimental.globalNotFound` provides the 404 page for the per-locale root layouts.
- `experimental.inlineCss` inlines the stylesheet into each page (saves a render-blocking request on mobile).

After any Next upgrade:
1. Build, serve `out/`, open the browser network tab and click between pages. No `__next.*.txt` request may 404.
2. If Next now writes the flat names itself (the script reports `0 file(s) copied`), delete the script and the `postbuild` entry.
3. Confirm `globalNotFound` and `inlineCss` still work, or whether they have become stable.

## Where things live
- `src/config/site.ts`: every company contact detail (one-file swap for placeholders)
- `src/config/forms.ts`: `form_id` list, `work_type` enum, field limits, enquiry endpoint
- `src/content/en/*`: all copy. Components contain no hard-coded strings.
- `src/lib/`: the enquiry contract (`enquiry.ts`, `phone.ts`, `utm.ts`), implementing the enquiry form contract v2.1 (see "Shared rules")
- `src/app/(en)/`: English pages at bare URLs. `src/app/(hi)/hi/`: Hindi root layout, no pages yet.
- `src/app/metadata.ts`: shared SEO metadata; every page uses `pageMetadata()` so share images aren't lost.
- `src/app/(admin)/admin/` + `src/admin/`: the website admin at `/admin` (M7c–M9): enquiries inbox, analytics, blog, projects, site settings, "Publish site". One static page; it runs in the browser against the website's own Firebase project, or in **demo mode** (sample data in IndexedDB, labelled) when no project is configured. Never indexed (noindex, `X-Robots-Tag`, not in the sitemap).
- `functions/`: the website back end (contract v3): `submitEnquiry` (stores, emails the owner, forwards to the CRM later) and `publishSite` (Netlify build hook). `npm test` there runs the validation tests with no emulator.
- `firestore.rules`, `storage.rules`: who can read and change what. Admin = a document at `admins/{uid}`.
- `scripts/fetch-cms.mjs` (runs before every build): snapshots published posts, shown projects and site settings into `src/generated/cms-*.json` and their photos into `photos/`. If Firebase can't be reached it keeps the last snapshot, so a build never breaks. Content files in `src/content/` stay the fallback.
- `src/app/(en)/blog/`: the blog, static at build (list, topics, posts with BlogPosting JSON-LD).

Search for `TODO(content)` to find every placeholder. `CONTENT-CHECKLIST.md` lists what the client must supply.

## Shared rules (docs/shared/)
Three documents this code follows are kept by the project supervisor. Copies are in [docs/shared/](docs/shared/); don't edit them here (see [docs/shared/README.md](docs/shared/README.md)).
- [enquiry-form-contract.md](docs/shared/enquiry-form-contract.md) (version 2.1): the fields, the phone rule, the endpoint switch. The CRM implements the same contract, so a change there is a change on both sides; `src/lib/phone.test.ts` holds its phone table.
- [brand.md](docs/shared/brand.md) (version 4.1): palette, type, shape and motion rules. The tokens are in `src/app/globals.css`.
- [website-design-brief.md](docs/shared/website-design-brief.md) (25 Oct 2026): the premium editorial direction, with the supervisor's notes.

## Run it locally
You need **Node.js 24.11.1** (the version in `.nvmrc`; Netlify builds with the same one) and npm, which comes with it. Check with `node -v`.

1. Open a terminal in this folder.
2. `npm ci`: installs the exact versions from `package-lock.json` (a few minutes the first time).
3. Copy `.env.example` to `.env.local` and fill it in (see "Environment" below). Without a Web3Forms key the site runs normally, but sending the enquiry form fails.
4. `npm run dev`, then open http://localhost:3000. Pages reload as you edit. In development the figures and "Trusted by" sections are shown (with placeholder data) so they can be designed; production builds hide them.
5. To see exactly what will go online: `npm run build` (writes `out/`), then `npm start` (http://localhost:3000) or `npm run preview:netlify` (http://localhost:8888, with Netlify's redirects and headers).

Before handing over a change: `npm run typecheck`, `npm run lint`, `npm test` and `npm run build` should all finish without errors.

If a port is already in use, stop the other server, or run `npx serve@14.2.4 out -l 3001`.

## Environment
Copy `.env.example` to `.env.local`:
- `NEXT_PUBLIC_ENQUIRY_ENDPOINT`: empty for Web3Forms (fallback); the website's own `/.netlify/functions/submit-enquiry` address once its back end exists (contract v3; DEPLOY.md section C). When it changes, also update the "Who handles it" section of the Privacy page (TODO in `src/content/en/privacy.ts`).
- `NEXT_PUBLIC_WEB3FORMS_KEY`: stage 1 only.
- `NEXT_PUBLIC_SITE_URL`: the production domain (canonical links, sitemap, share previews).
- `NEXT_PUBLIC_FIREBASE_*` (four values; the storage bucket stays empty): the website Firebase project's public web settings. Empty = demo mode for `/admin`, content files for the site. Setup: DEPLOY.md section C.

## Photos
Put original photos (any size, straight from the camera) in `photos/` with the names listed in `CONTENT-CHECKLIST.md`, e.g. `hero.jpg`, `service-road-works.jpg`, `project-<slug>-1.jpg`. The build makes AVIF + WebP copies at 480–2000 px in `public/images/`, applies the camera's rotation, strips all metadata (including GPS location) and records sizes in `src/generated/images.json`. Any slot without a photo shows a visible placeholder.

## Brand assets
`public/icon.svg`, `public/apple-icon.png` and `public/og.png` use the placeholder "AG" mark. Regenerate the PNGs with `node scripts/make-brand-assets.mjs` once the real logo arrives.

## Adding Hindi
1. Add `src/content/hi/*.ts` matching the English files, and register `hi` in `src/content/index.ts`.
2. Add pages under `src/app/(hi)/hi/` mirroring `src/app/(en)/`, with `locale = "hi"`.
3. Add `"hi"` to `publishedLocales` in `src/i18n/config.ts`.

English URLs do not change. IBM Plex Sans Devanagari loads only through the Hindi layout. Hindi pages use Western digits (0–9).
