# Back-end plan (Spark-only): content that grows, with no payment method, ever

Written 16 Nov 2026 for the owner of Ambika Groups and for whoever builds it; **revised the same day for the rule "no payment method"**. It is a plan only: nothing here is built beyond what already exists (section 2). Free-plan limits were read from the official pages on 16 Nov 2026; anything I could not confirm is marked **NOT CONFIRMED** and listed in section 14.

**What changed from the first version.** The first version assumed Firebase's Blaze plan (it needs a payment method) for Cloud Functions and Cloud Storage. On the free Spark plan, Firebase's own pricing table shows both as "not applicable", and the console asks for Blaze before Storage can be used. So this version replaces them:
- server logic runs as **Netlify Functions** (free, already part of the Netlify site),
- photos live on **Cloudinary's free plan** (its pricing page says "No credit card required"),
- the database and sign-in stay on **Firebase Spark** (Firestore and Authentication; the table says "No payment method needed"),
- the automatic 2-year cleanup (a Blaze-only feature) becomes an optional owner-triggered cleanup.

---

## The short version, in plain words

**What you get without ever entering a payment method.**
- **Enquiries land in your own inbox** inside the admin, with analytics, and optionally by email. They are stored in your Firebase database and (later) copied to the CRM.
- **A portfolio that grows by itself.** You add a project once (title, place, year, summary, photos, a before-and-after pair, a YouTube link) and press Publish. Photos are shrunk in your browser before they are uploaded, so the site stays fast.
- **A blog, a Hindi version, and a settings page** where you can test every connection with one button.
- **Nothing is hard-coded.** Every item is data you can add, change or hide from the admin.

**How it works.** The website itself stays on Netlify. Four free services do the rest: **Firebase** (sign-in and the database), **Netlify Functions** (the few jobs that need a secret: receiving enquiries, starting a publish, signing photo uploads), **Cloudinary** (photo storage and fast delivery), and **YouTube** (videos, as links only).

**What it costs: ₹0 a month.** All four are used only inside their free allowances. The honest limits are:
- Netlify's free plan has **300 credits a month** and **each publish uses 15**, so plan on about **8 to 10 publishes a month**. If the credits run out, **every site on the account is paused** until the next month.
- Cloudinary's free plan gives **25 credits a month** shared by storage, bandwidth and image resizing. That is plenty for a local contractor's site (about **12 000 gallery views a month**, section 13), but it is a ceiling to watch.
- A public form can be flooded by bots, and a flood costs Netlify credits. The plan adds a free bot check (Cloudflare Turnstile) and Netlify's built-in rate limit to prevent that.

**What you give up compared with a paid setup.** Automatic deletion of old enquiries (you press a button instead), and a safety net if a free service changes its rules (the plan keeps a copy of everything so you can move).

**What would take the time.** About **175 to 245 working hours** in twelve phases (section 12). The first useful result, enquiries landing in your own inbox, is about **16 to 22 hours** away (phases 0 and 1).

**Six things to decide** (section 15). The main four: which photo service (I recommend Cloudinary), how many publishes a month you want, whether to publish a real 2-year retention (it needs the manual cleanup), and whether Hindi comes before or after the English content grows.

---

## Contents
1. The architecture on the Spark plan
2. What exists today, and what changes
3. The content model
4. Where photos live: three options compared (recommendation)
5. The admin dashboard
6. How the website shows lists (static, live, or hybrid)
7. The enquiry path, spam protection, and cleaning up old enquiries
8. Publishing without Cloud Functions
9. Hindi
10. The Website configuration dashboard (with Test buttons)
11. Moving today's file-based content into the database
12. Phases, effort, risks
13. Free-tier budget
14. Limits I could not confirm
15. Decisions needed
16. Test plan

---

## 1. The architecture on the Spark plan

```
                    visitors                                  owner (admin)
                       │                                            │
   static pages ◄── Netlify (CDN) ──► Netlify Functions ◄───────────┤ ID token
   (built at publish)       │          ├ submit-enquiry  (public)    │
                            │          ├ publish-site    (admin)     │
                            │          ├ media-sign      (admin)     │
                            │          └ test-*, crm-*, cleanup      │
                            │               │  Firebase Admin SDK    │
   "Load more" (live) ──────┼───────────────┼──► Firestore (Spark) ◄─┘ browser, under security rules
                            │               ▼
   gallery photos ──────────┴──────► Cloudinary (free) ◄── browser uploads, signed by media-sign
   videos ───────────────────────► YouTube / Vimeo (links only)
```

**Firebase Spark** (verified): the Spark column reads "No payment method needed". It includes Firestore (1 GiB stored, 50 000 reads, 20 000 writes and 20 000 deletes a day, 10 GiB a month outbound; **exactly one free database per project**), and Authentication (50 000 monthly active users listed; email/password is not named separately, so confirm when creating the project). It does **not** include Cloud Functions or Cloud Storage (every Spark cell is "not applicable"), and **Firestore TTL (automatic deletion) needs billing**.

**What needs a server, and where it runs.** Anything that must keep a secret or must not be trusted to the browser:
| Job | Today (Blaze version) | Spark version |
|---|---|---|
| Receive an enquiry, store it, email the owner, forward to the CRM | Cloud Function `submitEnquiry` | Netlify Function `submit-enquiry` |
| Start a publish (build hook) | Cloud Function `publishSite` | Netlify Function `publish-site` |
| Sign a photo upload, delete a photo | Storage rules | Netlify Function `media-sign` (Cloudinary signature) |
| Test a connection, call the CRM, optional cleanup | Cloud Functions | Netlify Functions |

