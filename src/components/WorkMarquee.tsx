import { getContent } from "@/content";
import type { Locale } from "@/i18n/config";

/**
 * The site's one marquee (brand.md v4): the work types from the service pages, looping slowly. The list is
 * rendered twice for a seamless loop; the copy is aria-hidden. Pauses on hover and off-screen
 * (MotionObserver); under reduced motion it becomes a wrapped, centred list.
 */
export function WorkMarquee({ locale }: { locale: Locale }) {
  const { home, services } = getContent(locale);
  const items = (["construction", "roadWorks", "interlockingPaver"] as const).flatMap((key) => services.pages[key].jobs);
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-3 pr-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-center gap-3 rounded-full border border-divider bg-surface px-5 py-2.5 text-base font-medium whitespace-nowrap"
        >
          <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-strong" />
          {item}
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label={home.marquee.label} className="marquee overflow-hidden border-y border-divider py-5">
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
