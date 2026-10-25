import { preload } from "react-dom";
import images from "@/generated/images.json";
import { temporaryPhotos } from "@/config/photos";
import { PlaceholderPhoto } from "./PlaceholderPhoto";

interface ImageEntry {
  width: number;
  height: number;
  hash: string;
  widths: number[];
}

const manifest: Record<string, ImageEntry> = images;

/** Names of an existing numbered series, e.g. photoSeries("project-sample-house-") → [..-1, ..-2]. */
export function photoSeries(prefix: string): string[] {
  return Object.keys(manifest)
    .filter((name) => name.startsWith(prefix) && /^\d+$/.test(name.slice(prefix.length)))
    .sort((a, b) => Number(a.slice(prefix.length)) - Number(b.slice(prefix.length)));
}

export function hasPhoto(name: string): boolean {
  return name in manifest;
}

const srcSet = (name: string, entry: ImageEntry, format: "avif" | "webp") =>
  entry.widths.map((w) => `/images/${name}-${entry.hash}-${w}.${format} ${w}w`).join(", ");

/**
 * A photo from photos/<name>.jpg, served as AVIF/WebP at several widths (scripts/optimize-images.mjs).
 * Until that photo exists, shows the visible placeholder. `className` sizes the frame (e.g. an
 * aspect-ratio class); the image covers it, so any photo shape works. Temporary stock photos
 * (config/photos.ts) carry a small "Illustrative photo" label.
 */
export function Photo({
  name,
  alt,
  sizes,
  placeholderLabel,
  illustrativeLabel,
  className = "",
  priority = false,
  parallax = false,
  reveal = false,
  labelInFrame = true,
}: {
  name: string;
  alt: string;
  /** Rendered width at each breakpoint, e.g. "(min-width: 1024px) 50vw, 100vw". */
  sizes: string;
  placeholderLabel: string;
  /** Text of the label on temporary stock photos, from the locale's content (common.placeholder.illustrative). */
  illustrativeLabel: string;
  className?: string;
  /** Above-the-fold image (the hero): preloaded, loaded immediately at high priority. */
  priority?: boolean;
  /** Large images only: drift gently with scroll (ParallaxObserver). */
  parallax?: boolean;
  /** Reveal with a lifting mask when scrolled into view. */
  reveal?: boolean;
  /**
   * false: the caller places <IllustrativeLabel> itself (full-bleed backgrounds, where the frame
   * sits under scrims and the label must be drawn above them).
   */
  labelInFrame?: boolean;
}) {
  const entry = manifest[name];
  if (!entry) return <PlaceholderPhoto label={placeholderLabel} alt={alt} className={className} />;

  if (priority) {
    // <link rel="preload"> in <head>, so the browser starts the hero before parsing the body.
    preload(`/images/${name}-${entry.hash}-${entry.widths[0]}.avif`, {
      as: "image",
      type: "image/avif",
      imageSrcSet: srcSet(name, entry, "avif"),
      imageSizes: sizes,
      fetchPriority: "high",
    });
  }

  const fallbackWidth = entry.widths.find((w) => w >= 1200) ?? entry.widths.at(-1)!;
  const temporary = temporaryPhotos.has(name);
  return (
    // The frame's size comes from `className` (or the grid row), never from the photo's own shape,
    // so a portrait photo can't stretch a landscape slot: the image is absolutely positioned.
    <div className={`zoom-img relative overflow-hidden bg-band ${className}`} data-reveal={reveal ? "image" : undefined}>
      <picture
        className={`absolute inset-0 block ${parallax ? "scale-[1.08] will-change-transform" : ""}`}
        data-parallax={parallax ? "" : undefined}
      >
        <source type="image/avif" srcSet={srcSet(name, entry, "avif")} sizes={sizes} />
        <source type="image/webp" srcSet={srcSet(name, entry, "webp")} sizes={sizes} />
        {/* Plain <img>, not next/image: static export, and sizes are made at build time. */}
        <img
          src={`/images/${name}-${entry.hash}-${fallbackWidth}.webp`}
          alt={alt}
          width={entry.width}
          height={entry.height}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding={priority ? "sync" : "async"}
          className="size-full object-cover"
        />
      </picture>
      {temporary && labelInFrame && <IllustrativeLabel text={illustrativeLabel} className="absolute top-0 left-0" />}
    </div>
  );
}

/**
 * "Illustrative photo" chip on temporary stock photos (TODO(photo)). Its job is to say "this is not
 * Ambika's work", so it must be readable everywhere: opaque ink chip, #F2F0EB text (16.9:1), 12 px.
 * Placed top-left of the frame by default, a corner the bottom-right WhatsApp button never reaches.
 */
export function IllustrativeLabel({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span
      data-illustrative-label=""
      className={`t-meta z-[2] bg-[#0f0e0d] px-2.5 py-1.5 !text-[0.75rem] !tracking-[0.12em] text-[#f2f0eb] ${className}`}
    >
      {text}
    </span>
  );
}

/** True when a photo slot currently shows a temporary stock photo (so it needs the label). */
export function isTemporaryPhoto(name: string): boolean {
  return temporaryPhotos.has(name) && name in manifest;
}
