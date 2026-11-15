"use client";

// Small building blocks for the admin (brand.md v4.1, calm): theme tokens only, so both themes work; 44 px+ tap
// targets; every control labelled.
import { X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60";
export const btn = {
  primary: `${base} bg-primary text-on-primary hover:bg-primary-hover hover:text-on-primary-hover`,
  secondary: `${base} border border-rule text-text hover:bg-text/[0.06]`,
  ghost: `${base} text-text-2 hover:bg-text/[0.06] hover:text-text`,
  danger: `${base} border border-error text-error hover:bg-error/10`,
};

export const inputClass =
  "block w-full rounded-field border border-input-border bg-surface px-3 py-2.5 text-base text-text placeholder:text-text-2 sm:text-sm";

export const panel = "rounded-card border border-divider bg-surface shadow-card";

export function Field({ label, hint, children, className = "" }: { label: string; hint?: ReactNode; children: (id: string) => ReactNode; className?: string }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-text">
        {label}
      </label>
      {children(id)}
      {hint && <p className="mt-1 text-xs text-text-2">{hint}</p>}
    </div>
  );
}

export function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="group inline-flex min-h-11 items-center disabled:opacity-60"
    >
      <span className={`relative h-6 w-11 rounded-full border transition-colors duration-200 ${checked ? "border-brand-strong bg-brand-strong" : "border-input-border bg-text/[0.08]"}`}>
        <span className={`absolute top-0.5 left-0.5 size-[18px] rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-5 bg-[#0b0b0c]" : "bg-text-2"}`} />
      </span>
    </button>
  );
}

