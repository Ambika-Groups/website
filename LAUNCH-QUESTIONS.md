# Launch questions

Everything the website still needs from you before it can go live, in plain words. Answer them one by one, in any order: **Part 1 first** (the site should not launch without these), then Part 2 as you can.

- **Where the answer goes** says exactly where to type it. **Quick path:** most answers can be typed straight into `src/config/launch-answers.ts` (each entry is named after its question, e.g. `q5_phone` answers Q5), then rebuild. That needs no admin or Firebase account. **Long term:** the admin (**/admin → Site settings**, then **Publish site**). When both have an answer, the admin wins; `npm run launch-check` says which answers come from the file and which from the admin.
- **If skipped** says what visitors will see. Part 2 questions are **safe to skip**: the site hides that section or uses a safe default instead of showing placeholder text.
- **Status** shows where each question stands after the owner's answers (answered, skipped, or coming later); tick it for any you answer yourself. Then run `npm run launch-check`: it lists what is still missing, using these question numbers (Q1, Q2, …), and says READY when Part 1 is done and no placeholder is visible.

39 questions: 16 must-have, 23 nice-to-have.

<!-- Generated from scripts/launch-questions.mjs by `npm run launch-questions`. Edit that file, not the questions below. -->

## Part 1: Must-have before launch

### Whole site

#### Q1. What is the website's real address (domain)?
<!-- q:siteUrl -->

- **Example answer:** https://www.ambikagroup.in (with https://, no slash at the end)
- **If skipped:** Page links, the sitemap, robots.txt and the WhatsApp/Google share previews all point to www.example.com, so search engines and link previews are wrong.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q1_siteUrl`, save and rebuild (no admin needed). **Long term:** Netlify → Site configuration → Environment variables → NEXT_PUBLIC_SITE_URL (then deploy). For a local build: .env.local.
- **Used on:** Whole site
- **Owner's answer and notes:** Intended domain: ambikagroups.tech (owned, not yet connected to this website). Left as the pending item on purpose: canonical links, the sitemap and robots.txt must use the address the site is really served from, so nothing is set until it is connected. Then type it into q1_siteUrl.
- **Status:** [ ] Answer coming later

#### Q2. Where should enquiries go? Give your Web3Forms access key, or (once the website back end is set up) the address of its submitEnquiry function.
<!-- q:enquiryDelivery -->

- **Example answer:** Web3Forms key a1b2c3d4-…  (sign up at web3forms.com with the email that should receive enquiries)
- **If skipped:** The enquiry form cannot deliver anything: visitors see 'could not be sent' and every enquiry is lost.
- **Where the answer goes:** Netlify environment variables → NEXT_PUBLIC_WEB3FORMS_KEY, or NEXT_PUBLIC_ENQUIRY_ENDPOINT (DEPLOY.md, section C7).
- **Used on:** Whole site
- **Owner's answer and notes:** Web3Forms stays the delivery for now; the key is in .env.local (set NEXT_PUBLIC_WEB3FORMS_KEY in Netlify as well before deploying). Later, enquiries go to the website's own database through submitEnquiry: see docs/BACKEND-PLAN.md.
- **Status:** [x] Answered

#### Q3. Which email address should receive a notification for each enquiry? (Only if you use the website back end; with Web3Forms the email goes to the address of your Web3Forms account.)
<!-- q:ownerEmail -->

- **Example answer:** enquiries@ambikagroup.in
- **If skipped:** With the back end switched on, enquiries are stored in the admin inbox but no email is sent. With Web3Forms this question does not apply.
- **Where the answer goes:** functions/.env → OWNER_EMAIL, and the Resend key (DEPLOY.md, section C6).
- **Used on:** Whole site
- **Owner's answer and notes:** ambikagroups.tech@gmail.com. Not used yet: with Web3Forms the notification goes to the email of the Web3Forms account. It becomes OWNER_EMAIL when the website back end exists.
- **Status:** [x] Answered

#### Q4. Is the trading name 'Ambika Group' or 'Ambika Groups'?
<!-- q:tradingName -->

- **Example answer:** Ambika Groups
- **If skipped:** The site keeps 'Ambika Groups'. Skipping is safe only if that spelling is right; please confirm it.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q4_tradingName`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → Company details → Trading name
- **Used on:** Whole site
- **Owner's answer and notes:** "Ambika Groups" (with the s), now used everywhere on the site: header, footer, titles, structured data, the privacy text, the consent sentence and the share image. One exception: the email sender label "Ambika Group Website" is a fixed value in the enquiry contract and was left as is.
- **Status:** [x] Answered

