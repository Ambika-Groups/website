import type { ReactNode } from "react";

/**
 * Editorial section heading: a technical index line ("03 — Portfolio", red rule), then a large
 * display title and an optional lead. Without `index`, the line is just the red rule.
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
      <p className="t-meta flex items-center gap-3 text-text-2">
        <span aria-hidden="true" className="block h-[2px] w-10 bg-brand" />
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