Everything else (reading and editing content) is the browser talking to Firestore directly, under the existing security rules.

### 1.1 Netlify Functions: what the free plan allows (verified 16 Nov 2026)
- **Available on Free.** Modern format (`export default async (req, context)`); the older "Lambda compatibility mode" is deprecated and stops being accepted on **1 July 2027**, so use the modern format.
- **Limits:** synchronous run time **60 seconds**; memory **1024 MB** (not changeable on Free); request and response up to **6 MB buffered** (a binary upload effectively 4.5 MB). Photos never pass through a function: the browser uploads straight to Cloudinary (section 4), so these limits do not bite.
- **Environment variables:** a key may be 255 characters and a **value up to 5 000 characters**. The often-quoted **4 KB total cap applies only to Lambda compatibility mode**; for the modern runtime the pages I read give no total, so I treat 4 KB as a conservative planning number and **measure it** (section 14). Two traps: variables written in `netlify.toml` are **not available to functions** (set them in Netlify's settings or with `npm run netlify:setup`), and **a changed variable only takes effect on a new deploy**, so rotating the key costs one deploy (15 credits).
- **The one secret that must live in an environment variable** is the Firebase **service-account key** (a small JSON file: project id, client email, private key, about 2.3 KB). Every other secret (CRM key, Resend key, Cloudinary secret, Turnstile secret, the build-hook URL) is stored in a Firestore document that browsers can never read (`private/*`) and that functions read through the Admin SDK, so the owner can change them from the admin without a deploy (section 10).
- **Credits per call (credit plan, verified rates):** compute costs **10 credits per GB-hour** (not per invocation), every function call is also a **web request at 2 credits per 10 000**, and bandwidth is 20 credits per GB. Worked example (my arithmetic): a 200 ms run at 1024 MB is about **0.00076 credits**, so **1 000 enquiries cost under 1 credit**. Normal use is invisible; only abuse matters (below).
- **Scheduled functions** are on every plan (30-second limit, UTC, run only on published deploys), which is enough for an optional cleanup or auto-publish.
- **Netlify Blobs** (key-value storage) exists on Free, but it has no locking (last write wins) and its quotas are not stated, so **it is not used**.

### 1.2 Public form: abuse protection without Cloud Functions
A public endpoint can be hammered by bots. On a hard-limit plan that is a real risk: **at about 400 000 requests a month the 300 credits are gone and every site on the account is paused** (my arithmetic from the verified rates). Layers, cheapest first:
1. **Netlify's built-in rate limit** (basic functionality on all plans, set in the function's own `config`, 2 rules per project on Free): for example 5 requests per minute per visitor address, answered with `429` before the function runs. It can take up to 10 seconds to start blocking; whether blocked requests are billed is **NOT CONFIRMED**. Netlify also states it automatically detects DDoS attacks and blocks the clients.
2. **Cloudflare Turnstile**, a free bot check that usually shows nothing to real visitors. The Free plan lists "unlimited challenges" and 20 widgets; it needs no other Cloudflare service. The site key goes in the page, the secret key stays server-side, and the function verifies each token once (valid 5 minutes, single use). **Whether it needs a card or a paid Cloudflare plan is NOT CONFIRMED** (no page mentions one); check when signing up. If it does, skip it and rely on layers 1, 3 and 4.
3. **The honeypot, a 10 KB size cap, field validation and an idempotent id** exactly as the contract already says (the existing validation code is pure and is reused unchanged).
4. **Write protection:** Firestore's free 20 000 writes a day also protects the admin: if a flood got through and used them up, the admin could not save until midnight Pacific time. Layers 1 to 3 prevent that; the daily total is shown in the configuration dashboard.
**Alternative if Turnstile is not possible:** keep Web3Forms in front for delivery and spam filtering (it has its own spam checks and does not touch Netlify credits), and call the function only to store a copy. Section 7 covers both.

---

## 2. What exists today, and what changes

Already built and tested; this plan extends it.

| Piece | Where | Status under this plan |
|---|---|---|
| Admin app | `src/admin/`, route `/admin` | Kept. Runs on sample data in **demo mode** until Firebase is configured. |
| Enquiry and publish code | `functions/` (Firebase Cloud Functions), `functions/src/validation.js`, `email.js`, `crm.js` | **Ported** to Netlify Functions in `netlify/functions/`. The validation, email and CRM code is plain JavaScript with no Firebase-function imports, so it moves unchanged; only the thin wrapper changes. The 14 existing tests keep working. |
| Security rules | `firestore.rules` | Kept (adds one rule: admins may delete enquiries, for the manual cleanup). |
| Storage rules | `storage.rules`, `firebase.json` storage entry | **Not used.** Remove when the work starts. |
| Build-time snapshot | `scripts/fetch-cms.mjs` | Kept. Reads Firestore over its public REST API with no secret; for photos it will download from Cloudinary instead of Storage. |
| File answers | `src/config/launch-answers.ts`, `src/lib/answers.ts` | Kept. Priority stays **admin > file > defaults**. |
| Netlify setup and checks | `npm run netlify:setup`, `verify:live`, `launch-check` | Kept. `netlify:setup` gains the service-account variable (name and size only, never printed). |
| `DEPLOY.md` section C | Firebase project on **Blaze**, Functions, Storage | **Out of date** for this plan. It must be rewritten for Spark (no Blaze, no Storage bucket, no `firebase deploy` of functions) when building starts; it was not changed here. |

