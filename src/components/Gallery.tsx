import { Photo } from "./Photo";

/**
 * Photo mosaic (brief §18: aspect-ratio variation, no uniform card row). The first photo is large
 * (2 × 2 cells on desktop), the rest fill around it. Phones: a single column of 4:3 frames.
 */
export function Gallery({
  names,
  alt,
  placeholderLabel,
  illustrativeLabel,
}: {
  names: string[];
  /** Base alt text; each photo gets "<alt> 1", "<alt> 2"… */
  alt: string;
  placeholderLabel: string;
  illustrativeLabel: string;
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:auto-rows-[15rem] lg:grid-cols-3 xl:auto-rows-[18rem]">
      {names.map((name, i) => (
        <li
          key={name}
          className={i === 0 ? "sm:col-span-2 lg:row-span-2" : ""}
          data-reveal=""
          style={{ "--reveal-delay": `${(i % 3) * 80}ms` } as React.CSSProperties}
        >
          <Photo
            name={name}
            sizes={i === 0 ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 600px) 50vw, 100vw"}
            placeholderLabel={placeholderLabel}
            illustrativeLabel={illustrativeLabel}
            alt={`${alt} ${i + 1}`}
            className="aspect-[4/3] lg:aspect-auto lg:h-full"
          />
        </li>
      ))}
    </ul>
  );
}