const tones = {
  neutral: "border-divider text-text-2",
  brand: "border-brand/50 text-brand",
  success: "border-success/50 text-success",
  warning: "border-warning/60 text-warning",
};
export function Badge({ tone = "neutral", children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-chip border px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

/** Native <dialog>: focus trap, Escape and the backdrop come from the browser. */
export function Dialog({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      className={`m-auto max-h-[92dvh] w-[calc(100%-2rem)] ${wide ? "max-w-3xl" : "max-w-lg"} rounded-card border border-divider bg-elevated p-0 text-text shadow-card backdrop:bg-[#0b0b0c]/60`}
    >
      {open && (
        <div className="flex max-h-[92dvh] flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-divider px-5 py-3">
            <h2 id={titleId} className="t-h3 !text-lg">
              {title}
            </h2>
            <button type="button" onClick={onClose} className={btn.ghost} aria-label="Close">
              <X aria-hidden="true" size={18} />
            </button>
          </div>
          <div className="overflow-y-auto px-5 py-4">{children}</div>
        </div>
      )}
    </dialog>
  );
}

/** Loads data once (and again on reload()); state is only set after the promise resolves. */
export function useLoad<T>(load: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });
  useEffect(() => {
    let alive = true;
    loadRef
      .current()
      .then((d) => alive && (setData(d), setError(null)))
      .catch((e: Error) => alive && setError(e.message || "Could not load"));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, reload, setData };
}

/** Status line for saves, read out politely by screen readers. */
export function Status({ text, tone = "neutral" }: { text: string; tone?: "neutral" | "error" }) {
  return (
    <p role="status" aria-live="polite" className={`min-h-5 text-sm ${tone === "error" ? "text-error" : "text-text-2"}`}>
      {text}
    </p>
  );
}

/**
 * Resizes a photo in the browser before upload (longest side 2000 px, JPEG 85%), applying the camera's
 * orientation and dropping its metadata (including GPS). The build's photo pipeline then makes the srcset sizes.
 */
export async function compressImage(file: File, maxSide = 2000): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not compress"))), "image/jpeg", 0.85));
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

export const fmtDate = (isoString: string | null | undefined, withTime = false) =>
  isoString
    ? new Date(isoString).toLocaleString("en-IN", withTime ? { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" } : { day: "numeric", month: "short", year: "numeric" })
    : "—";

/**
 * Horizontal bars for one series (counts by category). One hue (brand red), count shown as text beside each bar,
 * so the value never depends on colour; it is a list, so screen readers read "label, count" in order.
 */
export function BarList({ items, total, label, empty = "No enquiries in this period." }: { items: { key: string; count: number }[]; total?: number; label: string; empty?: string }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  if (!items.length) return <p className="text-sm text-text-2">{empty}</p>;
  return (
    <ul aria-label={label} className="space-y-2.5">
      {items.map((i) => (
        <li key={i.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1" title={`${i.key}: ${i.count}`}>
          <span className="truncate text-sm text-text">{i.key}</span>
          <span className="text-sm tabular text-text-2">
            {i.count}
            {total ? <span className="ml-1.5 text-xs">({Math.round((i.count / total) * 100)}%)</span> : null}
          </span>
          <span aria-hidden="true" className="col-span-2 h-2 rounded-full bg-text/[0.06]">
            <span className="block h-2 rounded-full bg-brand-strong" style={{ width: `${(i.count / max) * 100}%`, minWidth: i.count ? 4 : 0 }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Vertical bars over time (one series). Bars anchored to the baseline with 4 px rounded tops and a 2 px gap; the
 * peak and last values are labelled; hovering a bar shows its value; the same numbers are in a table below.
 */
export function TimeBars({ items, label }: { items: { key: string; count: number }[]; label: string }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...items.map((i) => i.count));
  const peak = items.reduce((p, c, i) => (c.count > items[p].count ? i : p), 0);
  const total = items.reduce((s, i) => s + i.count, 0);
  if (!items.length) return null;
  return (
    <figure>
      <figcaption className="sr-only">
        {label}: {total} in total. The table below lists every period.
      </figcaption>
      {/* The bars are a picture for sighted pointer users (hover shows the value); keyboard and screen-reader users
          get the same numbers from the table, so the bars are not separate tab stops (90 tiny ones on a phone). */}
      <div aria-hidden="true" className="relative h-44" onMouseLeave={() => setActive(null)}>
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 border-b border-rule" />
        <div className="absolute inset-0 flex items-end gap-[2px]">
          {items.map((i, idx) => (
            <span
              key={i.key}
              onMouseEnter={() => setActive(idx)}
              className="group relative flex h-full min-w-0 flex-1 items-end"
            >
              <span
                className={`block w-full rounded-t-[4px] transition-colors ${active === idx ? "bg-brand" : "bg-brand-strong"}`}
                style={{ height: `${(i.count / max) * 100}%`, minHeight: i.count ? 2 : 0 }}
              />
              {(idx === peak || idx === items.length - 1) && i.count > 0 && items.length <= 60 && (
                <span aria-hidden="true" className="absolute left-1/2 -translate-x-1/2 text-xs tabular text-text-2" style={{ bottom: `calc(${(i.count / max) * 100}% + 4px)` }}>
                  {i.count}
                </span>
              )}
            </span>
          ))}
        </div>
        {active !== null && (
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 rounded-field border border-divider bg-elevated px-3 py-1.5 text-sm shadow-card">
            <span className="text-text-2">{items[active].key}</span> <strong className="tabular">{items[active].count}</strong>
          </div>
        )}
      </div>
      <div aria-hidden="true" className="mt-2 flex justify-between text-xs text-text-2 tabular">
        <span>{items[0].key}</span>
        <span>{items[items.length - 1].key}</span>
      </div>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-text-2">Show as a table ({total} in total)</summary>
        <table className="mt-2 w-full text-left">
          <caption className="sr-only">{label}</caption>
          <thead>
            <tr className="text-text-2">
              <th scope="col" className="py-1 font-medium">Period</th>
              <th scope="col" className="py-1 text-right font-medium">Enquiries</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.key} className="border-t border-divider">
                <td className="py-1 tabular">{i.key}</td>
                <td className="py-1 text-right tabular">{i.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