### Contact

#### Q5. What is the main phone number customers should call?
<!-- q:phone -->

- **Example answer:** As shown: +91 98765 43210   For dialling: +919876543210
- **If skipped:** The site shows [+91 00000 00000] and every Call button dials 0000000000.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q5_phone`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → Contact details → Phone, as shown / Phone, for dialling
- **Used on:** Contact (also in the header menu, footer and every Call button)
- **Owner's answer and notes:** +91 79056 46351.
- **Status:** [x] Answered

#### Q6. What is the WhatsApp number?
<!-- q:whatsapp -->

- **Example answer:** As shown: +91 98765 43210   Number: 919876543210 (digits only, with 91)
- **If skipped:** The WhatsApp buttons open a chat with the placeholder number 910000000000.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q6_whatsapp`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → Contact details → WhatsApp, as shown / WhatsApp number
- **Used on:** Contact (also the floating WhatsApp button)
- **Owner's answer and notes:** The same number, 917905646351.
- **Status:** [x] Answered

#### Q7. Which email address should the site show for enquiries?
<!-- q:email -->

- **Example answer:** info@ambikagroup.in
- **If skipped:** The email row is left out of the footer and Contact page. Customers who prefer email have no address.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q7_email`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → Contact details → Enquiry email
- **Used on:** Contact (also the footer and Privacy page)
- **Owner's answer and notes:** ambikagroups.tech@gmail.com.
- **Status:** [x] Answered

#### Q8. What is the office address? Give the address line, city, state and PIN code.
<!-- q:address -->

- **Example answer:** 12 Station Road, Lucknow, Uttar Pradesh, 226001
- **If skipped:** The office row and the map are left out of the Contact page and footer, and search engines get no address for the business.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q8_address`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → Contact details → Address line, City, State, PIN code
- **Used on:** Contact (also the footer, About and the map)
- **Owner's answer and notes:** A-329/1, Bengali Colony (बंगाली कॉलोनी), Bhagwanpur, Varanasi, Uttar Pradesh. No PIN code was given, so none is shown or guessed; the address reads correctly without it (add it in q8_address when known). The Devanagari part is read as Hindi and is not used in the footer.
- **Status:** [x] Answered

#### Q9. Do you approve the wording of the Contact page (headline, 'What happens next' steps and the six FAQ answers), or what should change?
<!-- q:contactCopy -->

