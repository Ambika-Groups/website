"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  href: string;
  label: string;
}

/** True when `pathname` is the item's page or one of its sub-pages (e.g. /services/road-works). */
export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Tablet/desktop navigation: uppercase labels; a red rule draws in on hover and stays on the
 * active page. Colours come from the header's tone (light bar, or light-on-photo over the hero).
 */
export function NavLinks({ items, className = "" }: { items: NavItem[]; className?: string }) {
  const pathname = usePathname();
  return (
    <ul className={`flex items-stretch gap-1 ${className}`}>
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href} className="flex">
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`group/nav t-meta relative flex items-center px-3 transition-colors duration-200 ${
                active ? "text-text" : "text-text-2 hover:text-text"
              }`}
            >
              {item.label}
              <span
                aria-hidden="true"
                className={`absolute inset-x-3 bottom-3 h-[2px] origin-left bg-brand transition-transform duration-300 ease-out-quint ${
                  active ? "scale-x-100" : "scale-x-0 group-hover/nav:scale-x-100"
                }`}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