---

## 3. The content model (Firestore)

All collections are in the website's **own** Firebase project, never the CRM's. Every text field may carry an optional Hindi twin under `i18n.hi` (section 9). Conventions: `id`, `createdAt`, `updatedAt`, `createdBy`. Secrets and private data live in `private/*` documents that no browser can read.

### 3.1 Projects (extends the existing `projects`)
| Field | Type | Notes |
|---|---|---|
| `title`, `slug` | text | Slug is unique, lowercase, becomes `/projects/<slug>`. |
| `service` | one of five | construction, roadWorks, interlockingPaver, realEstate, plumbingSewage. |
| `status` | `current` / `upcoming` / `completed` | A badge; "completed" triggers the review flag. |
| `location`, `year` | text | Year may be a range, "2024–25". |
| `summary`, `scope[]`, `clientType` | text, list, text | Plain words, as today. |
| `coverMediaId`, `gallery[]` | media ids, ordered | 3 to 4 recommended, no hard limit. |
| `beforeAfter[]` | `{ beforeId, afterId, caption }` | Zero or more pairs; both ids are media items. |
| `videos[]` | `{ provider: "youtube" \| "vimeo", id, title }` | **Links only.** Nothing is uploaded or stored. |
| `tags[]`, `showOnWebsite`, `order`, `reviewFlag`, `crmId`, `crmLinked` | | As in the earlier plan. |

### 3.2 Media library (`media`): metadata in Firestore, the photo itself on Cloudinary
| Field | Notes |
|---|---|
| `provider`, `publicId`, `version` | `provider: "cloudinary"` (or `"repo"` as the exit route, section 4). The delivery address is built from these. |
| `width`, `height`, `bytes` | For layout without shifting. |
| `alt` (required to publish), `caption` | Alt text is mandatory for screen-reader users. |
| `focal` | `{ x, y }`: the point to keep in view when cropped to a card or banner. Whether Cloudinary can crop around a custom point is **NOT CONFIRMED** (only automatic gravity was in the pages I read), so the fallback is automatic gravity. |
| `tags[]`, `usedBy[]` | `usedBy` is filled on save, so "this photo is in use" shows before deleting. |
Videos are never media items.

### 3.3 Other collections
`services` (5), `departments`, `registrations`, `about`, `faq`, `testimonials` (a `permission: true` tick is required to show), `figures`, `clients`, `posts` (draft / scheduled / published, SEO fields, cover media), `settings/site`, `settings/publishState`, `publishes`, `enquiries` (as today), and `private/*` for secrets. Field lists are unchanged from the first version of this plan.

Rules for all of them: public may read only items marked shown (or published posts whose date has passed); only admins write; `private/*` is unreadable by every browser.

### 3.4 Sizes
A Firestore document is capped at **1 MiB** (verified), and a single field value at 1 MiB minus 89 bytes. With photos on Cloudinary a document holds only text and ids, so even a project with 40 photos is a few kilobytes. Composite indexes go in `firestore.indexes.json`.

---

## 4. Where photos live: three options compared

