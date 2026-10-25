import { Info } from "lucide-react";
import type { ReactNode } from "react";

/** Square, outlined notice with an icon and words (brand.md v2.1: badges and notices). */
export function Notice({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`flex items-start gap-2.5 border border-input-border bg-surface px-4 py-3 text-sm text-text ${className}`}>
      <Info aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-text-2" />
      <span>{children}</span>
    </p>
  );
}
