import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/CtaBand";
import { Gallery } from "@/components/Gallery";
import { Notice } from "@/components/Notice";
import { PageHeader } from "@/components/PageHeader";
import { Photo, photoSeries } from "@/components/Photo";
import { SectionHeading } from "@/components/SectionHeading";
import { container } from "@/components/ui";
import { routes } from "@/config/routes";
import { getContent } from "@/content";
import { localePath, type Locale } from "@/i18n/config";
import { pageMetadata } from "../../../metadata";

const locale: Locale = "en";
const { common, home, projects } = getContent(locale);

export const dynamicParams = false;

export function generateStaticParams() {
  // A static export needs at least one page here; if the admin has switched every project off, a stand-in slug
  // renders the 404 (it is not linked from anywhere and not in the sitemap).
  return projects.items.length ? projects.items.map((project) => ({ slug: project.slug })) : [{ slug: "none" }];
}

type Props = { params: Promise<{ slug: string }> };

const findProject = async (params: Props["params"]) => {
  const { slug } = await params;
  return projects.items.find((project) => project.slug === slug);
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await findProject(params);
  if (!project) return {};
  return pageMetadata({
    locale,
    path: localePath(locale, `${routes.projects}/${project.slug}`),
    title: project.title,
    description: project.summary,
  });
}

// Rhythm: paper header → full-width photo → light spec + scope → light gallery → dark image close.
export default async function ProjectPage({ params }: Props) {
  const project = await findProject(params);
  if (!project) notFound();
  const { labels } = projects;
  const id = `${home.projects.projectId}-${String(projects.items.indexOf(project) + 1).padStart(2, "0")}`;
  // Photo 1 is the main image; the gallery shows photos/project-<slug>-2…N. Slots up to the planned
  // `project.photos` count stay as marked placeholders until those photos exist.
  const prefix = `project-${project.slug}-`;
  const extra = photoSeries(prefix).filter((name) => name !== `${prefix}1`);
  const slots = Math.max(project.photos, extra.length);
  const gallery = Array.from({ length: slots }, (_, i) => `${prefix}${i + 2}`);

  const facts = [
    {
      label: labels.service,
      value: (
        <Link href={localePath(locale, routes[project.service])} className="text-brand hover:underline">
          {common.serviceNames[project.service]}
        </Link>
      ),
    },
    { label: labels.location, value: project.location },
    ...(project.clientType ? [{ label: labels.clientType, value: project.clientType }] : []),
    { label: labels.year, value: <span className="tabular">{project.year}</span> },
    { label: labels.status, value: project.status },
  ];

  return (
    <>
      <PageHeader
        index={id}
        label={common.serviceNames[project.service]}
        title={project.title}
        intro={project.summary}
        parent={{ href: localePath(locale, routes.projects), label: labels.breadcrumb }}
      />

      <div className={`${container} pt-8 sm:pt-12`}>
        {/* TODO(content): remove the notice once this is a real project. */}
        {projects.placeholderNotice && <Notice className="mb-8 max-w-2xl">{projects.placeholderNotice}</Notice>}
        <Photo
          name={`${prefix}1`} // TODO(photo): temporary stock photo, see PHOTO-CREDITS.md
          priority
          sizes="(min-width: 1440px) 1344px, 100vw"
          placeholderLabel={common.placeholder.photo}
          illustrativeLabel={common.placeholder.illustrative}
          alt={project.title}
          className="aspect-[4/3] sm:aspect-[16/9]"
        />
      </div>

      <section aria-labelledby="spec-title" className="section-y">
        <div className={`${container} grid gap-14 lg:grid-cols-12 lg:gap-8`}>
          <div className="lg:col-span-5">
            <SectionHeading id="spec-title" index="01" label={id} title={labels.details} />
            <dl className="mt-10 rounded-card border border-divider bg-surface px-6 shadow-card" data-reveal="">
              {facts.map((fact) => (
                <div key={fact.label} className="grid grid-cols-[8rem_1fr] gap-4 border-b border-divider py-4 last:border-b-0">
                  <dt className="t-meta pt-0.5 text-text-2">{fact.label}</dt>
                  <dd className="font-medium">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <SectionHeading id="scope-title" index="02" label={id} title={labels.scope} />
            <ol className="mt-10 grid gap-3">
              {project.scope.map((item, i) => (
                <li
                  key={i}
                  data-reveal=""
                  style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}
                  className="grid grid-cols-[3rem_1fr] rounded-field border border-divider bg-surface p-5"
                >
                  <span className="t-meta tabular pt-1 text-brand">{String(i + 1).padStart(2, "0")}</span>
                  <span className="t-h3">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {gallery.length > 0 && (
        <section aria-labelledby="gallery-title" className="section-y pt-0 sm:pt-0">
          <div className={`${container} pt-16 sm:pt-20`}>
            <SectionHeading id="gallery-title" index="03" label={id} title={labels.photos} />
            <div className="mt-12">
              <Gallery
                names={gallery}
                alt={project.title}
                placeholderLabel={common.placeholder.photo}
                illustrativeLabel={common.placeholder.illustrative}
              />
            </div>
          </div>
        </section>
      )}

      <CtaBand locale={locale} t={common} />
    </>
  );
}
