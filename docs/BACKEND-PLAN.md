# Back-end plan: content that grows (projects, photos, videos, blog) without a developer

Written 16 Nov 2026 for the owner of Ambika Groups and for whoever builds it. It is a plan only: nothing in it is built beyond what already exists (section 1). Free-plan limits were read from the official pages on 16 Nov 2026; anything I could not confirm is marked **NOT CONFIRMED** and listed in section 11 for checking before any money or time is committed.

---

## The short version, in plain words

**The problem.** Today the website's words, projects and photos are typed into files. That is fine for a first launch. But the company will collect many projects, photos and videos over the years, and nobody wants to ask a developer every time.

**The idea.** Give the website its own small online "back office" (the admin page already started). You add a project once: title, place, year, a summary, photos, a before-and-after pair, a YouTube link. You press **Publish**, and it appears on the website. Photos are shrunk automatically in your browser before they are stored, so the site stays fast.

**How the website shows long lists.** The pages that matter for Google (each project, each blog article) are rebuilt when you publish, so search engines see them fully. Long galleries show the first photos at once and then a **Load more** button, which fetches the next ones live, so a new photo can show up without waiting for a rebuild. This is the **hybrid** in section 4, and it is my recommendation.

**What it costs.** Aim for **₹0 a month**, with one honest exception. Photos stored in Firebase's Mumbai region are *not* in Google's free allowance (only three US regions are), so the plan stores photos in a US region, which stays free and is invisible to visitors. Netlify's free plan gives 300 credits a month and **each publish uses 15**, so plan on **about 8 to 10 publishes a month**, not more. Section 10 has the numbers.

**What you do not need to decide now.** The Firebase project, a billing account and the Netlify link are your steps and cost nothing to set up (a billing account is required, a ₹100 alert protects you). Nothing here is hard-coded: every item below is data you can add, change or hide from the admin.

**What would take the time.** About **165 to 235 working hours** in total, in twelve phases (section 9). The first useful result, enquiries landing in your own inbox and email, is about **10 to 14 hours** away (phases 0 and 1), because most of that code already exists.

**Six things to decide** (section 12). The main four: the photo region, how many publishes a month you want, whether to publish a real 2-year retention (it needs an automatic cleanup), and whether Hindi comes before or after the English content grows.

---

## Contents
1. What exists today
2. The content model (what is stored)
3. The admin dashboard
4. How the website shows lists (static, live, or hybrid)
5. The enquiry path, and cleaning up old enquiries
6. Hindi
7. The Website configuration dashboard (with Test buttons)
8. Moving today's file-based content into the database
9. Phases, effort, risks
10. Free-tier budget
11. Limits I could not confirm, and what to check
12. Decisions needed
13. Test plan

---

## 1. What exists today

Already built and tested, so this plan extends it instead of replacing it.

| Piece | Where | What it does today |
|---|---|---|
| Admin app | `src/admin/`, route `/admin` | Sign-in, enquiries inbox (search, filters, CSV, notes, status), analytics, blog editor (Markdown), projects list with "Show on website", Site settings, "Publish site" with the credit warning. Runs on sample data in **demo mode** until a Firebase project is configured. |
| Back-end functions | `functions/` | `submitEnquiry` (validates, stores, emails the owner, forwards to the CRM when set) and `publishSite` (calls the Netlify build hook). 14 tests with no emulator. |
| Security rules | `firestore.rules`, `storage.rules` | Admin = a document at `admins/{uid}`; public can read only published posts, shown projects and `settings/site`. |
| Build-time snapshot | `scripts/fetch-cms.mjs` | Before every build, reads public data and writes `src/generated/cms-*.json`; downloads photos so the image pipeline makes small AVIF/WebP copies. If Firebase is unreachable the build uses the last snapshot, so it never breaks. |
| File answers | `src/config/launch-answers.ts`, `src/lib/answers.ts` | The owner's answers typed in a file. Priority: **admin > file > built-in defaults**, field by field, and a blank admin value never wipes a file answer. |
| Launch check | `npm run launch-check` | Lists what is still missing, and where each answer came from. |

Two limits of today's model that this plan removes: projects and services are still partly in code (`src/content/en/*.ts`), and photos for projects are matched by file name from a folder rather than chosen in a screen.

---

