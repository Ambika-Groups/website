// Shared class strings, so buttons, cards and fields look identical everywhere.
// brand.md v4: pill buttons, 20 px cards, 12 px fields, soft large shadows; #F12136 is the main action.

export const container = "mx-auto w-full max-w-[90rem] px-4 sm:px-8 lg:px-12";

// 48 px tall on phones, 40 px from tablet up (tap targets); larger on desktop for presence.
const buttonBase =
  "group/btn inline-flex min-h-12 items-center justify-center gap-3 rounded-full px-6 text-base font-medium transition-[background-color,color,border-color,transform] duration-300 ease-[var(--ease-out-quint)] lg:min-h-14 lg:px-7 disabled:cursor-not-allowed disabled:opacity-60";

export const button = {
  /** The single main action on a screen: #F12136 with an ink label (white on #F12136 is only 4.19:1). */
  primary: `${buttonBase} bg-primary text-on-primary hover:bg-primary-hover hover:text-on-primary-hover active:bg-primary-hover active:text-on-primary-hover`,
  /** Outlined in the current text colour, for secondary actions (works on light, dark and photos). */
  secondary: `${buttonBase} border border-current text-text hover:bg-text hover:text-bg`,
  /** Text button in red. */
  text: `${buttonBase} px-4 text-brand hover:bg-selected`,
  /** Outlined button on photos and dark scrims (white). */
  onImage: `${buttonBase} border border-white/70 text-white hover:border-white hover:bg-white hover:text-[#0b0b0c]`,
};

/** The arrow used in links and buttons; nudges right on hover (globals.css .arrow-link / group-hover). */
export const arrowClass = "arrow transition-transform duration-300 group-hover/btn:translate-x-1.5";

/** A card: 20 px radius, thin border, the soft large shadow. Add `data-spotlight` for the pointer glow. */
export const card = "rounded-card border border-divider bg-surface shadow-card";

/** A small card or tile: 12 px radius. */
export const tile = "rounded-field border border-divider bg-surface";

export const sectionTitle = "t-h2";
export const eyebrow = "t-meta text-text-2";

/** A pill chip for eyebrows and small labels. */
export const chip = "t-meta inline-flex items-center gap-2 rounded-full border border-divider px-3 py-1.5";

/** Input, select and textarea: 16 px text so phones don't zoom; 12 px radius; full-strength placeholder colour. */
export const field =
  "block w-full rounded-field border border-input-border bg-surface px-3.5 py-3 text-base text-text placeholder:text-text-2 aria-[invalid=true]:border-error aria-[invalid=true]:border-2 sm:py-2.5";
