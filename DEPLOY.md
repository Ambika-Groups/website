# Putting the website online (Netlify)

This guide is for whoever holds the company's Netlify account. You don't need to know how the site is built, but you will copy a few commands into a terminal.

There are two ways to publish. Pick one:

| | **A. Connected to Git** (recommended) | **B. Netlify Drop** (drag and drop) |
|---|---|---|
| How it works | Netlify builds the site itself every time the code changes. | You build the site on your computer, then drag the finished folder onto a web page. |
| Good for | Ongoing updates by a developer. | A quick first launch, or when there is no Git repository yet. |
| Settings (keys, address) | Typed once into Netlify. | Must be in `.env.local` on **your computer before you build**. Netlify never sees them. |

Both give the same website, with the same security headers and redirects.

> **Budget rule (free plan).** The free plan allows 300 credits a month for the whole Netlify team. **Every production deploy costs 15 credits**, whether by Git or by Drop, and visitor traffic uses the rest. If credits run out, the site goes offline until the next month. So publish to production only for a real release (a few times a month), and use deploy previews (free) to review changes. Details and the traffic estimate: README.md, "Free plan".

---

## The launch order

Do these three things, in this order, before the site goes live:

1. **Answer the questions.** Open `LAUNCH-QUESTIONS.md`. **Part 1** (16 questions) must be answered before launch; **Part 2** (23 questions) is safe to skip, and the site hides that section or uses a safe default instead of showing placeholder text. There are two ways to answer, and each question says where:
   - **Quick path, no accounts needed:** type the answer into `src/config/launch-answers.ts` (each entry is named after its question, e.g. `q5_phone` answers Q5) and rebuild. This needs neither the admin nor Firebase. The file is committed and public, so put only public details in it, never a key or password.
   - **Long term:** the admin (**/admin → Site settings**, then **Publish site**), once the back end exists. The admin overrides the file wherever it has an answer; a blank admin value never wipes out an answer typed in the file.

   A few answers are neither: Netlify's environment settings (the enquiry key, Q2) or photo files (Q35). Tick the question's **Status** box when its answer is in.
2. **Run the launch check.** In `Website\`:
   ```
   npm run build
   npm run launch-check
   ```
   It lists every unanswered must-have and every placeholder still visible in the build, with the question number (Q1, Q2, …) and where to answer it, and says which answers came from `launch-answers.ts` and which from the admin. A site address that is not set yet (Q1) is a known pre-deploy item when you run it on your own computer; on Netlify it is a failure. Repeat until it says **RESULT: READY** (it ends with exit code 0). It also lists, as "safe to skip", the optional questions you have not answered yet.
3. **Deploy** (section A or B below).

**Strict mode (optional).** Normally the launch check only prints a one-line summary after each build and never stops it. When you are ready to launch, set the Netlify environment variable `LAUNCH_STRICT` to `1`. From then on, a build that still has an unanswered must-have or a visible placeholder **fails**, so an unfinished site can never be published by accident. Remove the variable to go back to the normal behaviour.

---

## Before you start

You need:
1. **A Netlify account** made with the company email (app.netlify.com → Sign up). Keep the login safe. Use a team of its own, not the CRM's, so the website's traffic can never use up the CRM's credits.
2. **A Web3Forms access key.** Sign up at web3forms.com with the email address where enquiries should arrive. It shows an *Access Key*. That is where every enquiry from the site will be emailed.
3. **The website address** (domain), e.g. `https://www.ambikagroup.in`. If you don't have one yet, you can launch on the free `something.netlify.app` address first and add the domain later (step 4).

### The settings

