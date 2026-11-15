import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { EnquirySection } from "@/components/EnquirySection";
import { Gallery } from "@/components/Gallery";
import { PageHeader } from "@/components/PageHeader";
import { Photo, photoSeries } from "@/components/Photo";
import { SectionHeading } from "@/components/SectionHeading";
import { ServiceChapters } from "@/components/ServiceChapters";
import { arrowClass, button, container } from "@/components/ui";
import { serviceFormIds } from "@/config/forms";
import { ENQUIRY_ANCHOR, routes, serviceFromSlug, serviceKeys, serviceSlug } from "@/config/routes";
import { getContent } from "@/content";
import { localePath, type Locale } from "@/i18n/config";
import { pageMetadata } from "../../../metadata";

const locale: Locale = "en";
const { common, services } = getContent(locale);
const GALLERY_SLOTS = 3;

// Static export: exactly the four service pages, nothing else under /services/.
export const dynamicParams = false;

export function generateStaticParams() {
  return serviceKeys.map((key) => ({ slug: serviceSlug(key) }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const key = serviceFromSlug((await params).slug);
  if (!key) return {};
  const { meta } = services.pages[key];
  return pageMetadata({ locale, path: localePath(locale, routes[key]), title: meta.title, description: meta.description });
}

// Rhythm: paper header → cover image → light scope → dark "who for" → light gallery → paper enquiry → light chapters.
export default async function ServicePage({ params }: Props) {
  const key = serviceFromSlug((await params).slug);
  if (!key) notFound();
  const page = services.pages[key];
  const name = common.serviceNames[key];
  const { labels } = services;
  const number = String(serviceKeys.indexOf(key) + 1).padStart(2, "0");
  // Every photos/service-<slug>-N file that exists; until then, GALLERY_SLOTS placeholders.
  const prefix = `service-${serviceSlug(key)}-`;
  const series = photoSeries(prefix);
  const gallery = series.length ? series : Array.from({ length: GALLERY_SLOTS }, (_, i) => `${prefix}${i + 1}`);

  return (
    <>
      <PageHeader
        title={name}
        intro={page.intro}
        parent={{ href: localePath(locale, routes.services), label: labels.breadcrumb }}
        actions={
          <a href={`#${ENQUIRY_ANCHOR}`} className={button.primary}>
            {common.actions.requestQuote}
            <ArrowRight aria-hidden="true" size={18} className={arrowClass} />
          </a>
        }
      />

      <div className={`${container} pt-8 sm:pt-12`}>
        <Photo
          name={`service-${serviceSlug(key)}`} // TODO(photo): temporary stock photo, see PHOTO-CREDITS.md
          priority // first screen: preload, don't lazy-load (LCP)
          reveal
          sizes="(min-width: 1440px) 1344px, 100vw"
          placeholderLabel={common.placeholder.photo}
          illustrativeLabel={common.placeholder.illustrative}
          alt={name}
          className="aspect-[4/3] sm:aspect-[21/9]"
        />
      </div>

      <section aria-labelledby="scope-title" className="section-y">
        <div className={`${container} grid gap-10 lg:grid-cols-12 lg:gap-8`}>
          <div className="lg:col-span-4">
            <SectionHeading id="scope-title" index="01" label={`${labels.chapter} ${number}`} title={labels.scope} />
          </div>
          <ol className="grid gap-3 lg:col-span-7 lg:col-start-6">
            {page.scope.map((item, i) => (
              <li
                key={item.title}
                data-reveal=""
                style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}
                data-spotlight=""
                className="grid grid-cols-[3rem_1fr] gap-x-4 rounded-field border border-divider bg-surface p-5 sm:p-6"
              >
                <span className="t-meta tabular pt-1 text-brand">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="t-h3">{item.title}</p>
                  {item.hint && <p className="mt-1 text-text-2">{item.hint}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="clients-title" className="tone-dark section-y">
        <div className={`${container} grid gap-10 lg:grid-cols-12 lg:gap-8`}>
          <div className="lg:col-span-4">
            <SectionHeading id="clients-title" index="02" label={labels.chapter} title={labels.clients} />
          </div>
          <ul className="lg:col-span-7 lg:col-start-6">
            {page.clients.map((client, i) => (
              <li
                key={client}
                data-reveal=""
                style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}
                className="t-h2 border-b border-divider py-5 first:pt-0"
              >
                {client}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="photos-title" className="section-y">
        <div className={container}>
          <SectionHeading id="photos-title" index="03" label={name} title={labels.photos} />
          <div className="mt-12">
            <Gallery
              names={gallery}
              alt={name}
              placeholderLabel={common.placeholder.photo}
              illustrativeLabel={common.placeholder.illustrative}
            />
          </div>
        </div>
      </section>

      <EnquirySection
        locale={locale}
        formId={serviceFormIds[key]}
        index="04"
        title={page.enquiryTitle}
        body={labels.enquiryBody}
      />

      <section aria-labelledby="related-title" className="section-y">
        <div className={container}>
          <SectionHeading id="related-title" index="05" label={labels.breadcrumb} title={labels.related} />
          <div className="mt-12">
            <ServiceChapters locale={locale} exclude={key} compact />
          </div>
        </div>
      </section>
    </>
  );
}
