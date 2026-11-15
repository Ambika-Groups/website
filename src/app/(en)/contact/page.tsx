import type { Metadata } from "next";
import {
  ArrowDown,
  ChevronDown,
  Clock,
  FileText,
  HelpCircle,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  PlayCircle,
  Ruler,
} from "lucide-react";
import type { ReactNode } from "react";
import { ContactIntent } from "@/components/ContactIntent";
import { MapEmbed } from "@/components/MapEmbed";
import { VideoFacade } from "@/components/VideoFacade";
import { button, container } from "@/components/ui";
import { formIds } from "@/config/forms";
import { shown } from "@/config/launch";
import { ENQUIRY_ANCHOR, routes } from "@/config/routes";
import { addressLine, mapsEmbedUrl, mapsLink, site, telLink, whatsappLink } from "@/config/site";
import { getContent } from "@/content";
import { localePath, type Locale } from "@/i18n/config";
import { pageMetadata } from "../../metadata";

const locale: Locale = "en";
const { common, contact, form } = getContent(locale);

export const metadata: Metadata = pageMetadata({
  locale,
  path: localePath(locale, routes.contact),
  title: contact.meta.title,
  description: contact.meta.description,
  absoluteTitle: true,
});

// One icon per "what happens next" tile, in the same order as contact.next.steps.
const stepIcons = [Phone, Ruler, FileText, Lock];

/**
 * Contact, built to double as the landing page for ads: a direct headline and one main action
 * (staggered load-in, a slowly drifting glow, the magnetic call-to-action), then the video (click-to-load, nothing
 * from YouTube before play) beside a slim enquiry card, with "what happens next" under the video. Questions, direct
 * details and the map follow. Every section follows the light/dark theme.
 */
