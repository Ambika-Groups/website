"use client";

import { Play } from "lucide-react";
import { useRef, useState } from "react";
import { preconnect } from "react-dom";

interface Props {
  /** YouTube video ID. */
  id: string;
  title: string;
  /** Accessible name prefix for the play button, e.g. "Play video". */
  playLabel: string;
  /** Text for the no-JavaScript link to YouTube. */
  watchOnYoutube: string;
}

/**
 * Click-to-load YouTube player. Until the visitor presses play, the page shows only the poster (YouTube's
 * thumbnail image, which sets no cookies) and a play button, so the page stays fast and no player, script or
 * cookie loads. On press it swaps in the youtube-nocookie.com player with autoplay. Without JavaScript the
 * poster is a plain link to the video on YouTube. 16:9 at any width, 20 px corners (brand.md v4.1).
 */
export function VideoFacade({ id, title, playLabel, watchOnYoutube }: Props) {
  const [playing, setPlaying] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const watchUrl = `https://www.youtube.com/watch?v=${id}`;
  // Open the connection to the poster's host early (React puts this <link> in <head>; it sets no cookies).
  preconnect("https://i.ytimg.com");

  // The frame is dark in both themes on purpose (a video frame); data-video lets the theme test skip it.
  return (
    <div data-video="" className="relative aspect-video w-full overflow-hidden rounded-card border border-divider bg-[#0b0b0c] shadow-card">
      {playing ? (
        <iframe
          ref={frameRef}
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 size-full"
          onLoad={() => frameRef.current?.focus()}
        />
      ) : (
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener"
          onClick={(e) => {
            e.preventDefault();
            setPlaying(true);
          }}
          aria-label={`${playLabel}: ${title}`}
          className="group absolute inset-0 block"
        >
          {/* Plain <img>: an external poster (static export, no image optimiser). It is in the first screen, so it loads
              at once; phones get YouTube's 480 px thumbnail (always present; its 4:3 bars fall outside the 16:9
              crop), wider screens the 1280 px one. */}
          <picture>
            <source media="(min-width: 1024px)" srcSet={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`} />
            <img
              src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
              alt=""
              width={1280}
              height={720}
              decoding="async"
              className="size-full object-cover transition-transform duration-700 ease-[var(--ease-out-quint)] group-hover:scale-[1.04]"
            />
          </picture>
          <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,11,12,0.85),rgba(11,11,12,0.15)_55%,rgba(11,11,12,0.35))]" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-16 place-items-center rounded-full bg-[#f12136] text-[#0b0b0c] shadow-card transition-transform duration-300 ease-[var(--ease-spring)] group-hover:scale-110 sm:size-20">
              <Play aria-hidden="true" size={28} className="translate-x-0.5 fill-current" />
            </span>
          </span>
          <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 text-left sm:p-6">
            <span className="line-clamp-2 max-w-[40ch] font-[family-name:var(--font-display)] text-base font-semibold text-[#f5f3ef] sm:text-lg">
              {title}
            </span>
            <span className="t-meta hidden shrink-0 text-[#e4dfe1] sm:inline">{watchOnYoutube}</span>
          </span>
        </a>
      )}
    </div>
  );
}