## 2. The content model (Firestore)

All collections are in the website's **own** Firebase project, never the CRM's. Every document that holds text can carry an optional Hindi version (section 6), written here once as `i18n.hi`.

Conventions for every collection: `id` (stable), `updatedAt`, `createdAt`, `createdBy`, `i18n?: { hi?: {...the same text fields...} }`. Public pages read only fields marked public; admin-only notes live in a separate field group `internal` that public queries never select (Firestore returns whole documents, so truly private data goes in a separate document: `private/…`).

### 2.1 Projects (extends the existing `projects`)
| Field | Type | Notes |
|---|---|---|
| `title`, `slug` | text | Slug is unique, lowercase, becomes `/projects/<slug>`. |
| `service` | one of the five services | construction, roadWorks, interlockingPaver, realEstate, plumbingSewage. |
| `status` | `current` / `upcoming` / `completed` | Replaces today's ongoing/completed. Shown as a badge; "completed" triggers the review flag. |
| `location`, `year` | text | Year may be a range, "2024–25". |
| `summary`, `scope[]` | text, list | Plain words, as today. |
| `clientType` | text | Optional. |
| `coverMediaId` | media id | The main photo. |
| `gallery[]` | media ids, ordered | 3 to 4 recommended, no hard limit. |
| `beforeAfter[]` | `{ beforeId, afterId, caption }` | Zero or more pairs; each id is a media item. |
| `videos[]` | `{ provider: "youtube" \| "vimeo", id, title }` | Embedded only. Never uploaded or self-hosted. |
| `tags[]` | text | e.g. "CC road", "Varanasi". Used for filtering on the site. |
| `showOnWebsite`, `order`, `reviewFlag` | | As today. `order` is the manual order; a "featured" flag may pin up to 3 on Home. |
| `crmId`, `crmLinked` | | When the CRM link exists (section 5). The website's "show" decision always stays the website's. |

### 2.2 Media library (`media`)
One document per uploaded file; the file itself is in Cloud Storage.
| Field | Notes |
|---|---|
| `storagePath`, `url` | Original-after-compression and its public download URL. |
| `variants` | `{ w480, w800, w1600 }` URLs, made in the browser at upload (WebP). |
| `width`, `height`, `bytes` | For layout without shifting. |
| `alt` (required to publish), `caption` | `alt` is mandatory so screen-reader users get a description. |
| `focal` | `{ x, y }` in 0 to 100: the point kept in view when a photo is cropped to a card or a wide banner. Set by clicking on the preview. |
| `tags[]`, `usedBy[]` | `usedBy` is filled by the admin on save (project ids, post ids), so "this photo is in use" is visible before deleting. |
| `kind` | `image` only. **Videos are never stored here**: they are YouTube or Vimeo links on the owning item (section 2.1). |

