"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, MessageCircle, Phone, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { isActive, NavLinks, type NavItem } from "./NavLinks";
import { ThemeSwitch } from "./ThemeSwitch";
import { arrowClass, button, container } from "./ui";

interface Props {
  brand: ReactNode;
  items: NavItem[];
  quote: NavItem;
  /** Page whose first section is a full-bleed photo: the bar starts transparent over it. */
  overlayOn: string;
  labels: { nav: string; open: string; close: string; menu: string; theme: string; call: string; whatsapp: string };
  contact: { telHref: string; whatsappHref: string };
}

/**
 * Site header (brand.md v4).
 * - Over the Home hero: transparent, light text; turns to glass after 24 px of scroll.
 * - Everywhere else: the page colour at the top, glass once the page scrolls.
 * - Phones (< 600): brand + Menu; the menu is a full-screen dark glass sheet with large numbered links.
 * - 600–1279: two rows (user-approved); ≥ 1280: one row.
 */
export function SiteHeader({ brand, items, quote, overlayOn, labels, contact }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  // A trailing slash (/hi/) must match the pre-rendered page (/hi), or the header renders differently after hydration.
  const overlay = (pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname) === overlayOn && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Full-screen menu: lock page scroll, make the page behind inert, Escape closes.
  useEffect(() => {
    if (!open) return;
    const behind = [document.getElementById("main"), document.querySelector("footer")].filter(Boolean) as HTMLElement[];
    behind.forEach((el) => el.setAttribute("inert", ""));
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    firstLinkRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      behind.forEach((el) => el.removeAttribute("inert"));
      document.documentElement.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 border-b transition-[background-color,color,border-color] duration-300 ${
        overlay
          ? "tone-dark !border-transparent !bg-transparent"
          : open
            ? "tone-dark border-transparent"
            : scrolled
              ? "glass"
              : "border-divider bg-bg"
      }`}
    >
      {/* Over the photo: a top scrim keeps the bar readable on any image. */}
      {overlay && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-[#0b0b0c]/70 to-transparent" />
      )}
      <div className={`${container} flex h-16 items-stretch justify-between gap-4 xl:h-20`}>
        {brand}
        <nav aria-label={labels.nav} className="hidden xl:flex">
          <NavLinks items={items} />
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <ThemeSwitch label={labels.theme} />
          </div>
          <div className="hidden sm:block">
            <Link href={quote.href} className={`${button.secondary} !min-h-10 !px-4 text-sm`}>
              {quote.label}
              <ArrowRight aria-hidden="true" size={16} className={arrowClass} />
            </Link>
          </div>
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex min-h-12 items-center gap-2 rounded-full px-3 text-base font-medium sm:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? labels.close : labels.open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X aria-hidden="true" size={24} /> : <Menu aria-hidden="true" size={24} />}
            <span aria-hidden="true" className="t-meta">
              {labels.menu}
            </span>
          </button>
        </div>
      </div>

      <nav aria-label={labels.nav} className={`hidden sm:block xl:hidden ${overlay ? "" : "border-t border-divider"}`}>
        <div className={`${container} flex h-12`}>
          <NavLinks items={items} className="-ml-3" />
        </div>
      </nav>

      {/* Phone menu: full screen, dark, large numbered links. */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="tone-dark glass-sheet fixed inset-x-0 top-16 bottom-0 overflow-y-auto sm:hidden"
      >
        <div className={`${container} flex min-h-full flex-col pb-8`}>
          <div className="border-b border-divider py-2">
            <ThemeSwitch label={labels.theme} className="-ml-2 w-[calc(100%+1rem)]" />
          </div>
          <nav aria-label={labels.nav} className="flex-1 py-4">
            <ol>
              {items.map((item, i) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href} className="border-b border-divider">
                    <Link
                      ref={i === 0 ? firstLinkRef : undefined}
                      href={item.href}
                      onClick={close}
                      aria-current={pathname.replace(/\/$/, "") === item.href || pathname === item.href ? "page" : undefined}
                      className="flex min-h-16 items-baseline gap-4 py-3"
                    >
                      <span className={`t-meta tabular ${active ? "text-brand" : "text-text-2"}`}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={`t-h2 ${active ? "text-brand" : ""}`}>{item.label}</span>
                    </Link>
                    {/* Sub-pages (the five services) as a short indented list under their section. The first child
                        repeats the section's own page, which the big link above already opens. */}
                    {item.children && (
                      <ul className="-mt-1 mb-3 ml-[2.4rem] border-l border-divider pl-4">
                        {item.children.slice(1).map((child) => {
                          const current = pathname.replace(/\/$/, "") === child.href;
                          return (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                onClick={close}
                                aria-current={current ? "page" : undefined}
                                className={`flex min-h-11 items-center text-lg ${current ? "font-medium text-brand" : "text-text-2"}`}
                              >
                                {child.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
          <Link href={quote.href} onClick={close} className={`${button.primary} w-full`}>
            {quote.label}
            <ArrowRight aria-hidden="true" size={18} className={arrowClass} />
          </Link>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <a href={contact.telHref} className={`${button.secondary} text-sm`}>
              <Phone aria-hidden="true" size={18} />
              {labels.call}
            </a>
            <a href={contact.whatsappHref} target="_blank" rel="noopener" className={`${button.secondary} text-sm`}>
              <MessageCircle aria-hidden="true" size={18} />
              {labels.whatsapp}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
