import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { ThemeScript } from "@/components/ThemeScript";
import { PageHeader } from "@/components/PageHeader";
import { button } from "@/components/ui";
import { routes } from "@/config/routes";
import { site } from "@/config/site";
import { getContent } from "@/content";
import { plex, plexCondensed } from "./fonts";
import { baseMetadata } from "./metadata";
import "./globals.css";

// Exported as out/404.html, which Netlify serves with status 404 for unknown URLs.
// It is a single static file, so it is English; /hi/... misses also land here.
const { notFound } = getContent("en");

export const metadata: Metadata = {
  ...baseMetadata("en"),
  // Outside the layouts, so the "%s | Ambika Group" template doesn't apply; add the name here.
  title: { absolute: `${notFound.title} | ${site.name}` },
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${plex.variable} ${plexCondensed.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <SiteShell locale="en">
          <PageHeader
            index="404"
            title={notFound.title}
            intro={notFound.body}
            actions={
              <>
                <a href={routes.home} className={button.primary}>
                  {notFound.home}
                </a>
                <a href={routes.contact} className={button.secondary}>
                  {notFound.contact}
                </a>
              </>
            }
          />
        </SiteShell>
      </body>
    </html>
  );
}
