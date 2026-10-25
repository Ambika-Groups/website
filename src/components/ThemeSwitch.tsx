"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { applyTheme, deviceTheme, storedTheme, storeTheme, type Theme } from "@/lib/theme";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const readTheme = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

/** Square switch with a visible label (brand.md v2, "Light / dark switch"). */
export function ThemeSwitch({ label, className = "" }: { label: string; className?: string }) {
  // Server render has no theme; the switch settles on the real value right after hydration.
  const theme = useSyncExternalStore<Theme | null>(subscribe, readTheme, () => null);
  const dark = theme === "dark";

  // Until the visitor chooses, follow the device setting as it changes.
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (storedTheme() === null) applyTheme(deviceTheme());
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  function toggle() {
    const next: Theme = dark ? "light" : "dark";
    applyTheme(next);
    storeTheme(next);
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      onClick={toggle}
      className={`inline-flex min-h-12 items-center gap-2.5 px-2 text-sm font-medium text-text transition-colors duration-150 hover:bg-band sm:min-h-10 ${className}`}
    >
      {dark ? <Moon aria-hidden="true" size={18} /> : <Sun aria-hidden="true" size={18} />}
      <span>{label}</span>
      <span
        aria-hidden="true"
        className={`relative ml-auto inline-block h-5 w-9 shrink-0 border transition-colors duration-150 ${
          dark ? "border-primary bg-primary" : "border-input-border bg-surface"
        }`}
      >
        <span
          // Anchored at left-0, then moved by translate: off = left end, on = right end of the track.
          className={`absolute top-0.5 left-0 size-3.5 transition-transform duration-150 ${
            dark ? "translate-x-[18px] bg-on-primary" : "translate-x-0.5 bg-input-border"
          }`}
        />
      </span>
    </button>
  );
}
