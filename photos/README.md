# Photos and logo

Put original photos here (any size, straight from the camera or phone). The **file name decides where each photo appears**, so name them as below. Then run `npm run build` (or `npm run images`): it makes small, fast AVIF and WebP copies in several sizes in `public/images/`, fixes rotation and **removes all metadata, including GPS location**. You never need to resize or compress a photo yourself.

Names use lowercase letters, digits and hyphens only, and the file type can be `.jpg`, `.jpeg`, `.png`, `.webp` or `.tif`. A slot with no photo shows a marked placeholder in review builds, and is left out of the live site where that is safe (see the last column).

| Where it appears | File name | Notes |
|---|---|---|
| Home, the big opening photo | `hero.jpg` | Wide, landscape. The headline sits over its lower half, so keep the subject in the upper two thirds. |
| The dark closing panel ("Planning a project?"), on most pages | `closing.jpg` | Wide, landscape. Text sits over it. |
| About, next to "Who we are" | `about.jpg` | Portrait or landscape both work. |
| Services page, the Home service list, and the top of each service page | `service-construction.jpg`, `service-road-works.jpg`, `service-interlocking-paver.jpg`, `service-real-estate-development.jpg`, `service-plumbing-sewage.jpg` | One per service. The top photo is wide (about 21:9). With no photo, the **Plumbing and sewage** row and page show no photo at all on the live site. |
| The "Photos of this work" gallery on each service page | `service-road-works-1.jpg`, `service-road-works-2.jpg`, … (the same service name, then `-1`, `-2`, `-3` …) | Any number, from 3 up. With none (for Plumbing and sewage) the gallery section is left out on the live site. |
| A project's main photo, and its gallery | `project-<slug>-1.jpg` (main), `project-<slug>-2.jpg`, `project-<slug>-3.jpg`, `project-<slug>-4.jpg` | `<slug>` is the project's web address name, e.g. `colony-cc-road` gives `project-colony-cc-road-1.jpg`. Give each project 3 to 4 photos. The slug is the one in `src/config/launch-answers.ts` (Q28) or in the admin. |
| About, people shown | `team-1.jpg`, `team-2.jpg`, … | In the same order as the people listed (Q31). With no photo, only the name and role show. Portrait (4:5). |
| Blog article covers | not here | Uploaded in the admin (Blog), and made available to the site automatically (`blog-<slug>.cms.jpg`). |

## Logo

Drop **`logo.svg`** (best: it stays sharp at every size) or **`logo.png`** into this folder and run `npm run build`. The logo then replaces the red "AG" mark in the **header**, the **footer** and the **browser tab and phone home-screen icon**, with no code change. The company name text stays beside it.

- Use a transparent background. A PNG should be at least 400 px wide.
- If the logo is dark and would disappear on the dark theme, or on the dark footer and photo header, also add **`logo-dark.svg`** or **`logo-dark.png`**: a light version. The site shows it on dark backgrounds automatically.
- Remove the file and rebuild to go back to the red "AG" mark.

## The link-preview picture

The picture shown when the site is shared on WhatsApp or Facebook is `public/og.png` (1200 × 630). It is the generic card until a real one replaces it.

## Photo credits

Stock photos still in use are listed in `../PHOTO-CREDITS.md`. They are labelled "Illustrative photo" on the page until your own photos replace them (remove each name from `src/config/photos.ts` when you do).
