"use client";

import { ExternalLink, MapPin } from "lucide-react";
import { useState } from "react";
import { button } from "./ui";

/** Click-to-load map: no Google iframe (or its cookies and weight) until the visitor asks. */
export function MapEmbed({
  embedUrl,
  openUrl,
  loadLabel,
  openLabel,
  note,
  title,
}: {
  embedUrl: string;
  openUrl: string;
  loadLabel: string;
  openLabel: string;
  note: string;
  title: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="mt-4 space-y-3">
      {loaded ? (
        <iframe
          src={embedUrl}
          title={title}
          className="aspect-[4/3] w-full border border-divider"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="placeholder-photo flex aspect-[4/3] flex-col items-center justify-center gap-2 border border-divider p-4 text-center">
          <button type="button" onClick={() => setLoaded(true)} className={button.secondary}>
            <MapPin aria-hidden="true" size={18} />
            {loadLabel}
          </button>
          <p className="bg-surface px-2 py-0.5 text-xs text-text-2">{note}</p>
        </div>
      )}
      <a
        href={openUrl}
        target="_blank"
        rel="noopener"
        className="inline-flex min-h-12 items-center gap-1.5 font-medium text-brand underline-offset-2 hover:underline sm:min-h-10"
      >
        {openLabel}
        <ExternalLink aria-hidden="true" size={16} />
      </a>
    </div>
  );
}