| Name | What to put | Example |
|---|---|---|
| `NEXT_PUBLIC_WEB3FORMS_KEY` | The Web3Forms access key. | `a1b2c3d4-…` |
| `NEXT_PUBLIC_SITE_URL` | The site's final address, starting with `https://`, **no slash at the end**. Search engines and link previews use it. | `https://www.ambikagroup.in` |
| `NEXT_PUBLIC_ENQUIRY_ENDPOINT` | Empty means "send enquiries to Web3Forms". Once the website back end is set up (section C), the address of its `submitEnquiry` function. | *(empty)*, later `https://asia-south1-ambika-website.cloudfunctions.net/submitEnquiry` |
| `NEXT_PUBLIC_FIREBASE_API_KEY`, `…_AUTH_DOMAIN`, `…_PROJECT_ID`, `…_STORAGE_BUCKET`, `…_APP_ID` | **Leave empty until section C.** The website Firebase project's web settings (C4). While `…_PROJECT_ID` is empty, `/admin` runs in demo mode on sample data, and the site uses its content files. | *(empty)* |

These values end up inside the website's files when it is built, so **after changing any of them you must build and deploy again** for the change to show. None of them is a password: the Web3Forms key and the Firebase web settings are designed to be public (the security rules protect the data). Never put any other key, password or CRM secret here; those live in the back end (section C6).

Do **not** set `NEXT_PUBLIC_PREVIEW_UNVERIFIED`. It switches the placeholders back on (sample projects, placeholder figures and logos) and is only for internal review builds. In a normal production build the site never shows placeholder text: a section or row with no real content is left out.

`LAUNCH_STRICT=1` is explained in "The launch order" above.

---

## A. Connected to Git (recommended)

The code must be in a Git repository (GitHub, GitLab or Bitbucket) whose top level is this `Website` folder, i.e. `package.json` and `netlify.toml` sit at the root of the repository.

