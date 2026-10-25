import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EnquirySection } from "@/components/EnquirySection";
import { HomeHero } from "@/components/HomeHero";
import { NumbersSection } from "@/components/NumbersSection";
import { ProjectShowcase } from "@/components/ProjectShowcase";
import { SectionHeading } from "@/components/SectionHeading";
import { ServiceChapters } from "@/components/ServiceChapters";
import { TrustSection } from "@/components/TrustSection";
import { container } from "@/components/ui";
import { formIds } from "@/config/forms";
import { routes } from "@/config/routes";
import { getContent } from "@/content";
import { localePath, type Locale } from "@/i18n/config";
import { pageMetadata } from "../metadata";

const locale: Locale = "en";
const { home, projects } = getContent(locale);
const SERVICES_ANCHOR = "services";

export const metadata: Metadata = pageMetadata({
  locale,
  path: localePath(locale, routes.home),
  title: home.meta.title,
  description: home.meta.description,
  absoluteTitle: true,
});

// Rhythm (brand.md v3): image → light portfolio → dark figures → light → paper → light → form.
export default function HomePage() {
  const href = (path: string) => localePath(locale, path);

  return (
    <>
      <HomeHero locale={locale} />

      <section aria-labelledby="projects-title" className="section-y">
        <div className={container}>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              id="projects-title"
              index={home.projects.index}
              label={home.projects.label}
              title={home.projects.title}
              intro={home.projects.intro}
            />
            <Link href={href(routes.projects)} className="arrow-link t-meta mb-2 text-text">
              {home.projects.all}
              <ArrowRight aria-hidden="true" size={16} className="arrow" />
            </Link>
          </div>
          <ProjectShowcase locale={locale} projects={projects.items.slice(0, 3)} />
        </div>
      </section>

      <NumbersSection locale={locale} />

      <section id={SERVICES_ANCHOR} aria-labelledby="services-title" className="section-y scroll-mt-28 bg-paper">
        <div className={container}>
          <SectionHeading
            id="services-title"
            index={home.services.index}
            label={home.services.label}
            title={home.services.title}
            intro={home.services.intro}
          />
          <div className="mt-12 lg:mt-16">
            <ServiceChapters locale={locale} />
          </div>
        </div>
      </section>

      <section aria-labelledby="gov-title" className="section-y">
        <div className={`${container} grid gap-12 lg:grid-cols-12`}>
          <div className="lg:col-span-6">
            <SectionHeading
              id="gov-title"
              index={home.government.index}
              label={home.government.label}
              title={home.government.title}
              intro={home.government.body}
            />
            <p className="t-meta mt-6 text-text-2">{home.government.credentials}</p>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 lg:pt-16" data-reveal="">
            <ul className="border-t border-rule">
              {home.government.departments.map((dept) => (
                <li key={dept} className="t-h3 border-b border-rule py-5">
                  {dept}
                </li>
              ))}
            </ul>
            <Link href={href(routes.governmentWork)} className="arrow-link t-meta mt-8 text-text">
              {home.government.link}
              <ArrowRight aria-hidden="true" size={16} className="arrow" />
            </Link>
          </div>
        </div>
      </section>

      <TrustSection locale={locale} />

      <section aria-labelledby="process-title" className="section-y tech-grid border-y border-rule bg-paper">
        <div className={container}>
          <SectionHeading id="process-title" index={home.process.index} label={home.process.label} title={home.process.title} />
          <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {home.process.steps.map((step, i) => (
              <li
                key={step.title}
                data-reveal=""
                style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
                className="border-t-2 border-text pt-5"
              >
                <span className="t-meta tabular text-brand">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="t-h3 mt-3">{step.title}</h3>
                <p className="mt-3 text-text-2">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <EnquirySection locale={locale} formId={formIds.homeCta} index="05" title={home.enquiry.title} body={home.enquiry.body} />
    </>
  );
}
