"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export interface NavItem {
  href: string;
  label: string;
  /** Pages listed under this item: a dropdown on tablet/desktop, sub-items in the phone menu. */
  children?: NavItem[];
  /** Accessible name of the button that opens `children`. */
  childrenLabel?: string;
}

/** True when `pathname` is the item's page or one of its sub-pages (e.g. /services/road-works). */
export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Ignores a trailing slash, so /services/ marks the same link as /services. */
const samePage = (pathname: string, href: string) => (pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname) === href;

const pill = (active: boolean) =>
  `relative my-auto flex min-h-10 items-center gap-2 rounded-full px-3.5 text-[0.9375rem] font-medium transition-colors duration-200 ${
    active ? "bg-text/[0.07] text-text" : "text-text-2 hover:bg-text/[0.05] hover:text-text"
  }`;

/**
 * Tablet/desktop navigation (brand.md v4): plain labels in pills; a soft pill shows on hover, and the active
 * page keeps its pill with a small red dot. Colours come from the header's tone (light bar, or over the hero).
 */
export function NavLinks({ items, className = "" }: { items: NavItem[]; className?: string }) {
  const pathname = usePathname();
  return (
    <ul className={`flex items-stretch gap-1 ${className}`}>
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const link = (
          <Link href={item.href} aria-current={samePage(pathname, item.href) ? "page" : undefined} className={pill(active)}>
            {active && <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-strong" />}
            {item.label}
          </Link>
        );
        return item.children ? (
          <Dropdown key={item.href} item={item} link={link} pathname={pathname} />
        ) : (
          <li key={item.href} className="flex">
            {link}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Disclosure dropdown (WAI-ARIA disclosure pattern, not a menu): the label stays a plain link to its page, and a
 * chevron button beside it (aria-expanded) shows or hides the list of sub-pages; Tab then moves through them. It
 * also opens while a mouse rests on the item. It closes when the pointer or keyboard focus leaves, or on Escape
 * (focus returns to the button).
 */
function Dropdown({ item, link, pathname }: { item: NavItem; link: ReactNode; pathname: string }) {
  // Remembers the page it was opened on, so moving to another page closes it without an effect.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (next: boolean | ((was: boolean) => boolean)) =>
    setOpenOn((was) => ((typeof next === "function" ? next(was === pathname) : next) ? pathname : null));
  const liRef = useRef<HTMLLIElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpenOn(null);
      if (liRef.current?.contains(document.activeElement)) buttonRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const hoverable = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  return (
    <li
      ref={liRef}
      className="relative flex"
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        window.clearTimeout(closeTimer.current);
        setOpen(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        // A short grace period, so crossing the gap to the panel does not close it.
        closeTimer.current = window.setTimeout(() => setOpen(false), 160);
      }}
      onBlur={(e) => {
        if (!liRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      {link}
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={item.childrenLabel}
        // With a mouse resting on the item the list is already open, so a click keeps it open; keyboard (detail 0)
        // and touch toggle it.
        onClick={(e) => setOpen((v) => (e.detail > 0 && hoverable() ? true : !v))}
        className="my-auto -ml-1.5 grid size-10 place-items-center rounded-full text-text-2 transition-colors duration-200 hover:bg-text/[0.05] hover:text-text"
      >
        <ChevronDown aria-hidden="true" size={16} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="absolute top-full left-0 z-40 pt-2"
      >
        <ul className="w-64 rounded-card border border-divider bg-elevated p-2 shadow-card">
          {item.children!.map((child) => {
            const current = samePage(pathname, child.href);
            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  aria-current={current ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`flex min-h-11 items-center gap-2.5 rounded-field px-3 text-[0.9375rem] transition-colors duration-200 ${
                    current ? "bg-text/[0.07] font-medium text-text" : "text-text-2 hover:bg-text/[0.05] hover:text-text"
                  }`}
                >
                  <span aria-hidden="true" className={`size-1.5 flex-none rounded-full ${current ? "bg-brand-strong" : "bg-transparent"}`} />
                  {child.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </li>
  );
}
