import type { ReactNode } from "react";

/**
 * Section heading (brand.md v4): a pill eyebrow ("03 — Portfolio" with a red dot), then a large
 * display title and an optional lead.
 */
export function SectionHeading({
  title,
  intro,
  id,
  index,
  label,
  className = "",
}: {
  title: string;
  intro?: ReactNode;
  id?: string;
  /** Section number, e.g. "03". */
  index?: string;
  /** Short uppercase label beside the number, e.g. "Portfolio". */
  label?: string;
  className?: string;
}) {
  return (
    <div className={`max-w-3xl ${className}`} data-reveal="">
      <p className="t-meta inline-flex items-center gap-2.5 rounded-full border border-divider px-3.5 py-1.5 text-text-2">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-strong" />
        {index && <span className="tabular text-brand">{index}</span>}
        {index && label && <span aria-hidden="true">—</span>}
        {label && <span>{label}</span>}
      </p>
      <h2 id={id} className="t-h2 mt-5">
        {title}
      </h2>
      {intro && <p className="t-lead mt-5 max-w-[56ch] text-text-2">{intro}</p>}
    </div>
  );
}
