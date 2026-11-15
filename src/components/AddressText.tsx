import { Fragment } from "react";

/**
 * Text that may contain Devanagari (for example the address "Bengali Colony (बंगाली कॉलोनी)"). Each Devanagari run is
 * marked lang="hi", so screen readers pronounce it as Hindi and the browser picks the Devanagari font for it
 * (declared in app/fonts.ts, downloaded only on pages that show such text).
 */
export function AddressText({ text }: { text: string }) {
  const parts = text.split(/([\u0900-\u097F][\u0900-\u097F\s]*[\u0900-\u097F]|[\u0900-\u097F])/);
  return (
    <>
      {parts.map((part, i) =>
        /[\u0900-\u097F]/.test(part) ? (
          <span key={i} lang="hi">
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
