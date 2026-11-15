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

export const metadata: Metadata = {
  ...pageMetadata({
    locale,
    path: localePath(locale, routes.projects),
    title: projects.meta.title,
    description: projects.meta.description,
  }),
  // With no real project yet the page says so; it stays out of search results until there is something to show.
  ...(projects.items.length === 0 && { robots: { index: false, follow: true } }),
};

// The full portfolio in the same editorial compositions as Home (cycling through the three layouts).
export default function ProjectsPage() {
  return (
    <>
      <PageHeader {...sectionRef(common, "projects")} title={projects.title} intro={projects.intro} />
      <div className={`${container} section-y`}>
        {/* TODO(content): remove the notice once real projects replace the placeholders. */}
        {projects.placeholderNotice && <Notice className="max-w-2xl">{projects.placeholderNotice}</Notice>}
        {projects.items.length > 0 ? (
          <ProjectShowcase locale={locale} projects={projects.items} headingLevel={2} priorityFirst />
        ) : (
          <div className="max-w-2xl rounded-card border border-divider bg-surface p-6 shadow-card sm:p-8">
            <h2 className="t-h3">{projects.empty.title}</h2>
            <p className="mt-3 text-text-2">{projects.empty.body}</p>
          </div>
        )}
      </div>
      <CtaBand locale={locale} t={common} />
    </>
  );
}
