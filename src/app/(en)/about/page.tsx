import type { Metadata } from "next";
import { AddressText } from "@/components/AddressText";
import { CtaBand } from "@/components/CtaBand";
import { NumbersSection } from "@/components/NumbersSection";
import { PageHeader } from "@/components/PageHeader";
import { Photo } from "@/components/Photo";
import { SectionHeading } from "@/components/SectionHeading";
import { ServiceChapters } from "@/components/ServiceChapters";
import { TrustSection } from "@/components/TrustSection";
import { container } from "@/components/ui";
import { shown } from "@/config/launch";
import { routes } from "@/config/routes";
import { addressLine, site } from "@/config/site";
import { getContent } from "@/content";
import { localePath, type Locale } from "@/i18n/config";
import { sectionRef } from "@/lib/sections";
import { pageMetadata } from "../../metadata";

const locale: Locale = "en";
const { about, common } = getContent(locale);

export const metadata: Metadata = pageMetadata({
  locale,
  path: localePath(locale, routes.about),
  title: about.meta.title,
  description: about.meta.description,
  absoluteTitle: true,
});

// "Sell trust, not words" (brief §12): story + image, figures and trust (hidden until real),
// who we work for, what we do, people and company details. Rhythm: paper → light → dark → light → paper → light → image.
export default function AboutPage() {
  // Rows without a real value are left out of a production build, and a section with nothing real is left out
  // altogether (review builds show the bracketed placeholders). Section numbers follow what is visible.
  const details = [
    { label: about.company.name, value: site.legalName },
    { label: about.company.gstin, value: site.gstin },
    {
      label: about.company.office,
      value: addressLine(),
      native: true,
      real: site.address.street,
    },
    { label: about.company.area, value: site.serviceArea },
  ].filter((item) => shown(item.real ?? item.value));
  const hasStory = about.story.paragraphs.length > 0;
  const hasTeam = about.team.people.length > 0;
  const hasDetails = details.length > 0;
  let n = 0;
  const num = (on: boolean) => (on ? String(++n).padStart(2, "0") : "");
  const iStory = num(hasStory);
  const iClients = num(true);
  const iWork = num(true);
  const iTeam = num(hasTeam);
  const iCompany = num(hasDetails);

  return (
    <>
      <PageHeader {...sectionRef(common, "about")} title={about.title} intro={about.intro} />

      {hasStory && (
        <section aria-labelledby="story-title" className="section-y">
          <div className={`${container} grid gap-12 lg:grid-cols-12 lg:gap-8`}>
            <div className="lg:col-span-5">
              <SectionHeading id="story-title" index={iStory} title={about.story.title} />
              <div className="mt-8 max-w-[56ch] space-y-5" data-reveal="">
                {about.story.paragraphs.map((p) => (
                  <p key={p} className="t-lead text-text-2">
                    {p}
                  </p>
                ))}
              </div>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <Photo
                name="about" // TODO(photo): temporary stock photo, see PHOTO-CREDITS.md
                priority // in the first screen on phones and desktops: preload, don't lazy-load (LCP)
                reveal
                sizes="(min-width: 1440px) 660px, (min-width: 1024px) 48vw, 100vw"
                placeholderLabel={common.placeholder.photo}
                illustrativeLabel={common.placeholder.illustrative}
                alt={about.story.title}
                className="aspect-[4/3] lg:aspect-[4/5]"
              />
            </div>
          </div>
        </section>
      )}

      <NumbersSection locale={locale} />

      <section aria-labelledby="clients-title" className="section-y">
        <div className={container}>
          <SectionHeading id="clients-title" index={iClients} title={about.clients.title} />
          <ul className="mt-12 grid gap-4 lg:grid-cols-2 lg:gap-5">
            {about.clients.items.map((item, i) => (
              <li
                key={item.title}
                data-reveal=""
                style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
                data-spotlight=""
                className="rounded-card border border-divider bg-surface p-6 shadow-card sm:p-8 lg:p-10"
              >
                <span className="t-meta tabular text-brand">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="t-h2 mt-3">{item.title}</h3>
                <p className="t-lead mt-4 max-w-[44ch] text-text-2">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="work-title" className="section-y bg-paper">
        <div className={container}>
          <SectionHeading id="work-title" index={iWork} title={about.work.title} intro={about.work.body} />
          <div className="mt-12">
            <ServiceChapters locale={locale} compact />
          </div>
        </div>
      </section>

      <TrustSection locale={locale} />

      {(hasTeam || hasDetails) && (
        <section aria-labelledby="team-title" className="section-y">
          <div className={`${container} grid gap-14 lg:grid-cols-12 lg:gap-8`}>
            {hasTeam && (
              <div className="lg:col-span-6">
                <SectionHeading id="team-title" index={iTeam} title={about.team.title} />
                <ul className="mt-10 grid grid-cols-2 gap-6">
                  {about.team.people.map((person, i) => (
                    <li
                      key={i}
                      data-reveal=""
                      style={
                        {
                          "--reveal-delay": `${i * 90}ms`,
                        } as React.CSSProperties
                      }
                    >
                      <Photo
                        name={`team-${i + 1}`} // TODO(content): leadership photos, if the user wants people shown
                        sizes="(min-width: 1024px) 300px, 50vw"
                        placeholderLabel={common.placeholder.photo}
                        illustrativeLabel={common.placeholder.illustrative}
                        alt={person.name}
                        className="aspect-[4/5]"
                        hideIfMissing
                      />
                      <p className="t-h3 mt-4">{person.name}</p>
                      <p className="t-meta mt-1 text-text-2">{person.role}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {hasDetails && (
              <div className={hasTeam ? "lg:col-span-5 lg:col-start-8" : "lg:col-span-7 lg:col-start-4"}>
                <SectionHeading id="company-title" index={iCompany} title={about.company.title} />
                <dl className="mt-10 rounded-card border border-divider bg-surface px-6 shadow-card" data-reveal="">
                  {details.map((item) => (
                    <div
                      key={item.label}
                      className="grid gap-1 border-b border-divider py-5 last:border-b-0 sm:grid-cols-[10rem_1fr] sm:gap-6"
                    >
                      <dt className="t-meta pt-0.5 text-text-2">{item.label}</dt>
                      <dd className="font-medium tabular">{item.native ? <AddressText text={item.value} /> : item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </section>
      )}

      <CtaBand locale={locale} t={common} />
    </>
  );
}
