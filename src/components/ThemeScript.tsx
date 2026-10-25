import { themeBootScript } from "@/lib/theme";

/** Put inside <head> in every root layout. Sets data-theme before first paint. */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />;
}
