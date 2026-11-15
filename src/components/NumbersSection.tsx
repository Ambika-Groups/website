import { Info } from "lucide-react";
import { showNumbers } from "@/config/flags";
import { getContent } from "@/content";
import type { Locale } from "@/i18n/config";
import { SectionHeading } from "./SectionHeading";
import { container } from "./ui";

/**
 * Credibility figures (brief §8): dark, technical grid, enormous numerals with fine dividers.
 * Never ships placeholders: rendered only when `showNumbers` is on (development, or real figures).
 * No count-up animation (brand.md v3); figures simply reveal with the section.
 */
export function NumbersSection({ locale }: { locale: Locale }) {
  if (!showNumbers) return null;
  const n = getContent(locale).home.numbers;
  const placeholder = n.items.some((item) => item.value.startsWith("["));
  return (
    <section aria-labelledby="numbers-title" className="tone-dark section-y">
      <div className={container}>
        <SectionHeading id="numbers-title" label={n.label} title={n.title} />
        {placeholder && (
          <p className="mt-6 inline-flex items-start gap-2 rounded-field border border-[#fdd663]/60 px-3 py-2 text-sm text-[#fdd663]">
            <Info aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
            {n.notice}
          </p>
        )}
        <dl className="mt-14 grid grid-cols-1 border-t border-divider sm:grid-cols-2 lg:grid-cols-4">
          {n.items.map((item, i) => (
            <div
              key={item.label}
              data-reveal=""
              style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
              className={`flex flex-col-reverse justify-end gap-4 border-b border-divider py-8 sm:py-10 lg:border-b-0 lg:px-6 lg:first:pl-0 ${
                i > 0 ? "lg:border-l" : ""
              } ${i % 2 === 1 ? "sm:border-l sm:pl-6 lg:pl-6" : ""}`}
            >
              <dt className="t-meta text-text-2">
                <span className="tabular mr-2 text-brand">{String(i + 1).padStart(2, "0")}</span>
                {item.label}
              </dt>
              <dd className="t-figure text-text">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
