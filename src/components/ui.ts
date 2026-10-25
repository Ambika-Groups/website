// Shared class strings, so buttons and containers look identical everywhere.
// brand.md v3: square corners, red only as a signature (the one main action, active states, markers).

export const container = "mx-auto w-full max-w-[90rem] px-4 sm:px-8 lg:px-12";

// 48 px tall on phones, 40 px from tablet up (brand.md tap targets); larger on desktop for presence.
const buttonBase =
  "group/btn inline-flex min-h-12 items-center justify-center gap-3 px-6 text-base font-medium transition-colors duration-200 lg:min-h-14 lg:px-7 disabled:cursor-not-allowed disabled:opacity-60";

export const button = {
  /** The single main action on a screen. */
  primary: `${buttonBase} bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-hover`,
  /** Outlined in the current text colour, for secondary actions (works on light, dark and photos). */
  secondary: `${buttonBase} border border-current text-text hover:bg-text hover:text-bg`,
  /** Text button in brand red. */
  text: `${buttonBase} px-3 text-brand hover:bg-selected`,
  /** Outlined button on photos and dark scrims (white). */
  onImage: `${buttonBase} border border-white/70 text-white hover:border-white hover:bg-white hover:text-[#0f0e0d]`,
};

/** The arrow used in links and buttons; nudges right on hover (globals.css .arrow-link / group-hover). */
export const arrowClass = "arrow transition-transform duration-300 group-hover/btn:translate-x-1.5";

export const card = "border border-divider bg-surface";

export const sectionTitle = "t-h2";
export const eyebrow = "t-meta text-text-2";

/** Input, select and textarea: 16 px text so phones don't zoom; full-strength placeholder colour. */
export const field =
  "block w-full border border-input-border bg-surface px-3 py-3 text-base text-text placeholder:text-text-2 aria-[invalid=true]:border-error aria-[invalid=true]:border-2 sm:py-2.5";
