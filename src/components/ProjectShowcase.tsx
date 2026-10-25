import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { routes } from "@/config/routes";
import { getContent } from "@/content";
import type { Project } from "@/content/en/projects";
import { localePath, type Locale } from "@/i18n/config";
import { Photo } from "./Photo";

/**
 * Portfolio-style project features (brief §7). Each project gets a different composition:
 *   0 — large image left, text right
 *   1 — text left, image right, dropped below the first row's line
 *   2 — full-width cinematic image with the caption set beneath on a hairline
 * Image reveal on scroll, gentle scale on hover, arrow nudge + red rule on the link.
 */
export function ProjectShowcase({
  locale,
  projects,
  headingLevel = 3,
}: {
  locale: Locale;
  projects: Project[];
  /** 2 when the projects sit directly under the page's h1 (the Projects page). */
  headingLevel?: 2 | 3;
}) {
  const { common, home } = getContent(locale);
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <ol className="mt-14 space-y-20 sm:mt-20 lg:space-y-32">
      {projects.map((project, i) => {
        const href = localePath(locale, `${routes.projects}/${project.slug}`);
        const id = `${home.projects.projectId}-${String(i + 1).padStart(2, "0")}`;
        const layout = i % 3;
        const photo = (
          <Photo
            name={`project-${project.slug}-1`} // TODO(photo): temporary stock photo, see PHOTO-CREDITS.md
            reveal
            sizes={layout === 2 ? "(min-width: 1440px) 1344px, 100vw" : "(min-width: 1440px) 780px, (min-width: 1024px) 56vw, 100vw"}
            placeholderLabel={common.placeholder.photo}
            illustrativeLabel={common.placeholder.illustrative}
            alt={project.title}
            className={layout === 2 ? "aspect-[4/3] sm:aspect-[21/9]" : "aspect-[4/3] lg:aspect-[5/4]"}
          />
        );
        const text = (
          <div data-reveal="" className={layout === 2 ? "" : "lg:pt-6"}>
            <p className="t-meta flex flex-wrap items-center gap-x-3 gap-y-1 text-text-2">
              <span className="tabular text-brand">{id}</span>
              <span aria-hidden="true" className="h-px w-8 bg-rule" />
              <span>{common.serviceNames[project.service]}</span>
            </p>
            <Heading className="t-h2 mt-4">
              <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
                {project.title}
              </Link>
            </Heading>
            <p className="t-meta mt-4 text-text-2">
              {project.location} <span aria-hidden="true">/</span> {project.clientType} <span aria-hidden="true">/</span>{" "}
              <span className="tabular">{project.year}</span>
            </p>
            <p className="mt-5 max-w-[46ch] text-text-2">{project.summary}</p>
            <span aria-hidden="true" className="arrow-link t-meta mt-7 text-text">
              {home.projects.view}
              <ArrowRight size={16} className="arrow" />
            </span>
          </div>
        );

        return (
          // The whole feature is one link target (title link stretched over it); focus ring on the title.
          <li key={project.slug} className="group relative has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-8 has-[a:focus-visible]:outline-brand">
            {layout === 2 ? (
              <div>
                {photo}
                <div className="mt-6 border-t border-rule pt-6 lg:grid lg:grid-cols-12 lg:gap-8">
                  <div className="lg:col-span-7 lg:col-start-6">{text}</div>
                </div>
              </div>
            ) : (
              <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
                <div className={`lg:col-span-7 ${layout === 1 ? "lg:order-2 lg:col-start-6 lg:mt-24" : ""}`}>{photo}</div>
                <div className={`lg:col-span-5 ${layout === 1 ? "lg:order-1 lg:col-start-1 lg:row-start-1" : ""}`}>{text}</div>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
