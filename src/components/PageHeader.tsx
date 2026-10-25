import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { container } from "./ui";

/**
 * Title block of every inner page (brand.md v3): a light technical section — warm paper, fine
 * engineering grid, index line, large display title, lead — closed by a hairline with a section
 * reference. Top padding clears the fixed header (64 px phones, 112 px tablet, 80 px wide desktop).
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
    <div className="tech-grid border-b border-rule bg-paper pt-16 sm:pt-28 xl:pt-20">
      <div className={`${container} pt-12 pb-12 sm:pt-16 sm:pb-16 lg:pt-24`}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {parent ? (
            <>
              <Link
                href={parent.href}
                className="t-meta -ml-1 inline-flex min-h-12 items-center gap-1 text-brand hover:underline sm:min-h-10"
              >
                <ChevronLeft aria-hidden="true" size={16} />
                {parent.label}
              </Link>
              {(index || label) && (
                <p className="t-meta flex items-center gap-3 text-text-2">
                  <span aria-hidden="true" className="h-px w-6 bg-rule" />
                  {index && <span className="tabular">{index}</span>}
                  {index && label && <span aria-hidden="true">—</span>}
                  {label && <span>{label}</span>}
                </p>
              )}
            </>
          ) : (
            <p className="t-meta flex items-center gap-3 text-text-2">
              <span aria-hidden="true" className="block h-[2px] w-10 bg-brand" />
              {index && <span className="tabular text-brand">{index}</span>}
              {index && label && <span aria-hidden="true">—</span>}
              {label && <span>{label}</span>}
            </p>
          )}
        </div>
        <h1 className="t-h1 mt-6 max-w-[18ch]">{title}</h1>
        {intro && <p className="t-lead mt-6 max-w-[60ch] text-text-2">{intro}</p>}
        {actions && <div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div>}
      </div>
    </div>
  );
}
