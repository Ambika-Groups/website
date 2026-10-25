"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Site-wide motion (brand.md v3): one-time scroll reveals for [data-reveal] and gentle parallax for
 * [data-parallax] images. CSS does the animating; this only toggles a class / sets one transform.
 * Re-scans on every page change. Under prefers-reduced-motion: everything is revealed at once and
 * parallax never starts.
 */
export function MotionObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed)"));
    if (reduce || !("IntersectionObserver" in window)) {
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

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layers = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    if (layers.length === 0) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      for (const el of layers) {
        const box = el.parentElement!.getBoundingClientRect();
        if (box.bottom < 0 || box.top > vh) continue;
        // -1 … 1 as the frame crosses the viewport; at most ±4% of the frame's height.
        const progress = (box.top + box.height / 2 - vh / 2) / (vh / 2 + box.height / 2);
        el.style.transform = `translate3d(0, ${(progress * -4).toFixed(2)}%, 0) scale(1.08)`;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return null;
}
