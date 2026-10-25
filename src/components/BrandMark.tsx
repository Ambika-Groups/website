import Link from "next/link";
import { site } from "@/config/site";

// TODO(content): replace the "AG" text mark with the real logo once supplied.
export function BrandMark({ href }: { href: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 text-current">
      <span
        aria-hidden="true"
        className="grid size-9 place-items-center bg-[#c62828] font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.08em] text-white xl:size-10"
      >
        {site.shortMark}
      </span>
      <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-[0.04em] uppercase xl:text-xl">
        {site.name}
      </span>
    </Link>
  );
}
