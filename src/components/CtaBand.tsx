import Link from "next/link";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { routes } from "@/config/routes";
import { telLink, whatsappLink } from "@/config/site";
import type { Dictionary } from "@/content";
import { localePath, type Locale } from "@/i18n/config";
import { IllustrativeLabel, isTemporaryPhoto, Photo } from "./Photo";
import { arrowClass, button, container } from "./ui";

/**
 * Closing call-to-action for pages without an embedded form (brand.md v4): a rounded dark panel inset in the
 * page, with a photo under a scrim (text ≥ 4.5:1 on any photo) and one red action.
 */
export function CtaBand({ locale, t }: { locale: Locale; t: Dictionary["common"] }) {
  return (
    <section className={`${container} pb-[clamp(4rem,2.5rem+5vw,7rem)]`}>
      <div className="tone-dark relative isolate overflow-hidden rounded-card !bg-[#0b0b0c] shadow-card" data-reveal="">
        <Photo
          name="closing" // TODO(photo): temporary stock photo, see PHOTO-CREDITS.md
          sizes="(min-width: 1440px) 1340px, 100vw"
          placeholderLabel={t.placeholder.photo}
          illustrativeLabel={t.placeholder.illustrative}
          labelInFrame={false}
          rounded={false}
          alt=""
          className="!absolute inset-0 -z-10 !bg-[#0b0b0c]"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#0b0b0c]/72" />
        <div aria-hidden="true" className="hero-glow absolute inset-0 -z-10 opacity-70" />
        {/* Above the scrim, top-left: a corner the bottom-right WhatsApp button never reaches. */}
        {isTemporaryPhoto("closing") && (
          <IllustrativeLabel text={t.placeholder.illustrative} className="absolute top-4 left-4" />
        )}
        <div className="px-6 pt-20 pb-10 sm:px-12 sm:pt-24 sm:pb-14 lg:px-16 lg:pt-28 lg:pb-16">
          <div className="max-w-4xl">
            <p className="t-meta inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/[0.06] px-3.5 py-1.5 text-[#e4dfe1]">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-[#fed0bb]" />
              {t.actions.requestQuote}
            </p>
            <h2 className="t-display mt-6 text-[#f5f3ef]">{t.ctaBand.title}</h2>
            <p className="t-lead mt-6 max-w-[52ch] text-[#e4dfe1]">{t.ctaBand.body}</p>
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href={localePath(locale, routes.contact)} className={button.primary}>
              {t.actions.requestQuote}
              <ArrowRight aria-hidden="true" size={18} className={arrowClass} />
            </Link>
            <a href={telLink()} className={button.onImage}>
              <Phone aria-hidden="true" size={18} />
              {t.actions.call}
            </a>
            <a href={whatsappLink(t.whatsappButton.prefill)} target="_blank" rel="noopener" className={button.onImage}>
              <MessageCircle aria-hidden="true" size={18} />
              {t.actions.whatsapp}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
