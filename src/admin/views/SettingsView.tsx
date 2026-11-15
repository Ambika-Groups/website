"use client";

import { useState } from "react";
import type { AdminStore, CrmLink, SiteSettings } from "../types";
import { Badge, btn, Field, fmtDate, inputClass, panel, Status, Switch, useLoad } from "../ui";

type Contact = NonNullable<SiteSettings["contact"]>;
const contactFields: [keyof Contact, string, string?][] = [
  ["phoneDisplay", "Phone, as shown", "e.g. +91 98765 43210"],
  ["phoneE164", "Phone, for dialling", "+91 and 10 digits, no spaces"],
  ["whatsappDisplay", "WhatsApp, as shown"],
  ["whatsappDigits", "WhatsApp number", "Digits only with 91, e.g. 919876543210"],
  ["email", "Enquiry email"],
  ["hours", "Office hours", "e.g. Mon–Sat, 10:00–18:00"],
  ["street", "Address line"],
  ["locality", "City"],
  ["region", "State"],
  ["postalCode", "PIN code"],
  ["serviceArea", "Service area", "e.g. Lucknow and nearby districts"],
  ["mapUrl", "Google Maps link (optional)"],
];

export function SettingsView({ store, onChanged }: { store: AdminStore; onChanged: () => void }) {
  const { data: loaded, error } = useLoad<SiteSettings>(() => store.getSiteSettings(), []);
  if (error) return <p className="text-error">Could not load settings: {error}</p>;
  if (!loaded) return <p role="status">Loading…</p>;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="t-h2 !text-3xl">Site settings</h1>
        <p className="mt-1 max-w-2xl text-text-2">Empty fields keep what the site shows today. Changes go live with the next &ldquo;Publish site&rdquo;.</p>
      </div>
      <SiteSettingsForm initial={loaded} store={store} onChanged={onChanged} />
      <CrmLinkForm store={store} />
    </div>
  );
}

function SiteSettingsForm({ initial, store, onChanged }: { initial: SiteSettings; store: AdminStore; onChanged: () => void }) {
  const [s, setS] = useState<SiteSettings>({
    contact: initial.contact ?? {},
    videoId: initial.videoId ?? "",
    numbers: { show: initial.numbers?.show ?? false, items: padTo(initial.numbers?.items ?? [], 4, () => ({ value: "", label: "" })) },
    trust: { show: initial.trust?.show ?? false, logos: initial.trust?.logos ?? [], certifications: initial.trust?.certifications ?? [] },
  });
  const [msg, setMsg] = useState<{ text: string; tone?: "error" }>({ text: "" });
  const contact = s.contact ?? {};
  const numbers = s.numbers!;
  const trust = s.trust!;
  const numbersReal = numbers.items.every((i) => i.value.trim() && i.label.trim() && !i.value.startsWith("["));
  const trustReal = trust.logos.length > 0 && [...trust.logos, ...trust.certifications].every((v) => v.trim() && !v.startsWith("["));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = (s.videoId ?? "").trim().replace(/^.*(?:v=|youtu\.be\/|embed\/)([\w-]{11}).*$/, "$1");
    if (videoId && !/^[\w-]{11}$/.test(videoId)) return setMsg({ text: "The video id should be 11 characters (or paste the YouTube link).", tone: "error" });
    const cleanContact = Object.fromEntries(Object.entries(contact).map(([k, v]) => [k, (v ?? "").trim()]).filter(([, v]) => v));
    const next: SiteSettings = { ...s, contact: cleanContact, videoId, numbers: { ...numbers, show: numbers.show && numbersReal }, trust: { ...trust, show: trust.show && trustReal } };
    try {
      await store.saveSiteSettings(next);
      setS(next);
      setMsg({ text: "Saved. It goes live with the next “Publish site”." });
      onChanged();
    } catch (err) {
      setMsg({ text: `Not saved: ${(err as Error).message}`, tone: "error" });
    }
  };

  return (
    <form onSubmit={save} className="space-y-6">
      <section className={`${panel} p-5`} aria-labelledby="set-contact">
        <h2 id="set-contact" className="mb-4 text-base font-semibold">
          Contact details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contactFields.map(([key, label, hint]) => (
            <Field key={key} label={label} hint={hint}>
              {(id) => <input id={id} className={inputClass} value={contact[key] ?? ""} onChange={(e) => setS({ ...s, contact: { ...contact, [key]: e.target.value } })} />}
            </Field>
          ))}
        </div>
      </section>

      <section className={`${panel} p-5`} aria-labelledby="set-video">
        <h2 id="set-video" className="mb-4 text-base font-semibold">
          Contact page video
        </h2>
        <Field label="YouTube video id or link" hint="Leave empty to hide the video section on the Contact page.">
          {(id) => <input id={id} className={`${inputClass} max-w-md`} value={s.videoId ?? ""} onChange={(e) => setS({ ...s, videoId: e.target.value })} />}
        </Field>
      </section>

      <section className={`${panel} space-y-4 p-5`} aria-labelledby="set-numbers">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="set-numbers" className="text-base font-semibold">
            &ldquo;In numbers&rdquo; section (Home)
          </h2>
          <label className="flex items-center gap-2 text-sm">
            Show on the site
            <Switch label="Show the numbers section" checked={numbers.show} onChange={(v) => setS({ ...s, numbers: { ...numbers, show: v } })} />
          </label>
        </div>
        {numbers.show && !numbersReal && <Badge tone="warning">Fill in all four real figures; until then the section stays hidden.</Badge>}
        <div className="grid gap-3 sm:grid-cols-2">
          {numbers.items.map((item, i) => (
            <div key={i} className="grid grid-cols-[7rem_1fr] gap-2">
              <label>
                <span className="sr-only">Figure {i + 1}</span>
                <input className={inputClass} placeholder="e.g. 15+" value={item.value} onChange={(e) => setS({ ...s, numbers: { ...numbers, items: numbers.items.map((x, k) => (k === i ? { ...x, value: e.target.value } : x)) } })} />
              </label>
              <label>
                <span className="sr-only">Label {i + 1}</span>
                <input className={inputClass} placeholder="e.g. Years of work" value={item.label} onChange={(e) => setS({ ...s, numbers: { ...numbers, items: numbers.items.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)) } })} />
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className={`${panel} space-y-4 p-5`} aria-labelledby="set-trust">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="set-trust" className="text-base font-semibold">
            &ldquo;Trusted by&rdquo; section (Home)
          </h2>
          <label className="flex items-center gap-2 text-sm">
            Show on the site
            <Switch label="Show the trusted-by section" checked={trust.show} onChange={(v) => setS({ ...s, trust: { ...trust, show: v } })} />
          </label>
        </div>
        {trust.show && !trustReal && <Badge tone="warning">Add at least one real client (with their permission); until then the section stays hidden.</Badge>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Clients" hint="One per line. Only clients who agreed to be named.">
            {(id) => <textarea id={id} rows={5} className={inputClass} defaultValue={trust.logos.join("\n")} onBlur={(e) => setS({ ...s, trust: { ...trust, logos: lines(e.target.value) } })} />}
          </Field>
          <Field label="Registrations and certificates" hint="One per line.">
            {(id) => (
              <textarea id={id} rows={5} className={inputClass} defaultValue={trust.certifications.join("\n")} onBlur={(e) => setS({ ...s, trust: { ...trust, certifications: lines(e.target.value) } })} />
            )}
          </Field>
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button type="submit" className={btn.primary}>
          Save settings
        </button>
        <Status text={msg.text} tone={msg.tone} />
      </div>
    </form>
  );
}

