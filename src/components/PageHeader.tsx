import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { container } from "./ui";

/**
 * Title block of every inner page (brand.md v4): the page colour with a soft red/peach glow behind the title,
 * a pill eyebrow (index and label), a large display title (Inter Tight) and the lead. Top padding clears the fixed
 * header (64 px phones, 112 px tablet, 80 px wide desktop).
 */
export function PageHeader({
  title,
  intro,
  actions,
  parent,
  index,
  label,
}: {
  title: string;
  intro?: string;
  actions?: ReactNode;
  /** Link back to the section this page sits in, e.g. Services for a service page. */
  parent?: { href: string; label: string };
  /** Section reference shown in the index line, e.g. "02". */
  index?: string;
  /** Short uppercase label for the index line; defaults to the parent's label. */
  label?: string;
}) {
  return (
    <div className="relative isolate overflow-hidden bg-bg pt-16 sm:pt-28 xl:pt-20">
      <div aria-hidden="true" className="hero-glow absolute inset-0 -z-10" />
      <div className={`${container} pt-12 pb-12 sm:pt-16 sm:pb-16 lg:pt-24`}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {parent ? (
            <>
              <Link
                href={parent.href}
                className="t-meta inline-flex min-h-12 items-center gap-1 rounded-full border border-divider bg-surface/60 px-3 text-text transition-colors duration-200 hover:bg-selected sm:min-h-10"
              >
                <ChevronLeft aria-hidden="true" size={16} />
                {parent.label}
              </Link>
              {(index || label) && (
                <p className="t-meta flex items-center gap-3 text-text-2">
                  {index && <span className="tabular">{index}</span>}
                  {index && label && <span aria-hidden="true">—</span>}
                  {label && <span>{label}</span>}
                </p>
              )}
            </>
          ) : (
            <p className="t-meta inline-flex items-center gap-2.5 rounded-full border border-divider bg-surface/60 px-3.5 py-1.5 text-text-2">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-strong" />
              {index && <span className="tabular text-text">{index}</span>}
              {index && label && <span aria-hidden="true">—</span>}
              {label && <span>{label}</span>}
            </p>
          )}
        </div>
        <h1 className="t-h1 mt-6 max-w-[20ch]">{title}</h1>
        {intro && <p className="t-lead mt-6 max-w-[60ch] text-text-2">{intro}</p>}
        {actions && <div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div>}
      </div>
    </div>
  );
}
