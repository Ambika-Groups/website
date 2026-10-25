import type { ReactNode } from "react";
import { getContent } from "@/content";
import { routes } from "@/config/routes";
import { localePath, type Locale } from "@/i18n/config";
import { BusinessJsonLd } from "./BusinessJsonLd";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { MotionObserver } from "./MotionObserver";
import { UtmCapture } from "./UtmCapture";
import { WhatsAppButton } from "./WhatsAppButton";

/** Everything inside <body> that every page shares. Used by each locale's root layout. */
export function SiteShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  const t = getContent(locale).common;
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-surface focus:px-4 focus:py-3"
      >
        {t.skipToContent}
      </a>
      <Header locale={locale} t={t} />
      <main id="main">{children}</main>
      <Footer locale={locale} t={t} />
      <WhatsAppButton
        label={t.whatsappButton.label}
        shortLabel={t.whatsappButton.shortLabel}
        prefill={t.whatsappButton.prefill}
        hiddenOn={[localePath(locale, routes.contact)]}
      />
      <UtmCapture />
      <MotionObserver />
      <BusinessJsonLd />
    </>
  );
}
