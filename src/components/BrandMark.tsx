import Link from "next/link";
import { site } from "@/config/site";
import logo from "@/generated/logo.json";

interface LogoFile {
  src: string;
  width: number;
  height: number;
}
const manifest = logo as { present: boolean; light?: LogoFile; dark?: LogoFile | null };

/**
 * The company mark and name. With no logo file it is the red "AG" tile (brand.md v4: a rounded #F12136 tile with an
 * ink label, since white on #F12136 is only 4.19:1). Drop photos/logo.svg (or logo.png, plus an optional logo-dark.*
 * for dark backgrounds) and rebuild: the logo replaces the tile here and in the footer, with no code change
 * (scripts/prepare-logo.mjs, photos/README.md).
 */
export function BrandMark({ href }: { href: string }) {
  const light = manifest.present ? manifest.light : undefined;
  const dark = manifest.present ? manifest.dark : undefined;
  return (
    <Link href={href} className="flex items-center gap-3 text-current">
      {light ? (
        <>
          {/* Plain <img>: a small static file with its size set, so nothing shifts while it loads. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={light.src} width={light.width} height={light.height} alt="" className={`brand-logo-light h-9 w-auto max-w-[8rem] object-contain xl:h-10 ${dark ? "" : "brand-logo-only"}`} />
          {dark && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dark.src} width={dark.width} height={dark.height} alt="" className="brand-logo-dark h-9 w-auto max-w-[8rem] object-contain xl:h-10" />
          )}
        </>
      ) : (
        <span
          aria-hidden="true"
          className="grid size-9 place-items-center rounded-[12px] bg-[#f12136] font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.04em] text-[#0b0b0c] xl:size-10"
        >
          {site.shortMark}
        </span>
      )}
      <span className="font-[family-name:var(--font-display)] text-lg font-semibold xl:text-xl">{site.name}</span>
    </Link>
  );
}
