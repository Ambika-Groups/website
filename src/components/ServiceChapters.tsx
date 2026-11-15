import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { routes, serviceKeys, serviceSlug, type ServiceKey } from "@/config/routes";
import { getContent } from "@/content";
import { localePath, type Locale } from "@/i18n/config";
import { Photo } from "./Photo";

/**
 * Services as numbered chapters, each a card (brand.md v4): number · photo · title + summary · typical jobs,
 * with the pointer spotlight, the photo scaling gently and the arrow nudging. Nothing is hover-only.
 * `compact`: text-only rows (for "Other services" and About).
 */
export function ServiceChapters({
  locale,
  exclude,
  compact = false,
  headingLevel = 3,
  priorityFirst = false,
}: {
  locale: Locale;
  exclude?: ServiceKey;
  compact?: boolean;
  /** 2 when the chapters sit directly under the page's h1 (no section heading in between). */
  headingLevel?: 2 | 3;
  /** First chapter is in the first screen on phones (/services): preload its photo, skip its reveal. */
  priorityFirst?: boolean;
}) {
  const { common, services } = getContent(locale);
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const keys = serviceKeys.filter((key) => key !== exclude);

  return (
    <ol className={`grid ${compact ? "gap-3" : "gap-4 lg:gap-5"}`}>
      {keys.map((key, i) => {
        const page = services.pages[key];
        const name = common.serviceNames[key];
        const href = localePath(locale, routes[key]);
        const number = String(serviceKeys.indexOf(key) + 1).padStart(2, "0");
        // The preloaded first row is in the first screen: shown at once, not faded in after the scripts load.
        const first = priorityFirst && i === 0;
        return (
          <li
            key={key}
            data-reveal={first ? undefined : ""}
            style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}
            data-spotlight=""
            className={`group relative ${compact ? "rounded-field" : "rounded-card shadow-card"} border border-divider bg-surface transition-colors duration-300 hover:border-rule has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-brand`}
          >
            <div
              className={`grid gap-x-8 gap-y-5 ${compact ? "p-5 sm:p-6 lg:grid-cols-12 lg:items-baseline" : "p-4 sm:p-6 lg:grid-cols-12 lg:p-8"}`}
            >
              <p className={`t-meta tabular text-brand ${compact ? "lg:col-span-1" : "lg:col-span-1 lg:pt-3"}`}>{number}</p>
              {/* Photo on the left of the row: its "Illustrative photo" label (top-left) then stays
                  clear of the floating WhatsApp button (bottom-right) at every width. */}
              {!compact && (
                <Photo
                  name={`service-${serviceSlug(key)}`} // TODO(photo): temporary stock photo, see PHOTO-CREDITS.md
                  sizes="(min-width: 1440px) 320px, (min-width: 1024px) 22vw, 100vw"
                  placeholderLabel={common.placeholder.photo}
                  illustrativeLabel={common.placeholder.illustrative}
                  alt={name}
                  className="aspect-[4/3] lg:col-span-3"
                  priority={first}
                />
              )}
              <div className={compact ? "lg:col-span-6" : "lg:col-span-5"}>
                <Heading className={compact ? "t-h3" : "t-h2"}>
                  <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
                    {name}
                  </Link>
                </Heading>
                <p className={`text-text-2 ${compact ? "mt-2" : "t-lead mt-4 max-w-[40ch]"}`}>{page.summary}</p>
              </div>
              <div className={compact ? "lg:col-span-5 lg:text-right" : "lg:col-span-3 lg:pt-3"}>
                {!compact && (
                  <ul className="mb-6 space-y-2">
                    {page.jobs.map((job) => (
                      <li key={job} className="flex items-baseline gap-3 border-b border-divider pb-2">
                        <span aria-hidden="true" className="size-1.5 shrink-0 translate-y-[-2px] rounded-full bg-brand-strong" />
                        {job}
                      </li>
                    ))}
                  </ul>
                )}
                <span aria-hidden="true" className="arrow-link t-meta text-text">
                  {services.labels.more}
                  <ArrowRight size={16} className="arrow" />
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
