# Ambika Group brand and UI rules

Shared by the company website (`Website\`) and the CRM (`CRM\`).
Owner: supervisor session `ambikagroups-3f`. **Version 3, 25 Oct 2026.** Version 2 replaced version 1 and follows the user's design direction. Version 2.1 added four things: how Plex digits behave, Western digits on Hindi screens, who owns the chart palette, and the badge style. Version 2.2 moved the CRM's theme switch on phones into the ⋮ menu. **Version 3 adds a website-only section, "Website: premium editorial direction",** based on the user's transformation brief (`docs\website-design-brief.md`). Where that section and the rest of this file disagree, the website follows that section. The CRM keeps everything else as it is.

Each app implements these values in its own CSS variables and Tailwind theme. Don't change a value in one app only. Send the change to the supervisor, who updates this file and tells both workers.

## What changed from version 1
- **Colours:** red and white replace the spec's blue and teal. Spec §4A.3 allows a brand colour to replace the blue, and the user chose red.
- **Corners:** square (0 radius) everywhere, replacing the 8–12 px radius in §4A.2 and §4A.8.
- **Typeface:** IBM Plex Sans and IBM Plex Sans Devanagari replace Inter and Noto Sans Devanagari. This was the supervisor's choice: the pair is designed together, so Hindi and English stay balanced, and it avoids the generic template look.
- **Style:** Material Design 3 is the reference for behaviour, with the overrides below.
- **Theme:** both apps get a visible light/dark switch.
- **Body weight:** 400 is confirmed for body text.

## The user's direction
- **Red and white.** White dominates. Red marks the brand, the main action, and where you are. Everything else is neutral grey.
- **Material.** Solid, flat surfaces with a clear hierarchy, as in Material Design. Elevation is only for things that float. Buttons look like buttons.
- **Sharp edges.** Square corners on everything.
- **Professional, clean, straightforward.** Not the generic AI-generated look (see the last section).
- **Built for non-technical users.** Anyone can understand every screen without training.
- **Fully responsive** on phones, tablets and desktops.

## Name
The spec text says "Ambika Group", but the logo note in §4A.5 says "AG / Ambika Groups". Use **Ambika Group** until the user confirms the legal name. No logo has been supplied yet, so use an "AG" text mark plus the name as a placeholder.

## Colours

| Token | Light | Dark | Use |
|---|---|---|---|
| Page background | #FFFFFF (website), #F5F5F5 (CRM) | #121212 | |
| Surface | #FFFFFF | #1E1E1E | Cards, tables, forms, website section bands in dark |
| Section band | #F5F5F5 | #1E1E1E | Website alternating sections |
| Elevated | #FFFFFF + shadow | #262626 | Menus, dialogs, bottom sheets |
| Divider | #E0E0E0 | #3A3A3A | Decorative lines only |
| Input border | #858585 | #7A7A7A | Every form field |
| Primary text | #1F1F1F | #F2F2F2 | |
| Secondary text | #5F5F5F | #B3B3B3 | Hints, captions, **placeholders**: use full strength, never reduced opacity |
| Brand red: text, links, icons, active item | #C62828 | #FF6B6B | |
| Primary button fill | #C62828 | #D32F2F | White label in both themes |
| Primary button hover/pressed | #A31515 | #B71C1C | White label |
| Selected / active background | #FDECEA | #331A1A | Text on it: brand red or primary text |
| Success | #1E7B34 | #81C995 | |
| Warning | #8F5B00 | #FDD663 | |
| Error / overdue | #C62828 | #FF6B6B | Same red as the brand, so always shown with an icon and words |

### Measured contrast (WCAG 2.x)

**Light theme:**
- White on #C62828: 5.62. #C62828 as text on #FFFFFF / #F5F5F5 / #FDECEA: 5.62 / 5.16 / 4.92.
- White on #A31515: 7.85.
- Text: #1F1F1F scores 16.48. #5F5F5F scores 6.39 / 5.86 on #FFFFFF / #F5F5F5.
- Input border #858585: 3.69 / 3.38 on #FFFFFF / #F5F5F5.
- Status: success #1E7B34 scores 5.33 / 4.89; warning #8F5B00 scores 5.73 / 5.26.

**Dark theme:**
- White on #D32F2F: 4.98. The button stands out from #121212 / #1E1E1E at 3.76 / 3.35.
- White on #B71C1C: 6.57.
- #FF6B6B as text: 6.75 on #121212, 6.01 on #1E1E1E, 5.45 on #262626, 5.81 on #331A1A.
- Text: #F2F2F2 scores at least 13.52; #B3B3B3 scores at least 7.22.
- Input border #7A7A7A: 4.36 / 3.88 / 3.53 on the three dark surfaces.
- Status: success #81C995 scores at least 7.73; warning #FDD663 scores at least 10.79.

### Colour rules
- **Solid red means the main action.** There is one per screen, and it sits in the same place each time.
- **Destructive actions** (delete, cancel, remove) use an outlined red or text button, and always ask for confirmation in plain words.
- **Red also means error**, so errors are never shown by colour alone. Always use an icon plus words that say what went wrong and how to fix it.
- **No red for decoration.** No red body text, and no long text on red. Large red areas are allowed in a few places, with white text: the website's call-to-action band and the brand bar.
- **Status badges** are square and outlined, with an icon and a word. Don't use tinted fills, because status text on tints hasn't been measured.
- **Charts:** the CRM owns the palette, in `CRM/docs/design-tokens.md` §4. It has five colours per theme, is led by the brand red, is checked for contrast and colour blindness, and contains no green. Never rely on red against green alone.
- **Invoices, quotations and contracts (PDF):** the brand red is the single accent (spec §8.4). Check it in print.

## Shape and elevation
- **Radius 0** on cards, buttons, inputs, selects, menus, dialogs, bottom sheets, badges, tags, images, avatars and the theme switch. Only radio buttons and loading spinners are round. In shadcn/ui, set the radius token to 0.
- **Cards and tables** are flat: a 1 px border and no shadow.
- **Elevation only for things that float** above the page:
  - Light theme uses shadow: level 1 for sticky bars, `0 1px 3px rgba(0,0,0,0.12)`; level 2 for menus, dialogs and bottom sheets, `0 4px 16px rgba(0,0,0,0.16)`.
  - Dark theme uses the lighter #262626 surface instead of shadow.
- **Accent bar:** a 3 px red bar marks the active navigation item, and may mark a section heading.
- **Spacing:** a 4/8 px grid, with generous but purposeful spacing.

## Typography
- **Typefaces:** IBM Plex Sans for Latin and IBM Plex Sans Devanagari for Hindi, both from Google Fonts. Load Devanagari only where Hindi is shown.
- **Weights:**
  - body: 400
  - labels and buttons: 500
  - headings: 600
  - nothing heavier
- **Sizes:**
  - body: 16 px (inputs are always 16 px, so phones don't zoom)
  - small text: 14 px
  - tables: 14 px
  - captions: 12 px minimum
  - page titles: 28–32 px, larger for the website hero on desktop
  - CRM KPI values: 28–32 px
- **Line length:** paragraphs stay under about 75 characters.
- **Numerals:** money and quantities must line up in columns.
  - Plex's digits are already equal width: 600 units each, in both the Latin and Devanagari fonts.
  - The Google Fonts build has no `tnum` feature, so `font-variant-numeric: tabular-nums` changes nothing. Keep it in the CSS anyway, in case the font changes later.
  - Hindi screens use Western digits (0–9), not Devanagari digits.
  - Both fonts include the ₹ sign.
- **Indian formats:** currency as ₹1,25,000; dates as 25 Oct 2026.

## Light / dark switch (both apps)
- **The control:** a visible switch with a text label ("Dark mode") and a sun or moon icon. Build it as `role="switch"` with `aria-checked`. It is square, like everything else, with a tap area at least 48 px tall on phones.
- **Website placement:** in the header on tablet and desktop, and at the top of the menu on phones.
- **CRM placement:** in the top bar on tablet and desktop. On phones, it's the first row of the ⋮ menu, as on the website, so the page title is never cut off and the switch keeps its text label. The profile menu keeps Light / Dark / System (spec §4A.4). The choice is saved to the user's profile (`users.theme`) and cached on the device.
- **Defaults:** a first visit follows the device setting. Once the visitor switches, remember the choice (website: `localStorage`, wrapped in try/catch).
- **No flash of the wrong theme:** a tiny inline script in `<head>` sets `data-theme` on `<html>` before first paint. The theme CSS keys off `[data-theme="dark"]`, not only the media query.
- **Browser bar:** update `<meta name="theme-color">` to the current page background.

## Built for non-technical users
- **Plain words:** "Money received", "To pay", "Add expense", "Mark attendance". Where a technical term is unavoidable (EMD, RA bill, GST, BOQ), show its meaning in a short hint the first time it appears on a screen.
- **Labels on every icon.** Every icon has a text label beside it. No icon-only buttons except close and back, and those still have an accessible name.
- **Forms:**
  - one column on phones
  - a label above every field
  - an example in the hint
  - errors next to the field that say how to fix it
  - typed data never lost
- **Confirmations:** before deleting anything or moving money, say exactly what will happen, e.g. "Delete the ₹12,500 cement expense from 25 Oct 2026?"
- **Success messages** say what happened, e.g. "Expense saved. Waiting for approval."
- **Empty states** say what to do next and offer one button.
- **Tap targets** are at least 48 × 48 px on phones and 40 px tall on desktop.
- **Formatting:** numbers and dates are always formatted, never shown as raw values.

## Responsive
- **Breakpoints:** phone below 600 px, tablet 600–1023 px, desktop 1024 px and up.
- **Test widths:** check every screen at 360, 390, 768, 1024, 1280 and 1440 px. 360 px is a low-end Android phone.
- **No horizontal page scroll at any width.** Only wide tables scroll, inside their own container. CRM tables become cards on phones (spec §4A.8).
- **Navigation follows Material patterns:**
  - CRM: bottom navigation on phones (spec §4A.5), a navigation rail with labels on tablets, and the full sidebar on desktop.
  - Website: a menu button on phones, and the full navigation on tablet and desktop. Check 768 px specifically.
- **Content fit:** images scale, and text never overflows its container in either language. Hindi strings run longer.

## Not the generic "AI-generated" look
**Avoid:**
- gradient or mesh backgrounds, blurred colour blobs, glassmorphism, glow
- a big centred hero with gradient text, and sparkle or emoji icons
- rounded everything, pill buttons, soft floating cards with big shadows
- rows of identical feature cards, each with an icon in a coloured circle
- bento grids, scrolling logo marquees, animated counters
- invented numbers such as "500+ projects" or "20 years". Use only real figures, or clearly marked placeholders.
- filler copy such as "Transform your vision into reality", "elevate", "seamless", "unlock", "your trusted partner"
- fake testimonials or client logos

**Do:**
- Use real project photographs, with clearly marked placeholders until they arrive.
- Left-align text, with a strong typographic hierarchy on a visible grid.
- Use red decisively in a few places: the brand mark, main actions, the active state, and one band.
- Write specific, factual copy: the services, the kinds of work, the departments served, the area covered.
- Use thin dividers and generous but purposeful spacing.
- Use Material Design 3 (m3.material.io) as the reference for component behaviour, states, navigation and layout, with our overrides: sharp corners, red and white, Plex. Don't add a Material component library. Restyle the stack we already have: Tailwind, plus shadcn/ui in the CRM.

## Motion and tone
- **Motion (CRM, spec §4A.9):** transitions take 150–200 ms and respect `prefers-reduced-motion`. No animated backgrounds, parallax or floating objects. The website has its own motion rules in the next section.
- **Tone:** labels are short, direct and action-oriented. No slang, jokes or emoji.

## Website: premium editorial direction (version 3)
The user asked for a complete visual transformation of the website: "premium architecture firm meets major infrastructure company meets modern editorial design." The full brief is in `docs\website-design-brief.md`. These rules apply to the website only.

**Kept from the rest of this file:**
- the red values in the Colours table
- square corners
- the IBM Plex family
- the light/dark switch, with both themes fully designed
- the contrast rules
- plain words for non-technical visitors (keep "Services"; no "Insights" page without content)
- no invented facts or logos
- one main action per screen

**Palette and balance**
- Aim for roughly 80% refined neutrals, 15% dark architectural contrast and 5% red.
- Add a neutral scale for this: architectural white, a warm off-white, concrete greys, graphite, charcoal and near-black.
- The website worker proposes the exact values, with measured contrast, at the design checkpoint. Once approved, the supervisor adds them here.
- On dark sections, red text uses the dark-theme red (#FF6B6B) or a measured equivalent. #C62828 fails as small text on charcoal.

**Red**
- Use it as a signature: key actions, active states, section markers, key figures and small accents.
- **No large red blocks.** The closing call-to-action becomes a dark section or an image section with a red accent. This replaces the earlier red band.

**Gradients**
- Dark scrims over photographs, so text stays readable, are allowed.
- A barely visible tonal gradient inside a dark section is allowed only if it's shown and approved at the checkpoint.
- No other gradients.

**Typography**
- A display scale using fluid sizing (clamp()): very large statements on desktop (around 72–120 px) and about 40–48 px on phones.
- Editorial headings, and uppercase metadata labels with wide tracking.
- IBM Plex Sans stays. IBM Plex Sans Condensed is allowed for display lines and labels (Latin only; Hindi falls back to Plex Sans Devanagari).
- Weights stay at 600 or below.

**Layout and rhythm**
- No uniform card grids. Use varied compositions: full-bleed images, split screens, asymmetric grids, numbered chapters, featured projects and a horizontal project strip.
- Alternate light, dark and image sections down the page.
- In the dark theme, dark sections must still stand apart from the page, through image, tone or border.

**Technical motifs** (subtle, never a fake blueprint)
- fine grid lines
- section numbers ("01 — Road works")
- coordinate-style labels
- project IDs
- thin technical dividers

**Motion**
- Reveals take 400–700 ms with ease-out, staggered, and only once per element.
- Subtle parallax on large images only.
- Images scale gently on hover, and link arrows nudge.
- Page transitions use the View Transitions API where it's supported.
- Everything turns off under `prefers-reduced-motion`.
- Use CSS and IntersectionObserver, with no heavy animation library.
- No custom cursor, no count-up numbers and no scroll-jacking.

**Numbers and trust sections**
- Build them, but **hide them in production builds until real values or logos exist**, so nothing fake can ship.
- In development they show clearly marked placeholders.

**Photos**
- Until real Ambika photos arrive, use temporary free-licence photos (Unsplash or Pexels). This is the user's decision.
- Tag each one TODO(photo), and list its source and licence in `Website\PHOTO-CREDITS.md`.
- Replace them all before launch.
- No hero video until real footage exists.

**Performance:** it must stay fast on 4G. Every photo goes through the AVIF/WebP srcset pipeline, the hero image is preloaded, and there's no layout shift.
