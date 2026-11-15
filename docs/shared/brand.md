# Ambika Group brand and UI rules

Shared by the company website (`Website\`) and the CRM (`CRM\`).
Owner: supervisor session `ambikagroups-c8`. **Version 4.1, 26 Oct 2026.** Version 4.1 makes the fonts sharp, at the user's request: Inter Tight headings instead of rounded Fredoka or Baloo 2. The shapes stay rounded.

**Version 4 replaces every earlier version.** The user chose a new palette (#F12136, #B23A48, #FCB9B2, #FED0BB) and asked for the UI of both apps to follow the style of https://clio.praxistence.com/: minimal, with animation and effects. This file records that style as measured from the reference site's own stylesheets, adapted to our palette, and with every colour pair measured. It overrides version 3's square corners, its "no glow / no glassmorphism" rule, and the red-and-white palette.

Each app implements these values in its own CSS variables and Tailwind theme, and keeps its copy in `docs/shared/`. Don't change a value in one app only. Send the change to the supervisor.

## Still in force from earlier versions
- **The user's rules:**
  - plain words for non-technical users
  - a visible light/dark switch, with both themes fully designed
  - fully responsive from 360 to 1440 px
  - large tap targets (48 px on phones)
  - no invented facts, figures or logos
  - one main action per screen
- **Accessibility:**
  - text at least 4.5:1, large text and controls at least 3:1
  - never colour alone to carry meaning
  - visible focus everywhere
  - everything works without motion
- **Formats:** Indian numbers (₹1,25,000), dates as 25 Oct 2026, and Western digits on Hindi screens.
- **CRM:** the PRD's content and function rules (§4A.5–§4A.12) still apply. Only the look changes.

## The reference style, as measured (clio.praxistence.com)
- **Theme:** dark first: a black page with warm off-white text. Light theme too.
- **Type:**
  - a rounded display font (Fredoka) for headings. **We don't follow this:** the user asked for sharp fonts, so see Typography.
  - Inter for body and UI text
  - a monospace (JetBrains Mono) for small labels, metadata and figures
- **Shape:** rounded. Pill buttons (999 px), cards at 20 px (small cards and inputs at 12 px), chips at 6 px.
- **Surfaces:** large soft shadows (`0 30px 60px -35px`), thin translucent borders, and one translucent "glass" surface for the floating header.
- **Effects:**
  - scroll reveal (fade and rise 18 px, 600 ms, staggered)
  - a "spotlight" glow that follows the pointer on cards
  - "magnetic" primary buttons that drift slightly toward the cursor
  - a looping marquee for lists such as integrations
  - small status pings and pulses
- **Motion tokens:** 150 / 300 / 600 / 1200 ms, with ease-out `cubic-bezier(0.16, 1, 0.3, 1)` and spring `cubic-bezier(0.34, 1.56, 0.64, 1)`. Only transform and opacity animate, and every effect has a complete static state under `prefers-reduced-motion` and without JavaScript.

## Colours

| Token | Light | Dark | Use |
|---|---|---|---|
| Page | #FFFDF9 (warm white) | #0B0B0C | |
| Surface (cards) | #FFFFFF | #161416 | |
| Raised (menus, dialogs) | #FFFFFF + shadow | #211D20 | |
| Tint band A | #FED0BB (peach) | #211D20 | Alternating sections; highlights |
| Tint band B (sparing) | #FCB9B2 (pink) | #211D20 | |
| Ink (primary text) | #1A1206 | #F5F3EF | |
| Secondary text | #6B5E57 | #A9A2A6 | **Not on peach or pink bands.** Use ink there. |
| Border, decorative | ink at 8–12% | #F5F3EF at 8–16% | |
| Input and control border | #8C7F78 | #6E676B | |
| **Brand red** (fills, large type, accents) | #F12136 | #F12136 | Primary button fill, key figures, active markers |
| Red as small text or links | #D7192C (#BE1428 on peach) | #FF4A5C | |
| Primary button label | #0B0B0C on #F12136 | #0B0B0C on #F12136 | White on #F12136 is only 4.19:1, so don't use it |
| Primary button hover/pressed | #D7192C, white label | #FF4A5C, #0B0B0C label | |
| **Rose** #B23A48 | Secondary filled buttons (white label), emphasis text | Not as text on dark (3.36:1). Use peach or pink | |
| **Peach / pink as accents** | Fills only (tags, highlight backgrounds) | Accent text and lines (11–14:1) | |
| Glow (spotlight, focus halo) | #F12136 at 10–14% | #FED0BB at 10–14% | |
| Success | #1E7B34 | #81C995 | |
| Warning | #8F5B00 | #FDD663 | |
| Error | #D7192C | #FF4A5C | Always with an icon and words |

### Measured contrast (WCAG 2.x)

**Brand reds:**
- #0B0B0C on #F12136: 4.69. #D7192C with white: 5.17.
- #F12136 vs the page: 4.12 (light) and 4.69 (dark).
- #D7192C on #FFFDF9: 5.09. #BE1428 on peach: 4.50. #FF4A5C on #0B0B0C / #161416 / #211D20: 5.98 / 5.57 / 5.06.

**Rose:** #B23A48 on white 5.85, white on #B23A48 5.85. It fails on peach (4.16), pink (3.54) and black (3.36).

**Ink and secondary text:**
- Ink #1A1206 on #FFFDF9: 18.24. On peach: 13.20. On pink: 11.23.
- Secondary #6B5E57 on #FFFDF9: 6.14. It fails on peach (4.45) and pink (3.78).
- Dark text #F5F3EF: at least 15.02. Dark secondary #A9A2A6: at least 6.66.

**Accents and status in dark:**
- Peach on #161416: 13.05.
- Success, light / dark: 5.25 / 9.36. Warning, light / dark: 5.64 / 13.07.

**Control borders:** #8C7F78 is 3.81 on #FFFDF9. #6E676B is at least 3.03 on every dark surface.

## Typography
- **Headings:**
  - Latin: **Inter Tight** (600), sentence case, slightly negative tracking (about −0.02 em), short two-line headlines.
  - Hindi: **Noto Sans Devanagari** (600).
  - The user asked for sharp fonts (v4.1), so **no rounded faces** (no Fredoka, no Baloo 2).
- **Body and UI:** **Inter** (400 body, 500 labels and buttons, 600 emphasis). Hindi body text uses **Noto Sans Devanagari**.
- **Labels, metadata, IDs and small figures:** **JetBrains Mono** (400–500), uppercase with wide tracking for eyebrows.
- **Money and quantities:** Inter with `tabular-nums`, which Inter supports. In the CRM, all tables and KPIs use Inter tabular, not the mono font.
- **Sizes:**
  - body: 16 px (inputs 16 px)
  - small text: 14 px
  - captions: 12 px minimum
  - display: fluid with clamp(). The website hero runs about 44–96 px; CRM page titles are 28–32 px.
- Load only the weights you use. Devanagari faces load only on Hindi pages or screens.

## Shape and surfaces
- **Radius:**
  - buttons and chips: pill (999 px)
  - cards and panels: 20 px
  - small cards, inputs, selects and menus: 12 px
  - badges: 6 px
  - avatars: round
- **Shadows:** cards use the soft large shadow in light (`0 30px 60px -35px rgba(60,40,10,.35)`). Dark uses a 1 px translucent border plus `0 30px 70px -35px rgba(0,0,0,.9)`.
- **Glass:** only the floating header or top bar, and the phone menu sheet. Use a translucent surface with backdrop blur ≤ 16 px and a thin peach border. Nowhere else.
- **Spacing:** 4/8 px grid, with generous section spacing on the website. The CRM stays compact and data-dense (PRD §4A.6).

## Motion and effects (minimal: use each where it helps, not everywhere)
- **Website:**
  - **scroll reveal:** 600 ms ease-out, 18 px rise, staggered at about 80 ms, once per element
  - **spotlight glow:** on service, project and feature cards
  - **magnetic effect:** on the main call-to-action only
  - **one marquee at most:** the departments or work types strip, which pauses on hover and off-screen and becomes a wrapped list under reduced motion
  - **image hover:** a gentle zoom of about 4%
  - **link arrows:** a nudge on hover
  - **header:** turns glass on scroll
- **CRM:** calm. Use the tokens as follows:
  - 150 ms hover and focus
  - 300 ms panel, menu and dialog opening
  - 600 ms reveal only for dashboard cards, on first load
  - spotlight only on dashboard KPI cards
  - **No magnetic effects, no marquee and no reveal** on tables, forms or attendance. Speed of use comes first.
- **Never:**
  - motion on every element
  - bouncing loops
  - parallax on text
  - scroll-jacking
  - custom cursors
  - count-up numbers
  - auto-playing sound
- Only transform and opacity animate, plus the glow's opacity. Everything turns off under `prefers-reduced-motion`, and content is never hidden without JavaScript.

## Avoid
- Big blocks of bright red. #F12136 is an accent and the main action, not a background, except for one small closing call-to-action panel on the website at most.
- Gradients as decoration. The only gradients allowed are the spotlight glow, photo scrims for legible text, and a soft peach or red glow behind the hero.
- Filler copy, invented numbers, fake testimonials or logos, and emoji.
- Stock photos that suggest they show Ambika's work. Keep the "Illustrative photo" labels.

## Charts (CRM)
- Use a categorical palette led by #F12136, then rose #B23A48, peach, pink and a neutral.
- In light mode, peach and pink fail 3:1 against white, so a chart slice in light mode needs a 1 px ink border, or use darker companion tones.
- Validate contrast and colour-blindness again. The CRM worker owns the exact series values in design-tokens.md §4.
