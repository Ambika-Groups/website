// Light/dark theme: shared by the inline head script and the switch.

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "ag-theme";

/** Page background per theme (brand.md v4), used for <meta name="theme-color">. */
export const themeColors: Record<Theme, string> = { light: "#fffdf9", dark: "#0b0b0c" };

/** brand.md v4 is dark first: a first visit opens dark until the visitor chooses. Without JS the device setting decides. */
export const defaultTheme: Theme = "dark";

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.dataset.theme = theme;
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = themeColors[theme];
}

export function storedTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

export function storeTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage blocked: the choice lasts for this page view only.
  }
}


/**
 * Runs inline in <head> before first paint, so the page never flashes the wrong theme. Also adds
 * `js` to <html>, which scroll reveals key off, so nothing is hidden when scripts don't run.
 * Text is never hidden while fonts load (see app/fonts.ts).
 * Mirrors storedTheme/defaultTheme/applyTheme above in plain ES5; keep them in step.
 */
export const themeBootScript = `(function(){var d=document,t;d.documentElement.classList.add("js");try{t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})}catch(e){}if(t!=="light"&&t!=="dark"){t=${JSON.stringify(defaultTheme)}}d.documentElement.setAttribute("data-theme",t);var m=d.querySelector('meta[name="theme-color"]');if(!m){m=d.createElement("meta");m.name="theme-color";d.head.appendChild(m)}m.content=t==="dark"?${JSON.stringify(
  themeColors.dark,
)}:${JSON.stringify(themeColors.light)}})();`;