function CrmLinkForm({ store }: { store: AdminStore }) {
  const { data: link, reload } = useLoad<CrmLink>(() => store.getCrmLink(), []);
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const [key, setKey] = useState("");
  const [msg, setMsg] = useState<{ text: string; tone?: "error" }>({ text: "" });
  const url = baseUrl ?? link?.baseUrl ?? "";

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (url && !/^https:\/\/[^\s]+$/.test(url)) return setMsg({ text: "Use the full https:// address of the CRM API.", tone: "error" });
    try {
      await store.saveCrmLink(url.replace(/\/$/, ""), key);
      setKey("");
      setMsg({ text: "Saved. New enquiries will be forwarded once the CRM accepts them." });
      reload();
    } catch (err) {
      setMsg({ text: `Not saved: ${(err as Error).message}`, tone: "error" });
    }
  };

  return (
    <form onSubmit={save} className={`${panel} space-y-4 p-5`} aria-labelledby="set-crm">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="set-crm" className="text-base font-semibold">
          CRM link
        </h2>
        <Badge tone={link?.baseUrl && link.keySet ? "success" : "neutral"}>{link?.baseUrl && link.keySet ? "Configured" : "Not connected yet"}</Badge>
      </div>
      <p className="max-w-2xl text-sm text-text-2">
        When the CRM&rsquo;s API is ready, enter its address and key here. Each new enquiry is then also sent to the CRM, and projects can link to it. The key is stored on the server
        side only: it is never shown again, not even here.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="CRM API address">{(id) => <input id={id} type="url" className={inputClass} placeholder="https://…" value={url} onChange={(e) => setBaseUrl(e.target.value)} />}</Field>
        <Field label="API key" hint={link?.keySet ? `A key is saved (${fmtDate(link.updatedAt)}). Leave empty to keep it.` : "No key saved yet."}>
          {(id) => <input id={id} type="password" autoComplete="off" className={inputClass} value={key} onChange={(e) => setKey(e.target.value)} />}
        </Field>
      </div>
      <div className="flex items-center gap-4">
        <button type="submit" className={btn.secondary}>
          Save CRM link
        </button>
        <Status text={msg.text} tone={msg.tone} />
      </div>
    </form>
  );
}

const lines = (v: string) => v.split("\n").map((s) => s.trim()).filter(Boolean);
function padTo<T>(list: T[], n: number, make: () => T): T[] {
  return [...list, ...Array.from({ length: Math.max(0, n - list.length) }, make)].slice(0, Math.max(n, list.length));
}
