"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/**
 * Site-wide effects (brand.md v4, "Motion and effects"). CSS does the animating; this only sets classes and
 * custom properties. Re-scans on every page change. Under prefers-reduced-motion everything is revealed at
 * once and the pointer effects never start; without JavaScript nothing is hidden (reveals key off html.js).
 *   - [data-reveal]: one-time scroll reveal
 *   - [data-spotlight]: pointer glow on cards (--mx / --my), fine pointers only
 *   - [data-magnetic]: the main call-to-action drifts toward the pointer (--tx / --ty), at most 6 px
 *   - .marquee: paused while off-screen
 */
export function MotionObserver() {
  const pathname = usePathname();

  // Scroll reveals.
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed)"));
    if (reducedMotion() || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-revealed"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target); // once per element
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  // Spotlight and magnetic: one delegated pointer listener.
  useEffect(() => {
    if (reducedMotion() || !finePointer()) return;
    let frame = 0;
    let last: PointerEvent | null = null;
    let magnet: HTMLElement | null = null;
    const update = () => {
      frame = 0;
      const e = last;
      if (!e) return;
      const target = e.target instanceof Element ? e.target : null;
      const card = target?.closest<HTMLElement>("[data-spotlight]");
      if (card) {
        const box = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - box.left}px`);
        card.style.setProperty("--my", `${e.clientY - box.top}px`);
      }
      const m = target?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (magnet && magnet !== m) {
        magnet.style.removeProperty("--tx");
        magnet.style.removeProperty("--ty");
      }
      magnet = m;
      if (m) {
        const box = m.getBoundingClientRect();
        const dx = (e.clientX - (box.left + box.width / 2)) / (box.width / 2);
        const dy = (e.clientY - (box.top + box.height / 2)) / (box.height / 2);
        m.style.setProperty("--tx", `${(dx * 6).toFixed(1)}px`);
        m.style.setProperty("--ty", `${(dy * 4).toFixed(1)}px`);
      }
    };
    const onMove = (e: PointerEvent) => {
      last = e;
      if (!frame) frame = requestAnimationFrame(update);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  // Marquee: runs only while on screen.
  useEffect(() => {
    const strips = Array.from(document.querySelectorAll<HTMLElement>(".marquee"));
    if (strips.length === 0 || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        (entry.target as HTMLElement).toggleAttribute("data-paused", !entry.isIntersecting);
      }
    });
    strips.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
