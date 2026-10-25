import { ImageIcon } from "lucide-react";

// TODO(content): every use of this component marks a photo the user must supply.
// Swap for next/image (unoptimized) pointing at /public/images/... once photos arrive.
export function PlaceholderPhoto({
  label,
  alt,
  className = "",
}: {
  /** Visible "Photo placeholder" text, from the locale's content. */
  label: string;
  /** What the real photo will show; becomes its alt text. */
  alt: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`${label}: ${alt}`}
      className={`placeholder-photo flex items-center justify-center border border-dashed border-input-border ${className}`}
    >
      <span className="inline-flex items-center gap-1.5 bg-surface px-2.5 py-1 text-xs font-medium text-text-2">
        <ImageIcon aria-hidden="true" size={14} />
        {label}
      </span>
    </div>
  );
}
