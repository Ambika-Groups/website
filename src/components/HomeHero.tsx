import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { ENQUIRY_ANCHOR, routes } from "@/config/routes";
import { getContent } from "@/content";
import { localePath, type Locale } from "@/i18n/config";
import { IllustrativeLabel, isTemporaryPhoto, Photo } from "./Photo";
import { arrowClass, button, container } from "./ui";

/**
 * Cinematic hero: full-bleed photo, layered dark scrim, a display statement (Inter Tight) bottom-left (brand.md v4),
 * one red action (magnetic), a quiet fact strip and a scroll cue. Not revealed on scroll: it is the LCP.
 * Scrim: ≥ 0.62 opacity of ink-950 behind all text, so white text stays ≥ 4.5:1 on any photo
 * (tests/contrast-tokens.txt, "OVER PHOTOS").
 */
export function HomeHero({ locale }: { locale: Locale }) {
  const { common, home } = getContent(locale);
  const h = home.hero;
  return (
    // data-whatsapp-hide: the hero has its own quote action, so the floating button steps aside here.
    <section
      data-whatsapp-hide=""
      className="tone-dark relative isolate flex min-h-[max(560px,100svh)] flex-col !border-0 !bg-[#0b0b0c]"
    >
      <Photo
        name="hero" // TODO(photo): temporary stock photo, see PHOTO-CREDITS.md
        priority
        sizes="100vw"
        placeholderLabel={common.placeholder.photo}
        illustrativeLabel={common.placeholder.illustrative}
        labelInFrame={false}
        rounded={false}
        alt={h.imageAlt}
        className="!absolute inset-0 -z-10 !bg-[#0b0b0c]"
      />
      {/* Label above the scrims, top-right just below the header (64 / 112 / 80 px tall). */}
      {isTemporaryPhoto("hero") && (
        <IllustrativeLabel
          text={common.placeholder.illustrative}
          className="absolute top-[76px] right-4 sm:top-[124px] sm:right-8 lg:right-12 xl:top-[92px]"
        />
      )}
      {/* Scrim: overall veil + heavier from the bottom-left where the type sits. Combined darkening
          behind any text ≥ 0.62 (e.g. right end of the headline: 1 − 0.62 × 0.7 × 0.8 ≈ 0.65). */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#0b0b0c]/[0.38]" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(11,11,12,0.92)_0%,rgba(11,11,12,0.6)_45%,rgba(11,11,12,0.15)_80%),linear-gradient(to_right,rgba(11,11,12,0.55),transparent_90%)]"
      />

      <div className={`${container} flex flex-1 flex-col justify-end pt-36 pb-10 sm:pt-44 lg:pb-14`}>
        <p className="t-meta inline-flex w-fit items-center gap-2.5 rounded-full border border-white/20 bg-white/[0.06] px-3.5 py-1.5 text-[#e4dfe1]">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-[#fed0bb]" />
          {h.eyebrow}
        </p>
        <h1 className="t-display mt-6 text-[#f5f3ef]">
          {h.titleLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <p className="t-lead max-w-[52ch] text-[#e4dfe1]">{h.body}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href={`#${ENQUIRY_ANCHOR}`} className={button.primary} data-magnetic="">
              {common.actions.requestQuote}
              <ArrowRight aria-hidden="true" size={18} className={arrowClass} />
            </a>
            <Link href={localePath(locale, routes.projects)} className={button.onImage}>
              {h.secondary}
              <ArrowRight aria-hidden="true" size={18} className={arrowClass} />
            </Link>
          </div>
        </div>

        {/* Fact strip: what the company does and for whom; technical hairline above. */}
        {/* The scroll cue sits beside the <dl>, not inside it: a <dl> may only hold dt/dd groups. */}
        <div className="mt-12 grid grid-cols-1 border-t border-white/15 pt-5 text-[#e4dfe1] sm:grid-cols-[1fr_auto] sm:gap-8">
          <dl className="grid grid-cols-1 sm:grid-cols-2 sm:gap-8">
            {h.facts.map((fact) => (
              <div key={fact.label} className="py-1.5">
                <dt className="t-meta !text-[0.75rem] text-[#b7b0b4]">{fact.label}</dt>
                <dd className="mt-1">{fact.value}</dd>
              </div>
            ))}
          </dl>
          <div className="hidden items-end sm:flex">
            <span className="t-meta inline-flex items-center gap-2 text-[#b7b0b4]">
              {h.scroll}
              <ArrowDown aria-hidden="true" size={16} className="motion-safe:animate-[nudge_2.4s_ease-in-out_3]" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
