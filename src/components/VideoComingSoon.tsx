import { Clapperboard } from "lucide-react";

/**
 * The Contact page's video slot while there is no video: the same 16:9 frame, 20 px corners and shadow as the player,
 * with a short note. Nothing is loaded from any third party. Replace it by giving a YouTube link in launch-answers.ts (Q21).
 */
export function VideoComingSoon({ title, body }: { title: string; body: string }) {
  return (
    <div className="mb-8 grid aspect-video w-full place-items-center rounded-card border border-divider bg-surface p-6 text-center shadow-card">
      <div>
        <span aria-hidden="true" className="mx-auto grid size-14 place-items-center rounded-full border border-divider text-accent">
          <Clapperboard size={24} />
        </span>
        <p className="t-h3 mt-4">{title}</p>
        <p className="mt-2 text-sm text-text-2">{body}</p>
      </div>
    </div>
  );
}