- **Example answer:** Approved. Change FAQ 3 to: 'We visit the site within 3 working days.'
- **If skipped:** The draft wording stays live. It makes statements about your process ('we visit the site before quoting'), so only skip if they are true.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q9_contactCopyApproved`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → Wording → 'draft wording is approved' switch. Changes: src/content/en/contact.ts
- **Used on:** Contact
- **Owner's answer and notes:** Approved by the owner.
- **Status:** [x] Answered

### Privacy

#### Q10. Has your advocate read and approved the Privacy policy text, including the 'Who handles it' paragraphs (Google Cloud, Resend, Web3Forms)? It should comply with India's Digital Personal Data Protection Act, 2023.
<!-- q:privacyApproved -->

- **Example answer:** Yes, approved on 12 November 2026 (switch the 'approved' option on).
- **If skipped:** The Privacy page keeps a visible 'Draft, not yet approved' notice and square brackets around the drafted paragraphs.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q10_privacyApproved`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → Privacy policy → approved switch (and the advocate's changes in src/content/en/privacy.ts)
- **Used on:** Privacy
- **Owner's answer and notes:** The owner approved it and it is live, without the draft banner. The advocate has NOT reviewed it yet and will adjust it later, so advocate review is still advised. The 'Who handles it' text was rewritten to describe what really happens now (the form goes through Web3Forms and is emailed to you); the earlier draft described a database and email service that do not exist yet. Update it before any new service starts handling enquiries.
- **Status:** [x] Answered

#### Q11. How long do you keep enquiry details?
<!-- q:retention -->

- **Example answer:** For as long as the enquiry or project is active, and then for 2 years.
- **If skipped:** The 'How long we keep it' section shows a bracketed placeholder.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q11_retention`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → Privacy policy → How long enquiries are kept
- **Used on:** Privacy
- **Owner's answer and notes:** Published: "We keep enquiry details for as long as the enquiry or project is active and for our business records afterwards. You can ask us to delete your details at any time by calling or emailing us." The owner asked for "2 years" but keeps the data longer; a notice must say what is true. A real 2-year period needs an automatic cleanup first (docs/BACKEND-PLAN.md, section 5).
- **Status:** [x] Answered

#### Q12. What date should the Privacy page show as 'Last updated'?
<!-- q:lastUpdated -->

- **Example answer:** 12 November 2026
- **If skipped:** The 'Last updated' line is left out of a production build.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q12_lastUpdated`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → Privacy policy → “Last updated” date
- **Used on:** Privacy
- **Owner's answer and notes:** The owner said "31 June 2026", which is not a date (June has 30 days). 30 June 2026 is used: please confirm.
- **Status:** [x] Answered

### Services

#### Q13. Are the work lists and client types on the five service pages correct (Construction, Road works, Interlocking and paver, Real estate, Plumbing and sewage)?
<!-- q:servicesCopy -->

- **Example answer:** Correct. Add 'Retaining walls' to Construction.
- **If skipped:** The draft lists stay live. They describe what you do, so wrong items would be public.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q13_servicesCopyApproved`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → Wording → approved switch. Changes: src/content/en/services.ts
- **Used on:** Services (four pages)
- **Owner's answer and notes:** Approved by the owner for the four pages. The fifth page, Plumbing and sewage, was drafted from the owner's one-line description (plumbing services, sewage treatment, large sewage projects, city sewage pipelines): please read it.
- **Status:** [x] Answered

### Government work

#### Q14. Is the Government work page correct: the types of work, and the four steps of 'How we take on tendered work'?
<!-- q:governmentCopy -->

- **Example answer:** Correct. We do not do repair and resurfacing, please remove it.
- **If skipped:** The draft text stays live and makes claims about how you handle tenders.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q14_governmentCopyApproved`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → Wording → approved switch. Changes: src/content/en/government.ts
- **Used on:** Government work
- **Owner's answer and notes:** Approved by the owner.
- **Status:** [x] Answered

### Home and About

#### Q15. Do you approve the Home page headline, the four 'how it works' steps, and the About page's 'Who we work for' text?
<!-- q:homeCopy -->

- **Example answer:** Approved.
- **If skipped:** The draft wording stays live.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q15_homeCopyApproved`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → Wording → approved switch. Changes: src/content/en/home.ts, about.ts
- **Used on:** Home and About
- **Owner's answer and notes:** Approved by the owner.
- **Status:** [x] Answered

### Enquiry form

#### Q16. Do you approve the consent sentence under the enquiry form: 'I agree that Ambika Groups may contact me about this enquiry by phone, WhatsApp or email, as described in the privacy policy.'?
<!-- q:consentCopy -->

- **Example answer:** Approved (or the advocate's exact wording).
- **If skipped:** The draft sentence stays. It is the visitor's legal consent, so have the advocate confirm it.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q16_consentCopyApproved`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → Wording → approved switch. Changes: src/content/en/form.ts
- **Used on:** Enquiry form (every page with a form)
- **Owner's answer and notes:** Approved, with the new name "Ambika Groups".
- **Status:** [x] Answered

## Part 2: Nice-to-have (safe to skip)

### Whole site

#### Q17. Will you use the website back end (admin inbox, analytics, blog and 'Publish site')? It needs the Firebase project from DEPLOY.md section C.
<!-- q:backend -->

- **Example answer:** Yes, we will create the Firebase project this week.
- **If skipped:** The site works as a normal website: enquiries are emailed through Web3Forms, /admin stays a demo with sample data, and there is no blog. Skipping is safe.
- **Where the answer goes:** DEPLOY.md, section C (Firebase project, five NEXT_PUBLIC_FIREBASE_* settings, first admin).
- **Used on:** Whole site
- **Owner's answer and notes:** No website back end (Firebase project) for now. The plan for later is in docs/BACKEND-PLAN.md.
- **Status:** [ ] Skipped by the owner (safe to skip)

### Contact

#### Q18. What are the office hours?
<!-- q:hours -->

- **Example answer:** Mon–Sat, 10:00–18:00
- **If skipped:** The hours line is left out of the Contact page and the call-us panels.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q18_hours`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → Contact details → Office hours
- **Used on:** Contact
- **Owner's answer and notes:** Mon–Sat, 9:00–17:00.
- **Status:** [x] Answered

#### Q19. Which city or region do you mainly serve?
<!-- q:serviceArea -->

- **Example answer:** Lucknow and nearby districts
- **If skipped:** The service-area row is left out of the Contact and About pages, and search engines get no service area.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q19_serviceArea`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → Contact details → Service area
- **Used on:** Contact (also About)
- **Owner's answer and notes:** Varanasi, and across Uttar Pradesh and other states.
- **Status:** [x] Answered

#### Q20. What is the Google Maps link for the office? (Google Maps → your office → Share → Copy link.)
<!-- q:mapUrl -->

- **Example answer:** https://maps.app.goo.gl/AbCdEf123
- **If skipped:** The map searches your address instead, which works but may point to the wrong building.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q20_mapUrl`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → Contact details → Google Maps link
- **Used on:** Contact
- **Owner's answer and notes:** https://maps.app.goo.gl/9e9VVzyVNkRT2brB6
- **Status:** [x] Answered

#### Q21. Do you have your own YouTube video for the Contact page? Give its link. (The layout was built with a video from another channel, which must not go live.)
<!-- q:videoId -->

- **Example answer:** https://www.youtube.com/watch?v=AbCdEfGhIjK
- **If skipped:** The video section is hidden in a production build.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q21_videoId`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → Contact page video
- **Used on:** Contact
- **Owner's answer and notes:** No video yet. The Contact page shows a neutral "Video coming soon" frame in the same layout (nothing from YouTube loads). Send a YouTube link when there is one.
- **Status:** [ ] Answer coming later

#### Q22. Do you want to promise how fast you call back? If yes, in what words? If not, leave it empty.
<!-- q:responseTime -->

- **Example answer:** We call you back within one working day.
- **If skipped:** No response-time promise is made anywhere on the site (the safe default).
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q22_responseTime`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → Wording → Response-time promise
- **Used on:** Contact (also the form success message and the closing band)
- **Owner's answer and notes:** "We usually call you back within 1 to 6 hours." Used on the Contact page, the form's success message and the closing band.
- **Status:** [x] Answered

### Company details

#### Q23. What is the registered legal name, exactly as on the GST certificate?
<!-- q:legalName -->

- **Example answer:** Ambika Infra Projects Private Limited
- **If skipped:** The 'Registered name' row is left out of About.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q23_legalName`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → Company details → Registered legal name
- **Used on:** Company details (About)
- **Owner's answer and notes:** "Ambika Groups", dictated without a registered suffix: please confirm the exact spelling against the GST certificate.
- **Status:** [x] Answered

#### Q24. What is the GSTIN?
<!-- q:gstin -->

- **Example answer:** 09ABCDE1234F1Z5
- **If skipped:** GSTIN is left out of the footer, About and Government work pages.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q24_gstin`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → Company details → GSTIN
- **Used on:** Company details (footer, About, Government work)
- **Owner's answer and notes:** 09AGTPO8309F1ZU.
- **Status:** [x] Answered

#### Q25. What is the company PAN?
<!-- q:pan -->

- **Example answer:** ABCDE1234F
- **If skipped:** PAN is left out of the Government work page.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q25_pan`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → Company details → PAN
- **Used on:** Company details (Government work)
- **Owner's answer and notes:** Skipped. It is not derived from the GSTIN.
- **Status:** [ ] Skipped by the owner (safe to skip)

### Government work

#### Q26. What are your contractor registrations, class and other empanelments? Give each with its number.
<!-- q:registrations -->

- **Example answer:** Contractor registration | PWD UP, Reg. No. 12345 / Contractor class | Class A
- **If skipped:** The 'Registrations' section is left out of Government work, and the line is left out of Home. Departments often look for this, so it is worth adding.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q26_registrations`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → Government work → Registrations
- **Used on:** Government work (also Home)
- **Owner's answer and notes:** Skipped: the Registrations section stays out of the Government work page.
- **Status:** [ ] Skipped by the owner (safe to skip)

#### Q27. Besides Nagar Nigam and PWD, which other departments have you worked with?
<!-- q:departments -->

- **Example answer:** Jal Nigam / Lucknow Development Authority
- **If skipped:** Only Nagar Nigam and PWD are listed.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q27_departments`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → Government work → More departments
- **Used on:** Government work (also Home)
- **Owner's answer and notes:** Jal Nigam Varanasi, Jal Kal Vibhag (Jalkal Vibhag), Irrigation Department, in addition to Nagar Nigam and PWD.
- **Status:** [x] Answered

### Projects

#### Q28. Which finished or running projects do you want to show? For each: title, service, location, year, a one- or two-sentence summary, the scope of work and the photos.
<!-- q:projects -->

- **Example answer:** Colony CC road, Road works, Barabanki, 2025, 'About 800 m of CC road with side drains for a housing society', photos ×4
- **If skipped:** The Projects links, the Home showcase and the Projects page content are left out (the page says the gallery is being prepared and is hidden from search engines).
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q28_projects`, save and rebuild (no admin needed). **Long term:** /admin → Projects → New project, then switch 'Show on website' on and Publish.
- **Used on:** Projects (also Home)
- **Owner's answer and notes:** Coming later with titles, scope and 3 to 4 photos each. The Projects links stay hidden until then.
- **Status:** [ ] Answer coming later

#### Q29. Which real estate projects are current or upcoming? Give the name, location, unit types and status or launch date.
<!-- q:realEstate -->

- **Example answer:** Ambika Residency | Lucknow, 2 and 3 BHK, booking open
- **If skipped:** The project list is left out of that service page.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q29_realEstateProjects`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → Real estate projects
- **Used on:** Projects (the Real estate development service page)
- **Owner's answer and notes:** Coming later with the projects.
- **Status:** [ ] Answer coming later

### About

#### Q30. How did the company start, and what does it do today? Two short paragraphs, in your own words. Only facts you are happy to publish.
<!-- q:aboutStory -->

- **Example answer:** Ambika Groups started in 2009 building houses in Lucknow… /  / Today we build houses, roads and paver areas across…
- **If skipped:** The 'Who we are' section is left out of About.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q30_aboutStory`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → About page → Company story
- **Used on:** About
- **Owner's answer and notes:** Skipped: the section is left out.
- **Status:** [ ] Skipped by the owner (safe to skip)

#### Q31. Do you want to show the people who lead the company? If yes: names and roles, and a photo for each.
<!-- q:aboutPeople -->

- **Example answer:** Ramesh Verma | Founder and Managing Director (photo: photos/team-1.jpg)
- **If skipped:** The 'Leadership' section is left out of About.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q31_aboutPeople`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → About page → People shown; photos: Website\photos\team-1.jpg, team-2.jpg, …
- **Used on:** About
- **Owner's answer and notes:** Skipped: the section is left out.
- **Status:** [ ] Skipped by the owner (safe to skip)

### Home

#### Q32. What are four true figures about the company? (Years of work, projects completed, districts served, kilometres of road.) Real figures only.
<!-- q:numbers -->

- **Example answer:** 15+ years of work | 140 projects completed | 9 districts served | 35 km of road
- **If skipped:** The 'Work that adds up' section is hidden in production.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q32_numbers`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → '“In numbers” section' (fill all four, then switch it on)
- **Used on:** Home (also About)
- **Owner's answer and notes:** Skipped: the section stays hidden.
- **Status:** [ ] Skipped by the owner (safe to skip)

#### Q33. Which clients may we name, and which certificates do you hold? Only clients who agreed to be named.
<!-- q:trust -->

- **Example answer:** Clients: Nagar Nigam Lucknow, Shree Housing Society / Certificates: ISO 9001:2015
- **If skipped:** The 'Trusted by' section is hidden in production.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q33_trusted`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → '“Trusted by” section' (add at least one client, then switch it on)
- **Used on:** Home (also About)
- **Owner's answer and notes:** Skipped: the section stays hidden.
- **Status:** [ ] Skipped by the owner (safe to skip)

### Footer

#### Q34. Is there one line about your work you want as the big closing statement in the footer?
<!-- q:closingStatement -->

- **Example answer:** Houses, roads and paved ground, built to specification.
- **If skipped:** The footer shows the plain line 'Planning a project?'.
- **Where the answer goes:** **Quick path:** open `src/config/launch-answers.ts`, fill `q34_closingStatement`, save and rebuild (no admin needed). **Long term:** /admin → Site settings → Wording → Closing statement
- **Used on:** Footer (every page)
- **Owner's answer and notes:** Skipped: the footer shows the plain line "Planning a project?".
- **Status:** [ ] Skipped by the owner (safe to skip)

### Photos and brand

#### Q35. Do you have your own photos of your finished work? We need: one wide photo for Home, one for each of the five services, one for About, and one for the closing band. Phone photos are fine; we remove location data.
<!-- q:photos -->

- **Example answer:** hero.jpg, service-construction.jpg, service-road-works.jpg, service-interlocking-paver.jpg, service-real-estate-development.jpg, about.jpg, closing.jpg
- **If skipped:** Free stock photos stay, each labelled 'Illustrative photo' so nobody mistakes them for your work.
- **Where the answer goes:** Website\photos\ (file names as in the example), then rebuild. See photos/README.md and CONTENT-CHECKLIST.md.
- **Used on:** Photos and brand (Home, Services, About, closing band)
- **Owner's answer and notes:** Placeholders for now (labelled "Illustrative photo"). Where each photo goes: photos/README.md. The new Plumbing and sewage service has no photo and shows none until one is added.
- **Status:** [ ] Answer coming later

#### Q36. Do you have a logo file? (SVG or a large PNG, with a transparent background if possible.)
<!-- q:logo -->

- **Example answer:** ambika-logo.svg
- **If skipped:** The red 'AG' mark stays in the header and the browser tab.
- **Where the answer goes:** Send the file; it replaces src/components/BrandMark.tsx, public/icon.svg and public/apple-icon.png.
- **Used on:** Photos and brand (header and browser tab)
- **Owner's answer and notes:** The red "AG" mark stays for now. Dropping logo.svg or logo.png into photos/ replaces it in the header, footer and browser tab with no code change (photos/README.md).
- **Status:** [ ] Answer coming later

#### Q37. Which picture should appear when the site is shared on WhatsApp or Facebook? (1200 × 630 pixels.)
<!-- q:ogImage -->

- **Example answer:** A wide photo of your best project with the logo.
- **If skipped:** The generic share image (red 'AG' card) is used.
- **Where the answer goes:** public/og.png
- **Used on:** Photos and brand (link previews)
- **Owner's answer and notes:** Skipped: the generic share card is used (it now carries the new name).
- **Status:** [ ] Skipped by the owner (safe to skip)

### Blog

#### Q38. Do you want to publish blog articles (tips for house owners, tender notes)? They are written in /admin → Blog.
<!-- q:blog -->

- **Example answer:** Yes, one article a month.
- **If skipped:** There is no Blog link; the /blog page exists but is hidden from search and the menu.
- **Where the answer goes:** /admin → Blog → New post (needs the back end, section C of DEPLOY.md).
- **Used on:** Blog
- **Owner's answer and notes:** Needs the website back end: see docs/BACKEND-PLAN.md.
- **Status:** [ ] Answer coming later

### Languages

#### Q39. Do you want a Hindi version of the website?
<!-- q:hindi -->

- **Example answer:** Yes, for Home, Services and Contact first.
- **If skipped:** The site is English only (the Hindi pages are not built yet).
- **Where the answer goes:** Translations to be supplied; code in src/content/hi/ (README.md, 'Adding Hindi').
- **Used on:** Languages
- **Owner's answer and notes:** Skipped: English only for now. The plan keeps room for Hindi (docs/BACKEND-PLAN.md, section 6).
- **Status:** [ ] Skipped by the owner (safe to skip)

---

After the answers: `npm run launch-check`, then deploy (DEPLOY.md, "The launch order").
