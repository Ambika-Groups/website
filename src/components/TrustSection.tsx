import { Info } from "lucide-react";
import { showTrustedBy } from "@/config/flags";
import { getContent } from "@/content";
import type { Locale } from "@/i18n/config";
import { container } from "./ui";

/**
 * "Trusted by" (brief §13): a restrained row of client logos and certifications, no logo wall,
 * no marquee. Never ships placeholders: rendered only when `showTrustedBy` is on.
 * TODO(content): replace the text placeholders with real logo images (with permission).
 */
export function TrustSection({ locale }: { locale: Locale }) {
  if (!showTrustedBy) return null;
  const t = getContent(locale).home.trust;
  const placeholder = t.logos.some((logo) => logo.startsWith("["));
  return (
    <section aria-labelledby="trust-title" className="bg-paper py-14 sm:py-20">
      <div className={`${container} grid gap-10 lg:grid-cols-12 lg:items-center`}>
        <div className="lg:col-span-3" data-reveal="">
          <p className="t-meta text-text-2">{t.label}</p>
          <h2 id="trust-title" className="t-h3 mt-2">
            {t.title}
          </h2>
          {placeholder && (
            <p className="mt-4 flex items-start gap-2 rounded-field border border-warning px-3 py-2 text-sm text-warning">
              <Info aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
              {t.notice}
            </p>
          )}
        </div>
        <div className="lg:col-span-9" data-reveal="">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {t.logos.map((logo, i) => (
              <li
                key={i}
                className="t-meta grid h-24 place-items-center rounded-field border border-divider bg-surface px-4 text-center text-text-2"
              >
                {logo}
              </li>
            ))}
          </ul>
          <ul className="t-meta mt-5 flex flex-wrap gap-x-6 gap-y-2 text-text-2">
            {t.certifications.map((cert) => (
              <li key={cert} className="flex items-center gap-2">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-strong" />
                {cert}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
