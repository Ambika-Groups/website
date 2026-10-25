import type { Metadata } from "next";
import { CtaBand } from "@/components/CtaBand";
import { Notice } from "@/components/Notice";
import { PageHeader } from "@/components/PageHeader";
import { ProjectShowcase } from "@/components/ProjectShowcase";
import { container } from "@/components/ui";
import { routes } from "@/config/routes";
import { getContent } from "@/content";
import { localePath, type Locale } from "@/i18n/config";
import { sectionRef } from "@/lib/sections";
import { pageMetadata } from "../../metadata";

const locale: Locale = "en";
const { common, projects } = getContent(locale);

export const metadata: Metadata = pageMetadata({
  locale,
  path: localePath(locale, routes.projects),
  title: projects.meta.title,
  description: projects.meta.description,
});

// The full portfolio in the same editorial compositions as Home (cycling through the three layouts).
export default function ProjectsPage() {
  return (
    <>
      <PageHeader {...sectionRef(common, "projects")} title={projects.title} intro={projects.intro} />
      <div className={`${container} section-y`}>
        {/* TODO(content): remove the notice once real projects replace the placeholders. */}
        <Notice className="max-w-2xl">{projects.placeholderNotice}</Notice>
        <ProjectShowcase locale={locale} projects={projects.items} headingLevel={2} />
      </div>
      <CtaBand locale={locale} t={common} />
    </>
  );
}