1. In Netlify: **Add new project → Import an existing project**, choose the Git provider, sign in, and pick the repository.
2. On the settings screen, check the values. They are read from `netlify.toml`, so normally you change nothing:

   | Field | Value |
   |---|---|
   | Branch to deploy | `main` (or the repository's main branch) |
   | Base directory | *(empty)*. Only if the Website folder sits inside a bigger repository: the folder that contains `netlify.toml`, e.g. `Website` |
   | Build command | `npm run build` |
   | Publish directory | `out` |

3. Under **Environment variables** on the same screen (or later in **Project configuration → Environment variables**), add the three settings from the table above. For `NEXT_PUBLIC_ENQUIRY_ENDPOINT` you may leave it out entirely; it then counts as empty.
4. Click **Deploy**. The first build takes 2–4 minutes. When it says **Published**, open the `….netlify.app` link.
5. Check the build log once (Deploys → the deploy → Deploy log). It should show `npm run build` finishing with lines such as `✓ Generating static pages` and `netlify-redirects: … rule(s) written to out/_redirects`. Netlify's Next.js plugin is switched off on purpose (`NETLIFY_NEXT_PLUGIN_SKIP` in `netlify.toml`); that is correct for this site.
6. Run the first-deploy checklist below.

**After that:** every push to the main branch publishes a new version automatically (15 credits each). Pull requests get a free deploy preview link. If you want to save credits, push to main only when you mean to release; or in **Project configuration → Build & deploy → Continuous deployment**, set builds to stopped and publish with **Trigger deploy** when ready.

---

## B. Netlify Drop (drag and drop)

Netlify Drop publishes a folder you built yourself. **Netlify does not build anything and does not see your settings**, so they must be correct on your computer first.

### B1. Build the site on your computer (once per release)

You need Node.js **24.11.1** (nodejs.org; the version is also in `.nvmrc`). In a terminal opened in the `Website` folder:

1. Create the settings file: copy `.env.example` to a new file named `.env.local` in the same folder, and fill in the three settings from the table above. Check `NEXT_PUBLIC_SITE_URL` especially: it is baked into every page.
   Make sure `.env.local` does **not** contain `NEXT_PUBLIC_PREVIEW_UNVERIFIED`.
2. Install (first time, or after the code changes):
   ```
   npm ci
   ```
3. Build:
   ```
   npm run build
   ```
   It ends with a line like `netlify-redirects: 14 rule(s) written to out/_redirects`. If it stops with a red error, don't upload anything; send the error to the developer.
4. Check the folder `Website\out\` now exists and contains `index.html`, `404.html`, `_headers` and `_redirects`. (`_headers` and `_redirects` hold the security headers and redirects; without them the site works but is less secure. On Windows, files starting with `_` are normal files, not hidden.)
5. Optional but recommended: `npm run preview:netlify`, then open http://localhost:8888 and click through a few pages. Stop it with Ctrl+C.

### B2. Upload

**First time**
1. Log in to app.netlify.com first (otherwise a Drop site is deleted after an hour).
2. Go to **app.netlify.com/drop**.
3. Drag the **`out` folder itself** (not the `Website` folder, and not the files inside `out` one by one) onto the page.
4. Wait for the upload to finish; Netlify shows the new `….netlify.app` link.
5. Optional: **Project configuration → Change project name** to get a readable address such as `ambika-group.netlify.app`.

**Every later release**
1. Repeat B1 (build again).
2. In Netlify, open the project → **Deploys**, and drag the new `out` folder onto the box that says *"Drag and drop your project output folder here"*. Don't use app.netlify.com/drop again; that would create a second, separate project.

Then run the first-deploy checklist below.

---

## Pointing the domain at the site

Do this once the site works on its `….netlify.app` address.

1. In Netlify: the project → **Domain management → Add a domain**. Type the domain you own (e.g. `ambikagroup.in`), confirm. Netlify adds both `ambikagroup.in` and `www.ambikagroup.in` and shows the DNS records it needs.
2. Choose how the domain is connected:
   - **Easiest, keep the domain where you bought it (GoDaddy, Hostinger, BigRock…):** log in to the registrar, open the domain's **DNS** settings and add exactly the records Netlify shows. Normally that is:

     | Type | Name / Host | Value |
     |---|---|---|
     | `A` | `@` | `75.2.60.5` |
     | `CNAME` | `www` | `<your-project>.netlify.app` |

     Delete any older `A` record on `@` and any older `www` record (e.g. the registrar's "parked" page), or the domain will sometimes show the old page. Always use the values on Netlify's screen if they differ from this table.
   - **Or** let Netlify manage DNS (Netlify DNS): Netlify gives four name servers; enter them at the registrar under "Nameservers". Only do this if there is no company email on the domain, or the email records are copied over first, otherwise email can stop working.
3. Wait. DNS changes take from a few minutes to several hours. Netlify shows a green tick when it sees them.
4. **HTTPS:** Netlify issues the certificate automatically after DNS works (**Domain management → HTTPS**). If it says "waiting", give it up to an hour, then click **Verify DNS configuration**.
5. **Main address:** set `www.ambikagroup.in` as the primary domain (Netlify then redirects the bare `ambikagroup.in` to it), or the other way round, but it must match `NEXT_PUBLIC_SITE_URL` exactly.
6. **Rebuild with the real address.** If `NEXT_PUBLIC_SITE_URL` was not yet the real domain:
   - Git: change it under Environment variables, then **Deploys → Trigger deploy → Deploy project**.
   - Drop: change it in `.env.local`, build again (B1) and drag the new `out` folder in (B2).
7. In the Web3Forms dashboard, if your plan allows it, restrict the key to the domain.

---

## First-deploy checklist

Do this after the first deploy and after the domain is connected. Replace `https://www.ambikagroup.in` with the real address (or the `….netlify.app` one).

**Terminal commands.** On Windows use PowerShell and type `curl.exe` exactly as below (plain `curl` in Windows PowerShell is a different command). On Mac or Linux, type `curl` instead of `curl.exe`. `-I` asks only for the response headers.

1. **Home page and security headers**
   ```
   curl.exe -I https://www.ambikagroup.in/
   ```
   Expect `HTTP/1.1 200` (or `HTTP/2 200`) and all of these lines:
   ```
   x-content-type-options: nosniff
   referrer-policy: strict-origin-when-cross-origin
   x-frame-options: DENY
   content-security-policy: frame-ancestors 'none'
   permissions-policy: camera=(), microphone=(), geolocation=(), …
   ```
   If these five are missing, `_headers` did not reach the site: with Drop, check that `out\_headers` existed before the upload.
2. **Clean addresses and redirects**
   ```
   curl.exe -I https://www.ambikagroup.in/contact
   curl.exe -I https://www.ambikagroup.in/contact.html
   ```
   Expect `200` for the first; `301` with `location: /contact` for the second.
3. **Missing page**
   ```
   curl.exe -I https://www.ambikagroup.in/no-such-page
   ```
   Expect `404`. Open it in a browser too: it should show the site's own "page not found" page with the menu.
4. **Long caching for site files.** Open the home page in a browser, right-click → **View page source**, search (Ctrl+F) for `/_next/static/` and copy one full path ending in `.js` or `.woff2`, e.g. `/_next/static/chunks/abc123.js`. Then:
   ```
   curl.exe -I https://www.ambikagroup.in/_next/static/chunks/abc123.js
   ```
   Expect `cache-control: public, max-age=31536000, immutable`. Do the same with one `/images/…` path from the source (e.g. `/images/hero-…-800.avif`); expect the same line.
5. **Share image**
   ```
   curl.exe -I https://www.ambikagroup.in/og.png
   ```
   Expect `200` and `cache-control: public, max-age=604800`.
6. **The right address is baked in.** In the page source, search for `canonical`: it must show the real domain, e.g. `https://www.ambikagroup.in/`, not `example.com` or `netlify.app`. Also open `/sitemap.xml` and `/robots.txt`; the addresses must use the real domain.
7. **HTTPS and the bare domain.** `curl.exe -I http://ambikagroup.in/` should answer `301` to `https://www.ambikagroup.in/` (or the reverse, matching your main address).
8. **Enquiry form, end to end.** On the Contact page, send a real test enquiry with your own name and phone. Expect the confirmation message, and the email in the Web3Forms inbox within a minute or two. If it says it could not send, check `NEXT_PUBLIC_WEB3FORMS_KEY` and rebuild.
9. **Nothing unverified is showing.** On the Home and About pages there must be **no** figures section ("Work that adds up") and **no** "Trusted by" logos. If you see them, the build was made with `NEXT_PUBLIC_PREVIEW_UNVERIFIED`; remove it and rebuild.
10. **A quick look on a phone.** Open the site on a phone: menu opens and closes, the light/dark switch works, the WhatsApp button opens WhatsApp with the company number.

A production build shows **no** [bracketed] placeholder text; if you see one, run `npm run launch-check` (it names the question that is still open). The "Illustrative photo" labels on stock photos are expected until real photos arrive (Q35 in `LAUNCH-QUESTIONS.md`); they are not deploy errors.

---

## C. The website back end and admin (Firebase)

This gives the site its own back end. Enquiries are stored and shown in the admin at `/admin` (inbox and analytics), and the owner gets an email for each one. The blog, projects and site settings are edited there and published with one button. It is a **separate Firebase project from the CRM's**, so its traffic, spam and quota can never touch the CRM.

Until this is done the site works as before: enquiries go to Web3Forms, and `/admin` shows a clearly labelled **demo** with sample data.

**Cost.** Everything below stays inside Firebase's free allowances for a site of this size, **provided the Storage bucket is in a US region** (C3 step 4): Google's no-cost Storage allowance covers only `us-central1`, `us-east1` and `us-west1`, not Mumbai. Firebase needs the Blaze (pay-as-you-go) plan for Storage and (judging by its pricing table) for Functions, so a billing account is required, but the bill is ₹0 inside the free allowances. The ₹100 budget alert (C2) emails you long before any real cost. The enquiry function runs at most 2 copies at a time, so a flood of spam is turned away instead of scaling up.

### C1. Create the project
1. Open console.firebase.google.com with the company Google account → **Create a project**.
2. Name it e.g. `ambika-website`. Do not use the CRM's project.
3. Google Analytics: **off**.

### C2. Blaze plan and the ₹100 alert
1. In the project, **Upgrade** → Blaze → link or create a billing account.
2. Go to console.cloud.google.com → **Billing** → **Budgets & alerts** → **Create budget**:
   - scope: this project only
   - amount: **₹100**
   - alerts at 50%, 90% and 100%, emailed to the billing admins

   An alert only warns you. It does not stop spending.

### C3. Turn on the services (Firestore in Mumbai, Storage in a US region)
1. **Authentication** → Get started → **Email/Password** → Enable.
2. Still in Authentication: **Settings** → **User actions** → untick **Enable create (sign-up)**. Nobody can then make an account from the browser; you add admins yourself (C9).
3. **Firestore Database** → Create → production mode → location `asia-south1`.
4. **Storage** → Get started → production mode → location **`us-central1`** (not Mumbai). Google's no-cost Storage allowance (5 GB stored, 100 GB a month of downloads) applies only to `us-central1`, `us-east1` and `us-west1`; a Mumbai bucket is billed from the first byte at a price not yet confirmed. Visitors are not affected: photos shown on the built pages are copied into the site at build time and served by Netlify; Storage is used only by the admin's uploads and by galleries loaded live. Firestore, Functions and the rest stay in `asia-south1`.

### C4. The web settings
1. Project settings (gear) → **Your apps** → web (`</>`) → register "Website". Hosting: no.
2. It shows `apiKey`, `authDomain`, `projectId`, `storageBucket` and `appId`.
3. Put them in the five `NEXT_PUBLIC_FIREBASE_…` settings: in Netlify, and in `.env.local` for builds on your computer.

### C5. Tools on your computer (once)
```
npm install -g firebase-tools
firebase login
```
In `Website\`, copy `.firebaserc.example` to `.firebaserc` and put the project id in it.

### C6. Back-end settings and secrets
1. **Back-end settings.** Create `Website\functions\.env`. It holds no secret, but it belongs to this installation, so never commit it:
   ```
   SITE_ORIGINS=https://www.ambikagroup.in,https://ambikagroup.in
   OWNER_EMAIL=owner@ambikagroup.in
   EMAIL_FROM=Ambika Group Website <onboarding@resend.dev>
   ```
   `*.netlify.app` addresses and localhost are always allowed.
2. **Owner email (free).** Sign up at resend.com with the owner's email and create an API key. Then run:
   ```
   firebase functions:secrets:set RESEND_API_KEY
   ```
   and paste the key.
   - Until you have a key, enter `none`. Enquiries are still stored; only the email is skipped.
   - With `onboarding@resend.dev` as the sender, Resend only delivers to the address the Resend account was made with.
   - To send from the company's own address instead, verify the domain in Resend and change `EMAIL_FROM`.
3. **Netlify build hook.** The admin's "Publish site" button needs it; you create it in C8. For now, run:
   ```
   firebase functions:secrets:set NETLIFY_BUILD_HOOK
   ```
   and enter `none`.

### C7. Deploy the back end
```
cd functions
npm ci
npm test
cd ..
firebase deploy --only functions,firestore,storage
```
1. The output lists the `submitEnquiry` address. Put it in `NEXT_PUBLIC_ENQUIRY_ENDPOINT` in Netlify.
2. Deploy the site once.

The form now posts to the website's own back end (contract v3), and Web3Forms is no longer used.

### C8. The "Publish site" button (Netlify build hook)
This needs the Git-connected setup (A). A Drop site has no builds to trigger.
1. Netlify → the site → **Site configuration** → **Build & deploy** → **Build hooks** → **Add build hook**: name "Admin publish", branch `main`. Copy the URL.
2. Run `firebase functions:secrets:set NETLIFY_BUILD_HOOK`, paste the URL, then run `firebase deploy --only functions`.

The URL stays in the back end; the browser never sees it.

**Each publish is counted as a production deploy: 15 of the 300 monthly credits.** The admin counts them from its own publish log and shows how many are left. **Watch the credit meter on the first real publish.** Netlify's documentation does not say whether a build started by a build hook is billed as a production deploy (15 credits) or as a branch deploy (0 credits), so the admin assumes the worst case. Open Netlify → Billing → credit usage before and after the first publish and note what it cost; if it is 0, the admin's credit figure is only a safe over-estimate. It refuses a second publish within 2 minutes. Make all your edits first, then publish once.

If Firebase can't be reached during a Netlify build, the build carries on from the last saved snapshot (`src/generated/cms-*.json`) and says so in the deploy log. It never breaks the site.

### C9. The first admin user
1. Firebase → **Authentication** → **Users** → **Add user**: the admin's email and a strong password. Copy the **User UID**.
2. **Firestore** → **Start collection** `admins` → Document ID: paste the UID. Add a field `email` (string) holding the email, then Save.
3. Open `https://<your site>/admin` and sign in. "Forgot password" sends a reset email.

- **To add another admin:** repeat C9.
- **To remove an admin:** delete their `admins` document. Also delete the user if they shouldn't sign in at all.

### C10. Checks
1. Send a test enquiry from the Contact page. It should appear in **/admin → Enquiries** within seconds. If C6.2 is set up, the owner email should arrive too.
2. Run `curl.exe -I https://<your site>/admin`. It should show `X-Robots-Tag: noindex, nofollow, noarchive`. Check that `/admin` is not in `sitemap.xml`.
3. In the admin, change something small (e.g. Site settings → office hours), save, then press **Publish site**. A new deploy should appear in Netlify within a minute, and the change goes live a few minutes later.

### C11. The CRM link (later)
When the CRM's API exists, go to **/admin → Site settings → CRM link** and enter its address and key.
- The key goes to a back-end-only document that no browser can read back.
- Each new enquiry is then also sent to the CRM, and its status shows on the enquiry.
- Syncing projects from the CRM is prepared but not built yet (`functions/src/crm.js`, TODO).

---

## If something goes wrong

| What you see | Likely cause | Fix |
|---|---|---|
| Git build fails at `npm ci` or with a Node version error | Node version mismatch | `netlify.toml` sets Node 24.11.1; don't override **Node version** in the Netlify UI. |
| Site shows "Page not found" on every page after Drop | The `Website` folder (or files inside `out`) was dropped instead of `out` itself | Drag the `out` folder itself. |
| Security headers missing | `_headers` not uploaded | Rebuild; check `out\_headers` exists; upload `out` again. |
| Old page still shows after a deploy | Browser cache | Reload with Ctrl+Shift+R, or try a private window. |
| "Site not available" on every page | Monthly credits used up | Wait for the monthly reset, or upgrade the plan. See README "Free plan". |
| Enquiries arrive at the wrong email | Web3Forms key belongs to another account | Create the key with the right email, update the setting, rebuild. |
| /admin says "Demo mode" on the live site | The Firebase settings were empty when the site was built | Set the five `NEXT_PUBLIC_FIREBASE_…` settings (C4) and deploy again. |
| /admin: "No admin access" | The account has no `admins` document | C9 step 2, with the exact User UID. |
| Enquiry form shows an error after C7 | The site's address is not in `SITE_ORIGINS` | Add it in `functions/.env` (C6), then `firebase deploy --only functions`. |
| "Publish site" says the build hook is not set up | `NETLIFY_BUILD_HOOK` is still `none` | C8. |