Why not self-host video: it is large, slow and expensive on any free tier, and YouTube already adapts quality to the viewer. YouTube allows embedding public videos (owners can switch embedding off, age-restricted videos do not play, and the embedding page must send a Referer: the site's current headers already do). Vimeo allows embedding on the free plan; its storage and upload limits are **NOT CONFIRMED**.

### 2.3 Other content collections
| Collection | Fields (public) | Replaces |
|---|---|---|
| `services` (5) | name, slug, summary, jobs[], intro, scope[{title, hint}], clients[], enquiry title, cover and gallery media ids | `src/content/en/services.ts` |
| `departments` | name, hint, order, show | the Government work and Home lists |
| `registrations` | label, value, order | Government work "Registrations" |
| `about` (one doc) | story paragraphs[], people[{name, role, mediaId}], show flags | `launch-answers.ts` Q30, Q31 |
| `faq` | page (contact, services…), question, answer, order | the Contact FAQ in `contact.ts` |
| `testimonials` | name, role, text, projectId?, `permission: true` (required to show), date | new |
| `figures` | 4 × {value, label}, show | Q32 |
| `clients` | name, logoMediaId?, `permission: true`, order, show; certificates[] | Q33 |
| `posts` | title, slug, excerpt, body (Markdown), tags[], coverMediaId, `status` draft / scheduled / published, `publishAt`, SEO title and description, related project slugs | extends today's blog |
| `settings/site` | contact details, hours, maps link, response-time promise, closing statement, privacy approved/retention/date, video id | today's Site settings |
| `settings/publishState`, `publishes` | as today | as today |

Rules for all of them: public may read only items with `show`/`showOnWebsite` true (or posts that are published and whose `publishAt` has passed); only admins write; the CRM key and other secrets live in `private/*` which no browser can read.

### 2.4 Sizes and indexes
A Firestore document is capped at 1 MiB (about 150 000 words of text), so a project with 40 photos is trivial: it stores ids, not images. Expected volume: tens to a few hundred projects and a few thousand media items over years, far under every limit. Composite indexes are needed for "projects by status ordered by `order`" and "posts by status and `publishAt`"; they go in `firestore.indexes.json` (a file that exists and is deployed with the rules).

---

## 3. The admin dashboard

Extends `/admin`; same style, both themes, phone-friendly, every control labelled (existing admin passes axe and overflow checks).

- **Lists** for projects, media, posts, services, FAQ, testimonials, clients. Each has: search, filters (status, service, tag, "shown/hidden", "needs Hindi"), sort, pagination (20 a page), and a count. With data in the hundreds, the admin loads titles once per session and filters in the browser (one read per item per session, then cached); Firestore has no built-in text search, so a "search" field is a browser filter over the loaded titles, not a server query.
- **Create / edit / delete** with validation in plain words ("Add a description for each photo"), unsaved-changes warning, and a confirm on delete that names where the item is used. Edits use an `updatedAt` check so two admins cannot silently overwrite each other.
- **Media**: drag photos from the computer onto the page (and a normal "Add photos" button for keyboard and phone users). Each file is **resized and compressed in the browser** (the existing helper: 2000 px longest side, JPEG 85%, camera rotation applied, location data removed) plus 480 and 800 px WebP copies, then uploaded. Reordering a gallery has drag handles **and** "move up/down" buttons (keyboard accessible). Alt text and caption are filled in the same screen; focal point is set by clicking the preview.
- **Before/after pair editor**: choose two photos, see them in the same slider visitors will see, type a caption. Warns if the two photos have very different shapes.
- **Previews**: a "Preview" button renders the item with the site's real components and the unsaved data, in a modal, at phone and desktop width, so the owner sees what visitors will see before publishing.
- **Bulk "Show on website"**: select many projects (or posts), then show, hide, or set status in one action. The list shows "N changes waiting to publish" as today.
- **Publish**: unchanged in meaning (one Netlify build, 15 credits), with a better summary ("3 projects, 1 article, 2 settings changed").

---

## 4. How the website shows lists: static, live, or hybrid

The site is a static export on Netlify's free plan. A rebuild ("publish") uses **15 of 300** monthly credits, and every GB of visitor bandwidth uses 20 credits, so the two compete for the same 300.

| | A. Fully static | B. Fully live | **C. Hybrid (recommended)** |
|---|---|---|---|
| How | Every list and page is built into the site; any change needs a publish. | Pages are empty shells; the browser reads Firestore. | Key pages built; long lists load more live. |
| New project visible | After a publish | At once | The project page after a publish; the item appears **in lists at once** (Load more) |
| Google sees it | Yes | Poorly (content arrives after the page loads) | Yes, for the pages that matter |
| Speed (LCP) | Best | Worst (extra round trips) | Best on first view |
| Firestore reads | None per visitor | 12–30+ per visit | 0 on first view; 12 per "Load more" |
| Netlify credits | Many publishes if you add often | Few | Few (publish for pages, not for every photo) |
| Complexity | Low | Medium | Medium |

**Recommended: C.** In detail:
- **Built at publish (static, indexed):** every project page, every blog article and topic page, the services pages, and the **first 12 items** of every list (Projects, Blog, a project's gallery). These are what Google reads, and they load instantly.
- **Loaded live ("Load more", client-side Firestore):** items beyond the first 12, and items **added since the last publish**. A visitor presses **Load more** and the next 12 are read (one read per item, 12 reads). The button is a real `<button>`, and a status line ("12 more photos loaded") is announced to screen readers. No infinite scroll, so keyboard users can always reach the footer.
- **New item, no publish yet:** it shows in the live part of the list straight away. Its own page link works after the next publish; until then the list card opens a **lightbox** with the photos and details, so nothing is a dead link.
- **Reads budget (Firestore free: 50 000 reads/day, verified):** a first view costs 0. Even if every one of 1 000 daily visitors pressed Load more twice, that is about 24 000 reads, under the cap. To make this safe by design, an optional build step writes the first pages as a small static JSON file, and a "delta" query reads only items newer than the build, so most visits cost a handful of reads.
- **Cache:** the Firestore web SDK keeps results in memory for the visit; the static JSON is cached by Netlify's CDN; photo files are content-hashed and cached for a year (the site already does this).

### 4.1 Where photos are served from (a real cost decision)
- **Built into the site (current pipeline):** photos downloaded at build become AVIF/WebP at 5 widths, served by Netlify's CDN: best quality and speed, but **each GB of bandwidth costs 20 credits**, so a photo-heavy site can use its 300 credits on bandwidth alone (300 credits is about 15 GB, or about 20 publishes, or 1.5 million requests; the three share one budget).
- **Served from Cloud Storage:** Google's no-cost tier covers **100 GB/month of downloads** (verified) but **only for buckets in `us-central1`, `us-west1`, `us-east1`**, and has no automatic resizing.
- **Recommendation:** put the Storage bucket in a **US region** (`us-central1`), keep the hero and cover images (small, few) in the built site, and serve **gallery, before/after and live-loaded photos from Storage** using the three WebP sizes the browser made at upload. That moves the heavy bytes to the free 100 GB and leaves Netlify's credits for publishing. Visitors in India fetch gallery photos from the US region: a little slower than the CDN, acceptable for galleries. Revisit if Mumbai Storage pricing turns out to be small (**NOT CONFIRMED**).

### 4.2 Components to build (all keyboard and screen-reader accessible)
- **Gallery grid** with real photo `alt` text, reserved space (no layout shift), `loading="lazy"`, `srcset` from the stored sizes, and the Load more button above.
- **Lightbox**: a native `<dialog>` (focus is trapped and returned, Escape closes), previous/next buttons and arrow keys, swipe on phones, photo counter ("3 of 9") read aloud, caption and alt shown, the next photo pre-loaded, pinch-zoom allowed, and a visible Close button. Respects reduced motion.
- **Before/after slider**: two stacked images and a native `<input type="range">` styled as the handle (so arrow keys, Home/End and touch work for free), labelled "Before and after: drag to compare", with the percentage announced; the two photos are also available as a plain side-by-side pair for screen-reader users and with reduced motion.
- **Video block**: a click-to-load facade (already built for the Contact page) so nothing is fetched from YouTube or Vimeo until pressed; YouTube uses the `youtube-nocookie.com` domain (it exists and limits personalisation; whether it sets cookies is **NOT CONFIRMED**, so the privacy text keeps saying only what is verified).
- **Filters** on Projects: by service, status and tag, as links that work without scripts for the static first page.

---

## 5. The enquiry path, and cleaning up old enquiries

```
today           form ──► Web3Forms ──► email to the owner
step 2          form ──► submitEnquiry (own Firebase) ──► stores in `enquiries` + emails the owner
step 3          … ──► forwards the same fields to the CRM's inbound API (contract v3)
fallback        if submitEnquiry is not configured, the form uses Web3Forms
```
- **Step 2 (code exists):** `submitEnquiry` applies the contract's protections (allowed sites only, 10 KB cap, 5 per hour per visitor, honeypot, validation) and an idempotent id so a double click is one enquiry. It emails the owner through Resend. The owner email is **ambikagroups.tech@gmail.com**. Resend's Free plan: 100 emails a day, 3 000 a month, 3 domains, 30-day data retention; received emails count too. Sending **from the company's own address** needs the domain verified in Resend, which needs the domain connected first; whether the shared test sender `onboarding@resend.dev` may email anyone but the account owner is **NOT CONFIRMED**.
- **Web3Forms fallback:** its Free plan has no webhooks and no domain restriction (both Pro), the key is public by design, and the monthly free submissions are **NOT CONFIRMED** (the pricing page refused automated reading). After step 2 it stays only as a fallback.
- **Step 3: the CRM.** When the user provides the CRM's inbound API (address and key), `submitEnquiry` forwards each accepted enquiry and records the result on the enquiry. The **Test** button (section 7) sends a payload with the honeypot field set: by the contract the CRM answers "accepted" and creates nothing, which proves the address and key work without making a fake lead.
- **Order of the whole chain matters:** the enquiry is saved first, email and CRM second, so a failure in either never loses an enquiry or makes the visitor see an error.

### Cleaning up old enquiries (optional)
The owner keeps enquiries indefinitely, so the privacy page says exactly that (a notice must be true). If the owner later wants a **real** 2-year period:
1. Add an `expireAt` field to each enquiry (`createdAt + N months`), set when the enquiry is stored, with a one-time backfill for old ones.
2. Turn on a Firestore **TTL policy** on `enquiries.expireAt`. Firestore then deletes expired documents by itself (TTL is a Blaze-plan feature per Google's quotas page; deletions count against the 20 000 deletes/day allowance, which is plenty here; deletion can lag by up to a day or so).
3. In the admin, a setting "Delete enquiries after N months" (**off by default**), a CSV export reminder before it is switched on, and a banner "Deleted enquiries cannot be recovered".
4. **Change the privacy text in the same release.** Never switch cleanup on without it, and never publish a period that the system does not enforce.
Right of deletion on request already works by hand: the admin can delete one enquiry.

---

## 6. Hindi

- **Model:** every text field can have an optional Hindi twin under `i18n.hi` on the same document (section 2). One document, two languages: no duplicate lists to keep in step, and an item with no Hindi simply falls back to English.
- **Site:** Hindi pages are static under `/hi/…` (the Hindi root layout already exists), `hreflang` links tie each page to its twin, the sitemap lists both, and the **Noto Sans Devanagari** font loads on Hindi pages only (on English pages it already loads only where Devanagari appears, such as the address on Contact).
- **Admin:** each editor shows English and Hindi side by side; a "Hindi missing" filter lists what still needs translating; nothing is machine-translated and published without a person reading it.
- **Scope:** Hindi can start with Home, Services, Contact and the Contact FAQ and grow item by item. It does not block anything else; section 12 asks whether it should come first.

---

## 7. The Website configuration dashboard

A page in the admin like the CRM's "Setup & integrations": one card per connection with a status badge (Not set / Working / Failing, with the time last tested) and a **Test** button. **Super-user only**: it needs an `owner` role on the `admins/{uid}` document, checked by the Firestore rules and again inside every function (an ordinary editor cannot see or call it).

**Secrets are write-only.** The page can save a key and replace it, but never shows it again, and the browser cannot read it back. They are stored server-side and used only by functions. Two ways to store them: Firestore `private/*` documents (free, editable from this page, encrypted at rest by Google), or Secret Manager (better audit and rotation; its free allowance is **NOT CONFIRMED**, so it is optional). Recommended: `private/*` for things the owner changes from the page, Secret Manager only for the deploy-time ones.

| Card | What is entered | What **Test** does | Counts against |
|---|---|---|---|
| Firebase web settings | the five public values | Starts the Firebase app and reads `settings/site` as a visitor | one read |
| Firestore | none | Reads a public document, then tries a write as a visitor and expects it to be refused | a few reads |
| Storage | none | Uploads a tiny file, reads it back, deletes it; shows the bucket region and warns if it is outside the three no-cost US regions | one upload, one download |
| Authentication | none | Shows the signed-in account and its role; lists admins | none |
| Email (Resend) | API key, "from" name and address, owner email | Sends a short test email to the owner address and shows Resend's answer | 1 of 100 a day |
| Web3Forms (fallback) | access key | Sends one clearly marked test submission | one free submission |
| Netlify build hook | the hook URL | **Dry run:** checks the URL's shape, then triggers it for a **non-production branch** (`trigger_branch`) with the title "Admin test". Netlify's docs list branch deploys at **0 credits**, but do not say whether a hook-started build is a production deploy, so the **first real run must be watched in Netlify's credit view** (section 11) | should be 0 credits |
| CRM link | API address, API key | Sends a honeypot payload (as in section 5) and reports accepted / rejected / unreachable | none in the CRM |
| Google Maps | the share link | Checks the link opens; the map itself is a keyless embed with nothing to configure | none |
| Analytics (only if added) | site id | Sends one test event | none |

Also on the page: the **site address** and whether the build used it (the launch check's result), the **last publish** and **credits used this month**, a **usage panel** (reads and writes today as counted by the app, storage used, and links to Google's own usage page), and the **launch check** result.

---

## 8. Moving today's file-based content into the database

The front end does not change. It already reads settings, projects and posts through `src/lib/cms.ts`, which merges **admin > file > defaults**. The plan keeps that rule, and the files become the permanent fallback.

1. **Seed once:** a script (`scripts/seed-firestore.mjs`, using the Admin SDK on the owner's computer, run once) reads `launch-answers.ts` and the content files and writes the matching documents: `settings/site`, `departments`, `registrations`, `faq`, `about`, the five `services`, `figures`, `clients`, and any projects in the file. It is **idempotent** (running it twice changes nothing) and prints a table of what it wrote.
2. **Parity check:** the next build compares the database snapshot with the files and prints "same / changed / missing" per section. Nothing is switched until the owner has looked at it.
3. **Switch by field:** because admin values win only where they have content, the owner can move one section at a time (Government work first, Services last). Clearing a field in the admin makes the file value apply again.
4. **Rollback:** delete a snapshot file (or the document) and the file answer applies at the next build. The content files stay in the repository, so they are never lost.
5. **Photos:** existing files in `photos/` keep working (matched by name). New photos come from the media library, and a project's gallery switches to media ids when it is edited in the admin.
6. **Clean-up later:** once a section has lived in the database for a few releases, its content file is reduced to a minimal default.

---

## 9. Phases, effort and risks

Estimates are working hours for one developer including tests, and are **±30%**. "Owner" steps are the owner's accounts and decisions.

| # | Phase | What it delivers | Hours | Depends on |
|---|---|---|---|---|
| 0 | Foundations | Firebase project, rules deployed, first admin, web settings (DEPLOY.md section C, including the Storage region choice) | 4–6 | Owner: Google account, billing, ₹100 alert |
| 1 | Enquiries live | `submitEnquiry` deployed, Resend, inbox in use, CORS for the real domain | 6–8 | Phase 0, Resend key, domain |
| 2 | Media library | Upload with browser resize, alt/caption/focal point, in-use tracking, sizes | 16–24 | 0 |
| 3 | Projects v2 | New fields, gallery, before/after editor, videos, tags, bulk show/hide, previews | 24–32 | 2 |
| 4 | Public site v2 | Project and list pages from the database, hybrid load-more, lightbox, slider, video block, filters | 28–40 | 3 |
| 5 | Other content editors | Services, departments, registrations, About, FAQ, testimonials, figures, clients | 20–28 | 0 |
| 6 | Blog v2 | Scheduled publishing, SEO fields, preview, covers from the media library | 12–18 | 2 |
| 7 | Configuration dashboard | The section 7 page with Test buttons, owner-only | 14–20 | 0 |
| 8 | Hindi | `i18n.hi` fields, side-by-side editor, static Hindi pages, hreflang | 16–24 (+ translation time) | 5 |
| 9 | Retention cleanup | `expireAt`, TTL policy, admin setting, privacy text update | 4–6 | 1 |
| 10 | CRM forward and sync | Forward on accept, project completion sync | 8–12 | The CRM's API |
| 11 | Hardening | Accessibility pass, speed re-measure on a quiet machine, security checks (section 13), documentation | 12–16 | all |
| | **Total** | | **≈ 165–235** | |

The earliest useful stop points: after **1** (enquiries in your own inbox), after **4** (the portfolio grows without a developer), after **7** (you can check every connection yourself).

### Risks and how the plan handles them
| Risk | Why it matters | Handling |
|---|---|---|
| Netlify credits (300/month) | Publishes and bandwidth share them; running out pauses **all** sites on the team | Cap at ~8–10 publishes a month, serve gallery photos from Storage, show the running total in the admin, refuse a second publish within 2 minutes (exists) |
| Photos in Mumbai Storage are not free | The no-cost tier is US regions only; the Mumbai price is **NOT CONFIRMED** | Use a US-region bucket (section 4.1), verify the price before changing |
| A bad rule exposes data | Public read rules guard enquiries | Rules tested against a staging project with real test accounts (no emulator on this machine) before every change (section 13) |
| Spam or a flood of enquiries | Costs and noise | Existing protections, `maxInstances: 2`, honeypot, rate limit; optional App Check later |
| Owner publishes content that is not true | Legal and trust | Required "I have permission" flag on testimonials and client names; the existing launch check; privacy text changes only with enquiry handling |
| Browser upload fails on a poor connection | Large photos on mobile data | Resize before upload (2000 px, ~300–500 KB), retry, progress shown |
| Vendor limits change | The facts here are from 16 Nov 2026 | Section 11 lists what to re-verify at the start of each phase |

---

## 10. Free-tier budget

All values are quoted from the official pages read on 16 Nov 2026 (section 11 lists the sources and the gaps).

**Firebase (Blaze plan, but inside the no-cost quotas):**
| Service | No-cost quota | Expected use for this site |
|---|---|---|
| Firestore: stored data | 1 GiB | tens of MB |
| Firestore: reads | 50 000 / day | admin session ~500–2 000; visitors: 0 on first view, 12 per Load more |
| Firestore: writes | 20 000 / day | tens a day |
| Firestore: deletes | 20 000 / day | a handful (TTL cleanup if enabled) |
| Firestore: outbound data | 10 GiB / month | far below |
| Cloud Storage (US region only) | 5 GB stored, 100 GB/month downloaded, 5 000 uploads and 50 000 downloads/month | a few GB of photos; gallery views |
| Cloud Functions | 2 000 000 invocations, 400 000 GB-seconds, 200 000 CPU-seconds, 5 GB outbound / month | tens to hundreds of calls |
| Authentication | 50 000 monthly active users listed (email/password not named separately) | a few admins |
Quotas apply **per project**; no region restriction is stated for Firestore on the pages read. **Cloud Storage is the exception: only buckets in us-central1, us-west1 and us-east1 are no-cost.** A billing account (Blaze) is required for Cloud Storage for Firebase (in force from 3 Feb 2026) and, judging by Firebase's pricing table (its no-cost column shows "not applicable" for Functions), for Cloud Functions; no page states that outright, so treat it as likely.

**Netlify (Free plan, credit based):** 300 credits a month, a hard limit with no auto recharge (and, per Netlify's billing FAQ, no way to buy extra credits on Free); when they run out every site on the team is paused until the next cycle.
| Item | Credits |
|---|---|
| Production deploy (successful) | 15 each |
| Deploy previews and branch deploys | 0 |
| Failed deploys, rollbacks | 0 |
| Bandwidth | 20 per GB |
| Web requests | 2 per 10 000 |
| Build minutes | not metered |
| Functions | 10 per GB-hour of compute |
| Forms | free |
Worked monthly budget: **8 publishes = 120 credits**, leaving **180 credits ≈ 9 GB of bandwidth or 900 000 requests** (derived from the rates above, not stated on a page). If photos move to Storage (section 4.1), almost all of that 9 GB is room for pages, scripts and hero images.

**Email and forms:** Resend Free 100/day and 3 000/month; Web3Forms Free: monthly quota **NOT CONFIRMED**, no webhooks, no domain restriction.

**Correction to earlier documentation.** `DEPLOY.md` section C3 says all services go in `asia-south1` and section C intro says everything stays inside Firebase's free allowances. For **Cloud Storage that is not true in Mumbai**. When deployment work resumes, `DEPLOY.md` should say: Firestore in `asia-south1` is fine; create the Storage bucket in a US region (us-central1).

---

## 11. Limits I could not confirm, and what to check before building

Checked on 16 Nov 2026 by reading official pages. Several Google Cloud pricing pages returned only their title text to the automated reader, so these need a person to open them in a browser.

| # | Not confirmed | Why it matters | Where to look |
|---|---|---|---|
| 1 | Cloud Storage price per GB stored and per GB egress in `asia-south1` | Decides whether a Mumbai bucket would be affordable | cloud.google.com/storage/pricing |
| 2 | Firestore price per 100 000 reads beyond the free quota | Overage estimate | cloud.google.com/firestore/pricing |
| 3 | Secret Manager free active versions and free access operations | Decides `private/*` vs Secret Manager | cloud.google.com/secret-manager/pricing |
| 4 | Cloud Scheduler free jobs per billing account, and whether Blaze is required | Needed only for scheduled posts and auto-publish (Firestore TTL needs no scheduler) | cloud.google.com/scheduler/pricing |
| 5 | Cloud Functions minimum-instance rules | Cold starts vs cost | cloud.google.com/functions/pricing |
| 6 | Whether a Netlify **build hook** build is a production deploy (15 credits) or a branch deploy (0) | The Test button and the true publish cost | Do one real test and watch the credit meter; also ask Netlify support |
| 7 | Whether a **cancelled** Netlify build costs credits | Minor | Netlify billing FAQ |
| 8 | Web3Forms Free plan monthly submissions | Fallback capacity | web3forms.com/pricing in a browser (the page blocked automated access) |
| 9 | Resend's `onboarding@resend.dev` recipient rule, and API-key/team limits | Whether test mail works before the domain is verified | Resend docs, or send a test |
| 10 | Whether `youtube-nocookie.com` sets any cookies | The privacy wording | YouTube/Google documentation; keep the text as it is until verified |
| 11 | Vimeo Free plan storage and upload limits | Only if Vimeo is used | help.vimeo.com |
| 12 | Netlify site-size or file-count limits on Free | A large generated site | Netlify docs; none was stated on the pages read |
| 13 | Firebase Authentication email/password MAU limit stated separately | A few admins, so low risk | firebase.google.com/pricing |

Pages read: firebase.google.com/pricing, /docs/firestore/quotas, /docs/storage/faqs-storage-changes-announced-sept-2024; netlify.com/pricing and docs.netlify.com (credit-based pricing, how credits work, billing FAQ, build hooks, deploy types); resend.com/pricing and /docs/knowledge-base/account-quotas-and-limits; docs.web3forms.com (FAQ, pro features); support.google.com/youtube/answer/171780; help.vimeo.com (embedding by plan type).

---

## 12. Decisions needed from the owner

1. **Photo region.** OK to keep Storage in a US region for the free allowance (invisible to visitors, uploads from Varanasi are slightly slower)? Or pay for Mumbai once the price is confirmed?
2. **Publishes per month.** Is ~8–10 enough? More means paying Netlify or serving less from it.
3. **Retention.** Keep "as long as active, and for business records" (true today), or enforce a real period (e.g. 2 years) with automatic cleanup (phase 9)?
4. **Order.** Hindi before or after the portfolio grows (phases 3–4)? My default: portfolio first.
5. **Testimonials and client names.** Will you collect written permission from each person or client? The admin will require a tick before anything shows.
6. **Who else needs access?** One owner, or also editors (who can edit content but not see the configuration page)?

---

## 13. Test plan

- **Unit tests (as today, no emulator):** every pure function: list filtering and sorting, pagination cursors, the merge of admin/file/default, retention date arithmetic, slug and alt-text validation, the `expireAt` calculator, the seed script's idempotency, CSV/analytics.
- **Component tests:** the lightbox, slider and gallery with axe (WCAG 2.2 AA), keyboard-only runs (Tab, arrows, Escape, Home/End), screen-reader name checks, reduced motion, 390 and 1280 px, both themes, and horizontal-overflow checks (the existing suites).
- **Admin end-to-end, demo mode:** extend the current 55-check suite with media upload (compression result), reorder, before/after pairing, bulk show/hide and preview, persisted across reload.
- **Security rules:** the Firebase emulator needs Java, which this machine does not have, so rules are tested against a **separate staging Firebase project** with scripted checks using real test accounts: a visitor, an editor and an owner each try to read and write every collection; any unexpected success fails the run. Run before every rules change and before launch. Includes: the CRM key cannot be read by anyone; enquiries cannot be created from a browser; hidden projects and drafts are not readable by visitors.
- **Firebase-mode end-to-end on staging:** real sign-in, `submitEnquiry` round trip (stored, emailed, CRM honeypot test), Storage upload, build hook dry run, password reset.
- **Performance:** re-measure LCP/CLS on a quiet machine (real throttling, the existing method) after phase 4, with a long gallery; the budget stays under 2 s on 4G and slow 4G. Check Netlify credits after the first real publish.
- **Data safety:** seed-script dry run printing a diff; a restore drill (delete a snapshot, confirm the files take over); CSV export before any deletion feature is enabled.
- **Launch gate:** `npm run launch-check` READY, section 11 items 6 and 8–10 resolved or consciously accepted, and the privacy text reviewed by the advocate whenever enquiry handling changes.
