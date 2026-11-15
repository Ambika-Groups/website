import Link from "next/link";
import { site } from "@/config/site";

// TODO(content): replace the "AG" text mark with the real logo once supplied.
// brand.md v4: a rounded #F12136 tile with an ink label (white on #F12136 is only 4.19:1).
export function BrandMark({ href }: { href: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 text-current">
      <span
        aria-hidden="true"
        className="grid size-9 place-items-center rounded-[12px] bg-[#f12136] font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.04em] text-[#0b0b0c] xl:size-10"
      >
        {site.shortMark}
      </span>
      <span className="font-[family-name:var(--font-display)] text-lg font-semibold xl:text-xl">
        {site.name}
      </span>
    </Link>
  );
}
