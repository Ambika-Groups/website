import { hasProjects } from "@/config/launch";
import { routes } from "@/config/routes";
import { telLink, whatsappLink } from "@/config/site";
import type { Dictionary } from "@/content";
import { localePath, type Locale } from "@/i18n/config";
import { BrandMark } from "./BrandMark";
import { SiteHeader } from "./SiteHeader";

/** Server wrapper: resolves locale paths and copy, then hands off to the interactive header. */
export function Header({ locale, t }: { locale: Locale; t: Dictionary["common"] }) {
  return (
    <SiteHeader
      brand={<BrandMark href={localePath(locale, routes.home)} />}
      items={t.nav.items.filter((item) => item.route !== "projects" || hasProjects).map((item) => ({
        href: localePath(locale, routes[item.route]),
        label: item.label,
        // Services opens its own page; the four service pages hang under it (dropdown on wider screens, sub-items in the phone menu).
        ...(item.route === "services" && {
          children: [
            { href: localePath(locale, routes.services), label: t.nav.allServices },
            ...(Object.keys(t.serviceNames) as (keyof typeof t.serviceNames)[]).map((key) => ({
              href: localePath(locale, routes[key]),
              label: t.serviceNames[key],
            })),
          ],
          childrenLabel: t.nav.subMenu,
        }),
      }))}
      quote={{ href: localePath(locale, routes.contact), label: t.actions.requestQuote }}
      overlayOn={localePath(locale, routes.home)}
      labels={{
        nav: t.nav.label,
        open: t.nav.openMenu,
        close: t.nav.closeMenu,
        menu: t.nav.menu,
        theme: t.themeSwitch,
        call: t.actions.call,
        whatsapp: t.actions.whatsapp,
      }}
      contact={{ telHref: telLink(), whatsappHref: whatsappLink(t.whatsappButton.prefill) }}
    />
  );
}
