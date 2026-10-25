import Link from "next/link";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { routes } from "@/config/routes";
import { telLink, whatsappLink } from "@/config/site";
import type { Dictionary } from "@/content";
import { localePath, type Locale } from "@/i18n/config";
import { IllustrativeLabel, isTemporaryPhoto, Photo } from "./Photo";
import { arrowClass, button, container } from "./ui";

/**
 * Closing call-to-action for pages without an embedded form (brand.md v3: no red blocks — a dark
 * image section with one red action). Scrim keeps text ≥ 4.5:1 on any photo.
 */
export function CtaBand({ locale, t }: { locale: Locale; t: Dictionary["common"] }) {
  return (
    <section className="tone-dark relative isolate overflow-hidden !border-0 !bg-[#0f0e0d]">
      <Photo
        name="closing" // TODO(photo): temporary stock photo, see PHOTO-CREDITS.md
        parallax
        sizes="100vw"
        placeholderLabel={t.placeholder.photo}
        illustrativeLabel={t.placeholder.illustrative}
        labelInFrame={false}
        alt=""
        className="!absolute inset-0 -z-10 !bg-[#0f0e0d]"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#0f0e0d]/70" />
      {/* Above the scrim, top-left: a corner the bottom-right WhatsApp button never reaches. */}
      {isTemporaryPhoto("closing") && (
        <IllustrativeLabel text={t.placeholder.illustrative} className="absolute top-0 left-0" />
      )}
      <div className={`${container} section-y`}>
        <div className="max-w-4xl" data-reveal="">
          <p className="t-meta flex items-center gap-3 text-[#d8d4cc]">
            <span aria-hidden="true" className="block h-[2px] w-10 bg-brand" />
            {t.actions.requestQuote}
          </p>
          <h2 className="t-display mt-6 text-[#f2f0eb]">{t.ctaBand.title}</h2>
          <p className="t-lead mt-6 max-w-[52ch] text-[#d8d4cc]">{t.ctaBand.body}</p>
        </div>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row" data-reveal="">
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
    </section>
  );
}
