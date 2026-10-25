import type { Metadata } from "next";
import { CtaBand } from "@/components/CtaBand";
import { Notice } from "@/components/Notice";
import { PageHeader } from "@/components/PageHeader";
import { container } from "@/components/ui";
import { routes } from "@/config/routes";
import { addressLine, site, telLink, whatsappLink } from "@/config/site";
import { getContent } from "@/content";
import { localePath, type Locale } from "@/i18n/config";
import { pageMetadata } from "../../metadata";

const locale: Locale = "en";
const { common, privacy } = getContent(locale);

export const metadata: Metadata = pageMetadata({
  locale,
  path: localePath(locale, routes.privacy),
  title: privacy.meta.title,
  description: privacy.meta.description,
});

export default function PrivacyPage() {
  return (
    <>
      <PageHeader title={privacy.title} label={privacy.lastUpdated} />
      <div className={`${container} section-y grid gap-12 lg:grid-cols-12 lg:gap-8`}>
        {/* Contents: sticky on desktop, a quick way through a long legal text. */}
        <nav aria-labelledby="privacy-contents" className="lg:col-span-3">
          <div className="lg:sticky lg:top-28">
            <h2 id="privacy-contents" className="t-meta text-text-2">
              {privacy.contentsHeading}
            </h2>
            <ol className="mt-4 border-t border-rule">
              {privacy.sections.map((section, i) => (
                <li key={section.heading} className="border-b border-rule">
                  <a
                    href={`#privacy-${i + 1}`}
                    className="flex min-h-11 items-baseline gap-3 py-2 text-text-2 hover:text-text"
                  >
                    <span className="t-meta tabular text-brand">{String(i + 1).padStart(2, "0")}</span>
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>
        <div className="max-w-[68ch] lg:col-span-8 lg:col-start-5">
          {/* TODO(content): remove the draft notice once the policy is approved. */}
          <Notice>{privacy.draftNotice}</Notice>

          {privacy.sections.map((section, i) => (
            <section key={section.heading} id={`privacy-${i + 1}`} className="mt-12 scroll-mt-32">
              <h2 className="t-h3 flex items-baseline gap-4">
                <span className="t-meta tabular text-brand">{String(i + 1).padStart(2, "0")}</span>
                {section.heading}
              </h2>
              {section.list && (
                <ul className="mt-4 space-y-2">
                  {section.list.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 bg-text-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {section.paragraphs?.map((p) => (
                <p key={p} className="mt-4">
                  {p}
                </p>
              ))}
            </section>
          ))}

          <section className="mt-12 border-t border-rule pt-10">
            <h2 className="t-h3">{privacy.contactHeading}</h2>
            <ul className="mt-4 space-y-1">
              <li>
                <a
                  href={telLink()}
                  className="inline-flex min-h-12 items-center font-medium text-brand tabular sm:min-h-10"
                >
                  {common.actions.call}: {site.phone.display}
                </a>
              </li>
              <li>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex min-h-12 items-center font-medium text-brand tabular sm:min-h-10"
                >
                  {common.actions.whatsapp}: {site.whatsapp.display}
                </a>
              </li>
              <li className="py-2">{site.email}</li>
              <li className="py-2">{addressLine()}</li>
            </ul>
          </section>
        </div>
      </div>
      <CtaBand locale={locale} t={common} />
    </>
  );
}