The requirement: before/after pairs, galleries, and **many photos accumulating over years**, with **no payment method**. Videos are YouTube or Vimeo links only (YouTube allows embedding public videos, subject to the owner's embedding setting, and the embedding page must send a Referer, which the site's headers already do; Vimeo's free-plan storage and upload limits are **NOT CONFIRMED**).

### Option A. Compressed photos inside Firestore documents
The browser shrinks each photo (for example 1280 px WebP, about 120 to 200 KB) and stores it in a document.
- **Fits the rules:** a document may be up to 1 MiB; stored as a base64 text field it costs 33% extra, so about 750 KB of real photo per document; a native binary field type may exist but is **NOT CONFIRMED** on the pages I read.
- **Arithmetic:** 1 GiB of storage holds about **5 000 photos at 200 KB** if nothing else is stored. A gallery view of 12 thumbnails (about 25 KB each) is 12 reads and about 0.3 MB; the **10 GiB a month** outbound allowance allows about 34 000 such views and the **50 000 reads a day** about 4 100. A full-size lightbox view adds one read and 200 KB.
- **Problems:** images arrive through the database library, not as web images: no HTTP caching, no browser lazy loading, no resizing for the screen, search engines cannot index them, and the first paint is slower. **And it shares one daily quota with everything else:** a busy gallery day could use up the reads that the admin and the enquiry form also need, until midnight Pacific time.
- **Verdict:** acceptable only for a handful of tiny images; **not** for the gallery. It is also the emergency fallback if every other option disappears.

### Option B. Cloudinary's free plan (recommended)
- **No card:** the pricing page's Free column says "Free forever", "No credit card required". Three users, one account.
- **Allowance:** **25 monthly credits**, one shared pool: **1 credit = 1 000 transformations, or 1 GB of managed storage, or 1 GB of viewing bandwidth**. A "transformation" is counted once per new size or format of a photo. A single image may be up to **10 MB and 25 megapixels** (the browser already compresses far below that).
- **Delivery:** a CDN is included, with resizing and format conversion by URL (for example width 800, automatic format and quality), so one stored photo serves every screen, and results are cached on the CDN.
- **Upload:** **signed** uploads (the signature is made server-side with the API secret; valid 1 hour) are the recommended method for an admin tool, so the plan uses a Netlify Function that checks the owner's sign-in and returns the signature, and the browser then sends the photo **directly to Cloudinary**. Unsigned presets work from the browser but expose the preset name, cannot cap file size (the check would be client-side only), and let anyone who finds the name upload, so they are not used.
- **Terms:** use "solely for your business purposes for websites… owned or operated by you" is granted; no attribution requirement was found (**NOT CONFIRMED**). The account may be suspended for breaching the terms, not for using the free quota.
- **If the allowance is exceeded:** Cloudinary calls its limits "soft limits" and says it will "ask you nicely to upgrade". Whether anything is blocked or billed on Free, and whether a card would ever be demanded, is **NOT CONFIRMED**, so the plan treats Cloudinary as a service we **watch**, with an exit route (below).
- **Lock-in:** the pricing page says the APIs can "copy them to your own storage". The Admin API's Free limit is 500 requests an hour (a few thousand photos therefore need pagination over several hours), and bulk download of the originals is **NOT CONFIRMED**. Mitigation, built into the plan: Firestore keeps every photo's id and metadata; the browser's compressed upload (at most 2 000 px, about 300 KB) is small enough to re-export; a small `export-media` script copies all published photos to the owner's computer on request; and the **published pages never depend on Cloudinary at view time** for their key photos (they are copied into the site at build, as today).

### Option C. Photos committed to the Git repository, written by the admin through the GitHub API
The admin sends each photo to a Netlify Function, which commits it to the repository; the existing photo pipeline then builds it into the site.
- **No third party**, nothing to watch, nothing to lose: the repository is the archive, and the site is fully static and fastest.
- **Costs and limits (verified):** GitHub asks that repositories stay **"ideally less than 1 GB"** and strongly under 5 GB; with about 300 KB per photo, **about 3 000 photos reach 1 GB**, which is a few years of steady use. Content-creating API calls are limited to **80 a minute and 500 an hour**, and file writes must be made **one at a time**, so a 20-photo upload is a slow queue. The maximum file size for a *write* through the contents or blobs API is **NOT CONFIRMED** (reading is limited to 100 MB; GitHub blocks files over 100 MiB).
- **Netlify credits:** **each commit pushed to the production branch is a production deploy (15 credits)** unless the commit message contains `[skip netlify]` or `[skip ci]` (verified), so uploads must be batched with that token and the last commit of a session left to build. And **every photo is served by Netlify at 20 credits per GB**, so a photo-heavy site spends its 300 credits on bandwidth, which competes directly with publishing (300 credits is about 15 GB, or about 20 publishes).
- **Builds get slower** with every photo (the pipeline re-processes the folder); build minutes are not metered, but a very long build is a risk (limit **NOT CONFIRMED**).
- **Security:** the function needs a GitHub token that can write to the repository; a leak means anyone can change the site's code. A token limited to one repository and to contents only reduces, but does not remove, that risk.

### Recommendation
**Option B (Cloudinary) for the media library, with Firestore holding the metadata, and the built site keeping its own copy of the photos it shows first.**
| Need | How it is met |
|---|---|
| Before/after pairs | Two media items cropped to the **same shape** by URL, so the slider lines up; stored as `{beforeId, afterId}`. |
| Galleries and many photos over the years | Unlimited items in Firestore (text only); Cloudinary stores and serves them; the first 12 per list are built into the site, the rest load live. |
| Free forever, no card | Yes at signup; the overage behaviour is the one unconfirmed point. |
| Fast and indexed | Built pages carry their key photos as ordinary optimised files; live photos come through Cloudinary's CDN. |
| Videos | YouTube or Vimeo links; nothing stored. |
| An exit if Cloudinary changes | `media.provider` already allows `"repo"`: run the export script, put the files in `photos/`, switch the field, and the existing photo pipeline takes over. Option C is therefore the planned exit, not the first choice. |
Choose **A or C instead** only if the owner does not want any third-party photo service: C is the safe, fully self-contained choice for a site with a few hundred photos; A is for emergencies only.

---

## 5. The admin dashboard

Extends `/admin`; same style, both themes, phone-friendly.
- **Lists** for projects, media, posts, services, FAQ, testimonials, clients, each with search, filters (status, service, tag, shown/hidden, "needs Hindi"), sort, pagination (20 a page) and a count. At this size the admin loads titles once per session and filters in the browser (Firestore has no text search).
- **Create, edit, delete** with plain-words validation, an unsaved-changes warning, a confirm on delete that names where the item is used, and an `updatedAt` check so two admins cannot silently overwrite each other.
- **Media:** drag photos onto the page (and an "Add photos" button for keyboard and phone users). Each file is **resized and compressed in the browser** (the existing helper: 2 000 px longest side, JPEG 85%, camera rotation applied, location data removed), then uploaded straight to Cloudinary with a signature from `media-sign`. Reordering has drag handles **and** "move up/down" buttons. Alt text and caption are filled in on the same screen; a focal point is set by clicking the preview.
- **Before/after pair editor**, **previews** with the site's real components at phone and desktop width, and **bulk "Show on website"** as in the first plan.
- **Publish:** unchanged in meaning (one Netlify build), with the credit warning and a summary ("3 projects, 1 article, 2 settings changed").

---

## 6. How the website shows lists: static, live, or hybrid

The site is a static export on Netlify's free plan. A rebuild uses **15 of 300** monthly credits and every GB of visitor bandwidth uses 20, so they compete for the same 300.

| | A. Fully static | B. Fully live | **C. Hybrid (recommended)** |
|---|---|---|---|
| New project visible | after a publish | at once | its page after a publish; **in lists at once** |
| Google sees it | yes | poorly | yes, for the pages that matter |
| Speed (LCP) | best | worst | best on first view |
| Firestore reads | none per visitor | 12–30+ per visit | 0 on first view; 12 per "Load more" |
| Netlify credits | many publishes | few | few |

**Recommended: C.**
- **Built at publish (static, indexed):** every project page, blog article and topic page, the services pages, and the **first 12 items** of every list, with their key photos built into the site.
- **Loaded live ("Load more", client-side Firestore + Cloudinary):** items beyond the first 12 and items added since the last publish. A real `<button>`, with a status line announced to screen readers. No infinite scroll.
- **A new item before the next publish** shows in the live part of the list straight away; until its page exists, the card opens a **lightbox** with the photos and details, so nothing is a dead link.
- **Firestore reads (Spark: 50 000 a day, verified):** 0 on a first view; Load more reads 12. Even 1 000 daily visitors pressing it twice is about 24 000 reads. **Graceful failure:** quotas reset around midnight Pacific time, and when a quota is used up Firestore refuses further reads until then (the exact behaviour on Spark is **NOT CONFIRMED**), so the live part shows "More photos are unavailable right now", while the built pages keep working.
- **Photos:** built pages use the existing pipeline (AVIF/WebP, five widths). Live items use Cloudinary's CDN with width and automatic format in the address, so they are small without any server work. The share of Cloudinary's 25 credits this uses is in section 13.

**Components to build** (all keyboard and screen-reader accessible; unchanged from the first plan): gallery grid with reserved space, a `<dialog>` lightbox with arrow keys, swipe and a counter, a before/after slider built on a native range input, a click-to-load video block (YouTube nocookie domain; whether it sets cookies is **NOT CONFIRMED**, so the privacy text says only what is verified), and project filters that work without scripts on the static first page.

---

## 7. The enquiry path, spam protection, and cleaning up old enquiries

```
today      form ──► Web3Forms ──► email to the owner
step 2     form + Turnstile token ──► Netlify Function submit-enquiry ──► Firestore `enquiries`
                                                                     ├─► email to the owner (Resend)
                                                                     └─► CRM inbound API (contract v3)
fallback   if the function is not configured, the form uses Web3Forms
```
- **Same web address, no CORS:** the function lives at `/.netlify/functions/submit-enquiry` on the same site, so the form simply posts there (`NEXT_PUBLIC_ENQUIRY_ENDPOINT`). No allowed-origins list is needed.
- **Order:** the enquiry is saved first, email and CRM second, so a failure of either never loses an enquiry or shows the visitor an error. Idempotent id (a double click is one enquiry).
- **Email:** Resend's Free plan: **100 emails a day, 3 000 a month**, 3 domains, 30-day retention. **Whether signing up needs a card is NOT CONFIRMED** (the pricing page does not say). Sending from the company's own address needs the domain verified, which needs the domain connected first. **If Resend does ask for a card**, use the second route: the form still posts to **Web3Forms** for the email and spam filtering (its free plan has no webhooks or domain restriction, and its monthly free quota is **NOT CONFIRMED**) and **also** calls the function to store a copy. The function then never needs an email service.
- **CRM forward:** after the enquiry is saved, the function sends the same fields to the CRM's inbound API. The **Test** button sends a payload with the honeypot set; by the contract the CRM answers "accepted" and creates nothing.
- **Right of deletion:** the admin can delete one enquiry.

### Cleaning up old enquiries (optional) without Firestore TTL
Firestore's automatic deletion (TTL) is listed by Google as a feature that needs billing, so it is **not available**. The owner keeps enquiries indefinitely, so the privacy page says exactly that. If a real period (for example 2 years) is wanted later:
1. **The admin gets a "Delete enquiries older than N months" button.** It first offers a CSV download, shows how many will be deleted, and asks for confirmation. Deletion runs in the browser in batches under the admin's rules (one added rule allows admins to delete enquiries), and counts against the 20 000 deletes a day.
2. **Optionally automatic:** a Netlify **scheduled function** (free, 30-second limit, runs weekly, UTC) deletes enquiries older than the owner's setting. It runs only for published deploys and is switched on in the configuration page.
3. **Change the privacy text in the same release.** Never switch cleanup on without it, and never publish a period that the system does not enforce.

---

## 8. Publishing without Cloud Functions

- **`publish-site`** (Netlify Function, admins only): checks the caller's Firebase sign-in token, reads the build-hook address from `private/*`, refuses a second publish within 2 minutes, calls the hook, and writes a row to `publishes`. The hook accepts a `POST` and a `trigger_branch` parameter (verified); no rate limit on hooks is stated (**NOT CONFIRMED**).
- **Credits:** a successful production build is 15 credits (verified); whether a hook-started build counts as production is **NOT CONFIRMED**, so the admin assumes 15 and the first publish is watched in Netlify's credit view. Failed builds and rollbacks cost 0.
- **Batching:** editing never builds. Only the Publish button does. If Option C (Git photos) were ever used, commits must carry `[skip netlify]`.
- **Optional auto-publish:** a scheduled function can call the same hook once a night **only if** changes are waiting and fewer than the month's budget of publishes have been used (a setting, default off).
- **A change to a function's code is a code deploy** like any other (15 credits); content changes need none.

---

## 9. Hindi

Same as the first plan: an optional `i18n.hi` twin on every text field; static Hindi pages under `/hi/…` with `hreflang`; side-by-side English and Hindi editors with a "Hindi missing" filter; nothing machine-translated and published without a person reading it. The Devanagari font loads only on pages that show Devanagari. Hindi can start with Home, Services and Contact and grow item by item.

---

## 10. The Website configuration dashboard

A page in the admin like the CRM's "Setup & integrations": one card per connection with a status badge and a **Test** button, **super-user only** (an `owner` role on the `admins/{uid}` document, checked by the rules and again inside every function).

**Secrets are write-only.** The page can save a key and replace it but never shows it again. They are stored in Firestore `private/*` documents (readable by no browser) and used only by functions, so the owner changes them **without a deploy**. The single exception is the **Firebase service-account key**, which is the key to the database and must be a Netlify environment variable (set with `npm run netlify:setup`, never printed); replacing it needs one deploy.

| Card | What is entered | What **Test** does | Counts against |
|---|---|---|---|
| Firebase web settings | five public values | starts the Firebase app and reads `settings/site` as a visitor | one read |
| Firestore | none | reads a public document, then tries a write as a visitor and expects it to be refused | a few reads |
| Service-account key (Netlify) | set outside the page | the function reads one document through the Admin SDK and reports "key works, size N bytes" | one read |
| Authentication | none | shows the signed-in account and role | none |
| Cloudinary | cloud name, API key, API secret | signs and performs a 1-pixel test upload, then deletes it | a tiny transformation |
| Email (Resend) | API key, "from", owner email | sends a short test email to the owner | 1 of 100 a day |
| Web3Forms (fallback) | access key | sends one marked test submission | one free submission |
| Turnstile | site key, secret | verifies a test token | none |
| Netlify build hook | the hook URL | **dry run:** checks the shape, then triggers it for a **non-production branch** with the title "Admin test" (branch deploys are listed at 0 credits); the first real run is watched in the credit view | should be 0 |
| CRM link | API address, key | honeypot payload (section 7) | none in the CRM |
| Google Maps | the share link | checks the link opens | none |

Also on the page: the site address and whether the build used it, the last publish and credits used this month, a **usage panel** (reads, writes and deletes today as counted by the app against the free daily totals, and Cloudinary credits used from its Admin API within its 500-an-hour limit), the quick **"export everything"** button (section 4), and the **launch check** result.

---

## 11. Moving today's file-based content into the database

Unchanged in principle; the front end does not change. It already reads settings, projects and posts through `src/lib/cms.ts`, which merges **admin > file > defaults**.
1. **Seed once** with a script (`scripts/seed-firestore.mjs`, Admin SDK, run once on the owner's computer with the service-account key): writes `settings/site`, `departments`, `registrations`, `faq`, `about`, the five `services`, `figures`, `clients` and the file's projects. **Idempotent**, and prints a table of what it wrote.
2. **Parity check** at the next build ("same / changed / missing" per section). Nothing is switched until the owner has looked.
3. **Switch by field:** admin values win only where they have content, so one section can move at a time. Clearing a field makes the file value apply again.
4. **Rollback:** delete a snapshot file (or the document) and the file answer applies at the next build.
5. **Photos:** files in `photos/` keep working by name. New photos come from the media library.

---

## 12. Phases, effort and risks

Working hours for one developer including tests, **±30%**. "Owner" steps are the owner's accounts and decisions.

| # | Phase | What it delivers | Hours | Depends on |
|---|---|---|---|---|
| 0 | Foundations | Firebase **Spark** project (Auth + Firestore + rules), service-account key into Netlify, `netlify/functions/` scaffold, first admin, `netlify:setup` extended | 6–8 | Owner: Google account (no billing) |
| 1 | Enquiries live | Port `submit-enquiry` to Netlify Functions, rate limit, Turnstile (or the Web3Forms-in-front route), email, inbox in use | 10–14 | 0 |
| 2 | Media library | Cloudinary account, `media-sign`, browser resize and upload, alt/caption/focal point, in-use tracking, export script | 20–28 | 0, owner: Cloudinary signup |
| 3 | Projects v2 | New fields, gallery, before/after editor, videos, tags, bulk show/hide, previews | 24–32 | 2 |
| 4 | Public site v2 | Project and list pages from the database, hybrid load-more, lightbox, slider, video block, filters | 28–40 | 3 |
| 5 | Other content editors | Services, departments, registrations, About, FAQ, testimonials, figures, clients | 20–28 | 0 |
| 6 | Blog v2 | Scheduled publishing, SEO fields, preview, covers from the media library | 12–18 | 2 |
| 7 | Configuration dashboard | The section 10 page with Test buttons, owner-only | 14–20 | 0 |
| 8 | Hindi | `i18n.hi` fields, side-by-side editor, static Hindi pages, hreflang | 16–24 (+ translation) | 5 |
| 9 | Manual / scheduled cleanup | Delete-older-than button, optional scheduled function, privacy text update | 3–5 | 1 |
| 10 | CRM forward and sync | Forward on accept, project completion sync | 8–12 | the CRM's API |
| 11 | Hardening | Accessibility pass, speed re-measure on a quiet machine, security checks (section 16), documentation, rewrite of `DEPLOY.md` section C | 12–16 | all |
| | **Total** | | **≈ 175–245** | |

(The Blaze version estimated 165 to 235 hours. The additions are porting the functions, Turnstile and its fallback, and the Cloudinary signing and export; the removals are the Storage and scheduler setup.)
Earliest useful stops: after **1** (enquiries in your own inbox, 16 to 22 hours), after **4** (the portfolio grows without a developer), after **7** (you can test every connection yourself).

### Risks and how the plan handles them
| Risk | Why it matters | Handling |
|---|---|---|
| **A flood on the public form uses the credits** | Free is a hard limit and every site on the account pauses when it is used up | Netlify rate limit, Turnstile, honeypot, size cap; credits shown in the admin; the Web3Forms-in-front route as an alternative (section 1.2) |
| **Netlify credits (300/month)** | Publishes and bandwidth share them | Cap publishes at ~8–10 a month; gallery photos come from Cloudinary, not Netlify bandwidth |
| **The service-account key leaks** | It is full access to the database | Held only in a Netlify variable, never printed or committed; the launch check and secret scan already look for keys; rotation procedure written down (a new deploy is needed); no copy on the owner's computer after setup |
| **Environment-variable size** | A Lambda-style 4 KB total could be exceeded | Use the modern function format; keep only the key's three fields (about 2 KB); measure once; the Test button shows the size (section 14) |
| **Cloudinary changes its free plan or limits** | Photos could stop serving or be throttled | Built pages keep their own copy of key photos; metadata is in Firestore; export script; `media.provider = "repo"` exit; usage panel warns at 70% of credits |
| **Firestore daily quota used up** | Reads, writes and the admin all share it until midnight Pacific time | Built pages need no reads; the live parts fail politely; flood protection; usage panel |
| A bad rule exposes data | Public read rules guard enquiries | Rules tested on a staging project with real test accounts (no emulator here) before every change |
| Owner publishes content that is not true | Legal and trust | Required "I have permission" tick on testimonials and client names; the launch check; privacy text changes only with enquiry handling |
| Browser upload fails on a poor connection | Large phone photos | Resize before upload (~300 KB), retry, progress shown |
| Vendor limits change | These facts are from 16 Nov 2026 | Section 14 lists what to re-verify at the start of each phase |

---

## 13. Free-tier budget

All values are from the official pages read on 16 Nov 2026 (section 14 lists the gaps).

**Firebase Spark ("No payment method needed"):**
| Service | No-cost quota | Expected use |
|---|---|---|
| Firestore stored data | 1 GiB total | tens of MB (text and ids only) |
| Firestore reads | 50 000 / day | admin session ~500–2 000; visitors 0 on a first view, 12 per Load more |
| Firestore writes | 20 000 / day | tens a day |
| Firestore deletes | 20 000 / day | a handful; up to hundreds when the manual cleanup runs |
| Firestore outbound | 10 GiB / month | far below |
| Authentication | 50 000 monthly active users listed | a few admins |
| Cloud Functions, Cloud Storage, TTL | **not available on Spark** | replaced (sections 1, 4, 7) |
Quotas apply per project and reset around midnight Pacific time.

**Netlify (Free, credit based, hard limit):** 300 credits a month; when used up, **all** sites on the account are paused until the next cycle, and credits cannot be bought on Free.
| Item | Credits |
|---|---|
| Production deploy (successful) | 15 |
| Deploy previews, branch deploys, failed deploys, rollbacks | 0 |
| Bandwidth | 20 per GB |
| Web requests (including every function call) | 2 per 10 000 |
| Function compute | 10 per GB-hour (about 0.00056 per 200 ms call at 1024 MB) |
| Build minutes, Netlify Forms | not metered / free |
Worked monthly budget: **8 publishes = 120 credits**, leaving **180 credits**, which is about 9 GB of bandwidth, or 900 000 requests, or (functions) about 240 000 enquiries; the three share the 180 (my arithmetic from the rates).

**Cloudinary (Free, 25 credits a month, one shared pool; 1 credit = 1 000 transformations = 1 GB storage = 1 GB viewing bandwidth):**
| Item | Example | Credits |
|---|---|---|
| Storage | 3 000 photos at ~300 KB (about 0.9 GB) | ~1 |
| First-time resizes | 500 new photos in a month × 3 sizes × 2 formats | ~3 |
| Viewing bandwidth | 12 000 gallery views × ~1.2 MB (12 photos at ~100 KB) | ~14 |
| **Total** | | **~18 of 25** |
So about **12 000 gallery views a month** fit with room to spare for a local contractor's site; the usage panel warns at 70%. If Cloudinary is skipped, section 4's other options apply.

**Email and bot checks:** Resend Free 100/day, 3 000/month, 3 domains; Turnstile Free unlimited challenges, 20 widgets; Web3Forms Free: monthly quota **NOT CONFIRMED**, no webhooks, no domain restriction.

---

## 14. Limits I could not confirm

Checked on 16 Nov 2026 by reading official pages; several vendor pages blocked or truncated the automated reader.

| # | Not confirmed | Why it matters | Where to look |
|---|---|---|---|
| 1 | **Total size of Netlify environment variables** in the modern function runtime (4 KB is stated only for the deprecated Lambda mode) | The service-account key must fit alongside the other variables | Measure once; Netlify's environment-variable docs |
| 2 | Whether requests blocked by Netlify's rate limiting or DDoS protection are billed credits | Flood cost | Netlify billing FAQ or support |
| 3 | Whether a **build-hook** build is a production deploy (15 credits) or a branch deploy (0), and whether a cancelled build costs credits | The true cost of Publish | One real test; watch the credit meter |
| 4 | Build-hook rate limit; function bundle size; per-site function concurrency; duration rounding | Edge cases | Netlify docs |
| 5 | Cloudinary: upload API rate limits; total asset or storage caps beyond the credit pool; inactive-asset deletion; **what happens past the free allowance (blocked, throttled or billed) and whether a card is ever required**; attribution; bulk download of originals; custom-point crop (`g_xy_center`) and `w_auto` syntax | The recommended photo service | cloudinary.com documentation in a browser (support pages blocked the reader) |
| 6 | GitHub: the maximum size of a file written through the contents or blobs API; fine-grained-token specifics | Only for Option C | docs.github.com |
| 7 | Firestore: the binary `Bytes` type; whether security rules can check types and sizes (not shown on the pages read); the single-document write rate; **what happens when a Spark quota is used up** (assumed: requests are refused until reset) | Enquiry-write protection and graceful failure | firebase.google.com/docs/firestore |
| 8 | Firebase Authentication: email/password named separately on Spark; creating a service-account key on Spark | Setup | The console, when creating the project |
| 9 | Resend: whether Free signup needs a card; the `onboarding@resend.dev` recipient rule; API-key limits | Decides email route A or the Web3Forms route | resend.com, or sign up and see |
| 10 | Cloudflare Turnstile: whether creating a widget needs a card or a paid plan; siteverify rate limits | Decides whether Turnstile is used | dash.cloudflare.com, or the fallback |
| 11 | Web3Forms Free monthly submissions; Vimeo Free storage/upload limits; whether `youtube-nocookie.com` sets cookies | Fallbacks and the privacy wording | their pages in a browser |
| 12 | Netlify Blobs quotas (not used) | Only if reconsidered | Netlify docs |

Pages read: firebase.google.com/pricing, /docs/firestore/quotas, /docs/firestore/security/rules-conditions and rules-structure; docs.netlify.com (functions overview, configuration, usage and billing, environment variables, lambda compatibility, scheduled functions, Blobs, how credits work, rate limiting, ignore builds, stop or activate builds, build hooks); netlify.com/pricing; cloudinary.com/pricing, /pricing/compare-plans, /documentation (upload images, upload presets, image transformations, account management, Admin API), /tou; docs.github.com (REST contents, git blobs, rate limits, large files); developers.cloudflare.com/turnstile (overview, plans, server-side validation); resend.com/pricing and its quotas page; docs.web3forms.com; support.google.com/youtube/answer/171780; help.vimeo.com.

---

## 15. Decisions needed from the owner

1. **Photo service.** Cloudinary (recommended; free, no card, but a third party to watch), or keep photos in the Git repository (self-contained, fine for a few hundred photos, uses Netlify credits)?
2. **Publishes per month.** Is about 8 to 10 enough? More means serving less from Netlify or paying.
3. **Retention.** Keep "as long as active, and for business records" (true today), or enforce a real period (for example 2 years) with the manual or scheduled cleanup (phase 9)?
4. **Order.** Hindi before or after the portfolio grows? My default: portfolio first.
5. **Testimonials and client names.** Will you collect written permission from each? The admin requires a tick before anything shows.
6. **Who else needs access?** One owner, or also editors (who can edit content but not see the configuration page)?

---

## 16. Test plan

- **Unit tests (no emulator, as today):** every pure function, including the ported enquiry validation (the 14 existing tests move with it), list filtering and pagination, the admin/file/default merge, slug and alt-text validation, Cloudinary URL building, the seed script's idempotency.
- **Functions:** each Netlify Function is a plain function that takes a request and returns a response, so it is tested without a server: valid, invalid, honeypot, oversized, rate-limited and bad-token requests; the admin-only functions with a missing, expired and non-admin token; secrets never appear in a response or log (a test searches for them).
- **Component tests:** lightbox, slider and gallery with axe (WCAG 2.2 AA), keyboard-only runs, reduced motion, 390 and 1280 px, both themes, horizontal overflow (the existing suites).
- **Admin end-to-end, demo mode:** extend the current 55-check suite with media upload (the compression result), reorder, before/after pairing, bulk show/hide and preview, persisted across reload. In demo mode the Cloudinary upload is simulated.
- **Security rules:** the Firebase emulator needs Java, which this machine does not have, so rules are tested against a **separate staging Firebase project on the Spark plan** with scripted checks using real test accounts: a visitor, an editor and an owner each try to read and write every collection; any unexpected success fails the run. Includes: `private/*` unreadable by everyone; enquiries cannot be created from a browser; hidden projects and drafts are not readable by visitors; admins can delete enquiries but visitors cannot.
- **Staging end-to-end:** real sign-in, an enquiry round trip through the function (stored, emailed, CRM honeypot test), a signed Cloudinary upload and delete, the build-hook dry run, password reset.
- **Abuse test:** on the staging site, send a burst of requests to `submit-enquiry` and confirm the rate limit answers `429`, the honeypot stores nothing, and the credit meter barely moves.
- **Performance:** re-measure LCP/CLS on a quiet machine (real throttling) after phase 4 with a long gallery; stay under 2 s on 4G and slow 4G. Check Netlify and Cloudinary credit use after the first real publish.
- **Data safety:** seed-script dry run printing a diff; a restore drill (delete a snapshot, confirm the files take over); the export script run once with a real set of photos; CSV export before any deletion feature is enabled.
- **Launch gate:** `npm run launch-check` READY, section 14 items 1, 3, 5, 9 and 10 resolved or consciously accepted, and the privacy text reviewed by the advocate whenever enquiry handling changes.
