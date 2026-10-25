import type { Metadata } from "next";
import { ArrowRight, Phone } from "lucide-react";
import { EnquirySection } from "@/components/EnquirySection";
import { PageHeader } from "@/components/PageHeader";
import { SectionHeading } from "@/components/SectionHeading";
import { arrowClass, button, container } from "@/components/ui";
import { formIds } from "@/config/forms";
import { ENQUIRY_ANCHOR, routes } from "@/config/routes";
import { site, telLink } from "@/config/site";
import { getContent } from "@/content";
import { localePath, type Locale } from "@/i18n/config";
import { sectionRef } from "@/lib/sections";
import { pageMetadata } from "../../metadata";

const locale: Locale = "en";
const { common, government: g } = getContent(locale);

export const metadata: Metadata = pageMetadata({
  locale,
  path: localePath(locale, routes.governmentWork),
  title: g.meta.title,
  description: g.meta.description,
});

// Rhythm: paper header → light departments + work → dark process → light registrations → paper enquiry.
export default function GovernmentWorkPage() {
  const credentials = [...g.credentials.items, { label: common.footer.gstinLabel, value: site.gstin }];

  return (
    <>
      <PageHeader
        {...sectionRef(common, "governmentWork")}
        title={g.title}
        intro={g.intro}
        actions={
          <>
            <a href={`#${ENQUIRY_ANCHOR}`} className={button.primary}>
              {common.actions.requestQuote}
              <ArrowRight aria-hidden="true" size={18} className={arrowClass} />
            </a>
            <a href={telLink()} className={button.secondary}>
              <Phone aria-hidden="true" size={18} />
              {common.actions.call}
            </a>
          </>
        }
      />

      <section aria-labelledby="departments-title" className="section-y">
        <div className={`${container} grid gap-14 lg:grid-cols-12 lg:gap-8`}>
          <div className="lg:col-span-6">
            <SectionHeading id="departments-title" index="01" title={g.departments.title} />
            <ul className="mt-10 border-t border-rule">
              {g.departments.items.map((dept) => (
                <li key={dept.name} data-reveal="" className="border-b border-rule py-6">
                  <p className="t-h2">{dept.name}</p>
                  <p className="mt-2 text-text-2">{dept.hint}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <SectionHeading id="work-title" index="02" title={g.work.title} />
            <ol className="mt-10 border-t border-rule">
              {g.work.items.map((item, i) => (
                <li
                  key={item}
                  data-reveal=""
                  style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}
                  className="grid grid-cols-[3rem_1fr] border-b border-rule py-5"
                >
                  <span className="t-meta tabular pt-0.5 text-brand">{String(i + 1).padStart(2, "0")}</span>
                  <span className="t-h3">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section aria-labelledby="how-title" className="tone-dark tech-grid section-y">
        <div className={container}>
          <SectionHeading id="how-title" index="03" title={g.howWeWork.title} intro={g.howWeWork.hints.boq} />
          <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {g.howWeWork.steps.map((step, i) => (
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

      <section aria-labelledby="credentials-title" className="section-y">
        <div className={`${container} grid gap-10 lg:grid-cols-12 lg:gap-8`}>
          <div className="lg:col-span-4">
            <SectionHeading id="credentials-title" index="04" title={g.credentials.title} intro={g.credentials.intro} />
          </div>
          <dl className="border-t border-rule lg:col-span-7 lg:col-start-6" data-reveal="">
            {credentials.map((item) => (
              <div key={item.label} className="grid gap-1 border-b border-rule py-5 sm:grid-cols-[14rem_1fr] sm:gap-6">
                <dt className="t-meta pt-1 text-text-2">{item.label}</dt>
                <dd className="t-h3 tabular">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <EnquirySection locale={locale} formId={formIds.governmentWork} index="05" title={g.enquiry.title} body={g.enquiry.body} />
    </>
  );
}