export default function ContactPage() {
  const { hero, video, card, next, faq, details: d } = contact;
  const privacyHref = localePath(locale, routes.privacy);
  // The map searches the office address, so it needs a real one.
  const showMap = shown(site.address.street);
  return (
    <>
      {/* Follows the theme like the rest of the page (no dark-in-both-themes band here), so a theme switch turns the
          whole page at once. */}
      <div className="relative isolate overflow-clip bg-bg pt-16 sm:pt-28 xl:pt-20">
        <div aria-hidden="true" className="hero-glow absolute inset-0 -z-10" />
        {/* A soft peach and red glow behind the headline that drifts slowly (transform and opacity only). */}
        <div
          aria-hidden="true"
          className="glow-drift pointer-events-none absolute top-24 left-1/2 -z-10 h-[34rem] w-[min(60rem,120vw)] -translate-x-1/2"
        />
        <section aria-labelledby="contact-title" className={`${container} pt-12 pb-10 text-center sm:pt-16 lg:pt-20 lg:pb-14`}>
          <div className="mx-auto max-w-5xl">
            {/* Staggered load-in: eyebrow, headline, lead, actions (600 ms ease-out, 90 ms apart). */}
            <p className="rise t-meta inline-flex items-center gap-2.5 rounded-full border border-divider bg-surface/60 px-3.5 py-1.5 text-accent">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-strong" />
              {hero.kicker}
            </p>
            <h1 id="contact-title" className="rise t-display mt-6" style={{ animationDelay: "90ms" }}>
              {hero.titleLead}
              <span className="mt-1 block text-brand-strong">{hero.titleAccent}</span>
            </h1>
            <p className="rise t-lead mx-auto mt-6 max-w-2xl text-text-2" style={{ animationDelay: "180ms" }}>
              {hero.lead}
            </p>
            <div className="rise mt-9 flex flex-col items-center gap-5" style={{ animationDelay: "270ms" }}>
              <a href={`#${ENQUIRY_ANCHOR}`} className={`${button.primary} w-full max-w-md`} data-magnetic="">
                {hero.cta}
                <ArrowDown aria-hidden="true" size={18} />
              </a>
              <p className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-text-2">
                <span>{hero.orTalk}:</span>
                <a
                  href={telLink()}
                  className="inline-flex min-h-11 items-center gap-2 font-medium text-text underline-offset-4 hover:underline"
                >
                  <Phone aria-hidden="true" size={16} className="text-brand" />
                  <span className="tabular">{site.phone.display}</span>
                </a>
                <a
                  href={whatsappLink(common.whatsappButton.prefill)}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex min-h-11 items-center gap-2 font-medium text-text underline-offset-4 hover:underline"
                >
                  <MessageCircle aria-hidden="true" size={16} className="text-brand" />
                  {common.actions.whatsapp}
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Video (about 60%) beside a slimmer enquiry card (about 36%); they stack below 1024 px, video first. Tops align;
            the card holds the full enquiry form, so it is taller than the video, and the video column stays in view
            (sticky) beside it on desktop. */}
        <div className={`${container} pb-16 sm:pb-20 lg:pb-28`}>
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,60fr)_minmax(0,36fr)] lg:gap-[4%]">
            <div className="rise lg:sticky lg:top-32 xl:top-28" style={{ animationDelay: "360ms" }}>
              {/* Switched off in one place: an empty contact.video.id hides the video and its caption. */}
              {video.id && (
                <>
                  <VideoFacade id={video.id} title={video.title} playLabel={video.play} watchOnYoutube={video.watchOnYoutube} />
                  <p className="mt-4 mb-8 flex items-center justify-center gap-2.5 rounded-full border border-divider bg-surface/60 px-4 py-2.5 text-center text-sm">
                    <PlayCircle aria-hidden="true" size={18} className="flex-none text-accent" />
                    {video.caption}
                  </p>
                </>
              )}
              <section aria-labelledby="next-title">
                <h2 id="next-title" className="t-meta text-text-2">
                  {next.label}
                </h2>
                <ol className="mt-4 grid gap-3 sm:grid-cols-2">
                  {next.steps.map((step, i) => {
                    const Icon = stepIcons[i] ?? FileText;
                    return (
                      <li
                        key={step.title}
                        data-spotlight=""
                        data-reveal=""
                        style={
                          {
                            "--reveal-delay": `${i * 80}ms`,
                          } as React.CSSProperties
                        }
                        className="flex gap-4 rounded-field border border-divider bg-surface p-4"
                      >
                        <span
                          aria-hidden="true"
                          className="grid size-10 flex-none place-items-center rounded-full border border-divider text-accent"
                        >
                          <Icon size={18} />
                        </span>
                        <div>
                          <h3 className="font-semibold">{step.title}</h3>
                          <p className="mt-1 text-sm text-text-2">{step.body}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            </div>

            <section
              id={ENQUIRY_ANCHOR}
              aria-labelledby="enquiry-title"
              data-spotlight=""
              className="rise scroll-mt-28 rounded-card border border-divider bg-surface p-5 shadow-card sm:p-7"
              style={{ animationDelay: "450ms" }}
            >
              <p className="inline-flex items-center gap-3 rounded-full border border-divider px-3.5 py-2 text-sm">
                <span aria-hidden="true" className="pulse-dot" />
                {card.badge}
              </p>
              <h2 id="enquiry-title" className="t-h3 mt-5 !text-[1.75rem] sm:!text-[2rem]">
                {card.titleLead} <span className="text-brand-strong">{card.titleAccent}</span>
              </h2>
              <p className="mt-2 text-text-2">{card.intro}</p>
              {/* Call and WhatsApp in reach without opening anything (tap targets of at least 48 px). */}
              <div className="mt-5 grid grid-cols-2 gap-2">
                <a href={telLink()} className={`${button.secondary} min-h-12 px-4`}>
                  <Phone aria-hidden="true" size={18} />
                  {common.actions.call}
                </a>
                <a
                  href={whatsappLink(common.whatsappButton.prefill)}
                  target="_blank"
                  rel="noopener"
                  className={`${button.secondary} min-h-12 px-4`}
                >
                  <MessageCircle aria-hidden="true" size={18} />
                  {common.actions.whatsapp}
                </a>
              </div>
              <div className="mt-6 border-t border-divider pt-6">
                <ContactIntent
                  copy={card}
                  formCopy={form}
                  formId={formIds.contactPage}
                  locale={locale}
                  privacyHref={privacyHref}
                  whatsappPrefill={common.whatsappButton.prefill}
                  callLabel={common.actions.call}
                  whatsappLabel={common.actions.whatsapp}
                />
              </div>
            </section>
          </div>
        </div>
      </div>

      <section aria-labelledby="faq-title" className={`${container} section-y`}>
        <div className="mx-auto max-w-3xl">
          <h2 id="faq-title" className="t-h2 text-center">
            {faq.title}
          </h2>
          <p className="mt-4 text-center text-text-2">{faq.intro}</p>
          <div className="mt-10 grid gap-3">
            {faq.items.map((item) => (
              <details
                key={item.q}
                className="group rounded-field border border-divider bg-surface px-5 transition-colors duration-200 open:border-rule"
              >
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-4 text-left text-lg font-medium [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-3">
                    <HelpCircle aria-hidden="true" size={20} className="flex-none text-accent" />
                    {item.q}
                  </span>
                  <span
                    aria-hidden="true"
                    className="grid size-8 flex-none place-items-center rounded-full bg-text/[0.06] transition-transform duration-300 group-open:rotate-180"
                  >
                    <ChevronDown size={18} />
                  </span>
                </summary>
                <p className="pb-5 pl-8 text-text-2">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <div className={`${container} pb-[clamp(4.5rem,2.8rem+6vw,9rem)]`}>
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <section
            className={`rounded-card border border-divider bg-surface p-6 shadow-card sm:p-8 ${showMap ? "lg:col-span-5" : "lg:col-span-6 lg:col-start-4"}`}
            data-reveal=""
          >
            <h2 className="t-h3">{d.heading}</h2>
            <dl className="mt-5 space-y-5">
              <Detail icon={<Phone size={18} />} label={d.phone}>
                <a href={telLink()} className="font-medium text-brand tabular">
                  {site.phone.display}
                </a>
              </Detail>
              <Detail icon={<MessageCircle size={18} />} label={d.whatsapp}>
                <a
                  href={whatsappLink(common.whatsappButton.prefill)}
                  target="_blank"
                  rel="noopener"
                  className="font-medium text-brand tabular"
                >
                  {site.whatsapp.display}
                </a>
              </Detail>
              {/* Rows without a real value are left out of a production build (placeholders show in review builds). */}
              {shown(site.email) && (
                <Detail icon={<Mail size={18} />} label={d.email}>
                  {site.email}
                </Detail>
              )}
              {shown(site.address.street) && (
                <Detail icon={<MapPin size={18} />} label={d.address}>
                  {addressLine()}
                </Detail>
              )}
              {shown(site.hours) && (
                <Detail icon={<Clock size={18} />} label={d.hours}>
                  {site.hours}
                </Detail>
              )}
              {shown(site.serviceArea) && (
                <Detail icon={<MapPin size={18} />} label={d.serviceArea}>
                  {site.serviceArea}
                </Detail>
              )}
            </dl>
          </section>

          {showMap && (
            <section className="rounded-card border border-divider bg-surface p-6 shadow-card sm:p-8 lg:col-span-7" data-reveal="">
              <h2 className="t-h3">{contact.map.heading}</h2>
              <MapEmbed
                embedUrl={mapsEmbedUrl()}
                openUrl={mapsLink()}
                loadLabel={contact.map.load}
                openLabel={common.actions.openMaps}
                note={contact.map.note}
                title={contact.map.title}
              />
            </section>
          )}
        </div>
      </div>
    </>
  );
}

// A <dl> group may only hold <dt>/<dd>, so the icon lives inside the <dt>.
function Detail({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="t-meta flex items-center gap-2 text-text-2">
        <span aria-hidden="true">{icon}</span>
        {label}
      </dt>
      <dd className="mt-0.5 pl-[26px] text-text">{children}</dd>
    </div>
  );
}
