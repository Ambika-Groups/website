import type { Metadata } from "next";
import { CtaBand } from "@/components/CtaBand";
import { PageHeader } from "@/components/PageHeader";
import { ServiceChapters } from "@/components/ServiceChapters";
import { container } from "@/components/ui";
import { routes } from "@/config/routes";
import { getContent } from "@/content";
import { localePath, type Locale } from "@/i18n/config";
import { sectionRef } from "@/lib/sections";
import { pageMetadata } from "../../metadata";

const locale: Locale = "en";
const { common, services } = getContent(locale);
const { meta } = services.overview;

export const metadata: Metadata = pageMetadata({
  locale,
  path: localePath(locale, routes.services),
  title: meta.title,
  description: meta.description,
});

export default function ServicesPage() {
  return (
    <>
      <PageHeader {...sectionRef(common, "services")} title={services.overview.title} intro={services.overview.intro} />
      <div className={`${container} section-y`}>
        <ServiceChapters locale={locale} headingLevel={2} priorityFirst />
      </div>
      <CtaBand locale={locale} t={common} />
    </>
  );
}
