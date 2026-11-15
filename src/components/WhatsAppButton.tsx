"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { whatsappLink } from "@/config/site";

/** Marks an enquiry form's wrapper; the floating button hides while one is on screen. */
export const ENQUIRY_ATTR = "data-enquiry";

/** Other areas the button steps aside for, e.g. the Home hero, which has its own quote action. */
const HIDE_SELECTOR = `[${ENQUIRY_ATTR}], [data-whatsapp-hide]`;

/**
 * Floating WhatsApp link. It steps aside so it never covers a form: hidden while any enquiry
 * form (or a [data-whatsapp-hide] area) is in view or a form has focus, and never shown on
 * `hiddenOn` pages (Contact, which already has Call and WhatsApp buttons). The footer reserves
 * space for it below the last line.
 */
export function WhatsAppButton({
  label,
  shortLabel,
  prefill,
  hiddenOn,
}: {
  label: string;
  /** Visible on phones (< 600 px); must be a word of `label`. */
  shortLabel: string;
  prefill: string;
  hiddenOn: string[];
}) {
  const pathname = usePathname();
  const [formInView, setFormInView] = useState(false);
  const [formFocused, setFormFocused] = useState(false);
  // Ignore a trailing slash: a visit to /contact/ must hide the button exactly as the pre-rendered /contact page does,
  // or the client renders an extra element and hydration fails (which also drops the theme from <html>).
  const excluded = hiddenOn.includes(pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname);

  useEffect(() => {
    if (excluded) return;
    const targets = document.querySelectorAll(HIDE_SELECTOR);
    if (targets.length === 0) return;
    const visible = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      setFormInView(visible.size > 0);
    });
    targets.forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      setFormInView(false);
    };
  }, [pathname, excluded]);

  useEffect(() => {
    const update = () => setFormFocused(!!document.activeElement?.closest(`[${ENQUIRY_ATTR}]`));
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);
    return () => {
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", update);
    };
  }, []);

  if (excluded) return null;
  const hidden = formInView || formFocused;

  // <aside> gives the floating link a landmark, so screen-reader users can find it by region.
  return (
    <aside aria-label={label}>
      <a
        href={whatsappLink(prefill)}
        target="_blank"
        rel="noopener"
        aria-label={label}
        aria-hidden={hidden || undefined}
        tabIndex={hidden ? -1 : undefined}
        // Floats, so level-2 elevation: shadow in light, the lighter surface in dark.
        className={`fixed right-4 bottom-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full border border-divider bg-elevated px-5 text-base font-medium text-text shadow-float-2 transition-[opacity,visibility,background-color] duration-150 hover:bg-band sm:right-6 sm:bottom-6 ${
          hidden ? "invisible opacity-0" : "visible opacity-100"
        }`}
      >
        <MessageCircle aria-hidden="true" size={20} className="text-brand" />
        {/* Phones show the short label so the button stays clear of the "Illustrative photo"
            label in a frame's top-left corner (360 px: ~125 px wide vs ~190 px). The accessible
            name stays the full label, which contains the visible word. */}
        <span className="sm:hidden">{shortLabel}</span>
        <span className="hidden sm:inline">{label}</span>
      </a>
    </aside>
  );
}
