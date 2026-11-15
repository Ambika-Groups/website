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
    ...initial,
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
    const trimAll = <T extends Record<string, unknown>>(o: T | undefined) => Object.fromEntries(Object.entries(o ?? {}).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]));
    const next: SiteSettings = { ...s, identity: trimAll(s.identity), wording: trimAll(s.wording), privacy: trimAll(s.privacy), contact: cleanContact, videoId, numbers: { ...numbers, show: numbers.show && numbersReal }, trust: { ...trust, show: trust.show && trustReal } };
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


      <section className={`${panel} space-y-4 p-5`} aria-labelledby="set-identity">
        <h2 id="set-identity" className="text-base font-semibold">
          Company details
        </h2>
        <p className="max-w-2xl text-sm text-text-2">Rows left empty are hidden on the site (the name keeps &ldquo;Ambika Group&rdquo;). Never typed in code, so no rebuild is needed beyond Publish.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["name", "Trading name", "As on the site, e.g. Ambika Group"],
              ["legalName", "Registered legal name", "Exactly as on the GST certificate"],
              ["gstin", "GSTIN", "15 characters"],
              ["pan", "PAN", "Shown on the Government work page only"],
            ] as const
          ).map(([key, label, hint]) => (
            <Field key={key} label={label} hint={hint}>
              {(id) => <input id={id} className={inputClass} value={s.identity?.[key] ?? ""} onChange={(e) => setS({ ...s, identity: { ...s.identity, [key]: e.target.value } })} />}
            </Field>
          ))}
        </div>
      </section>

      <section className={`${panel} space-y-4 p-5`} aria-labelledby="set-wording">
        <h2 id="set-wording" className="text-base font-semibold">
          Wording the company decides
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Closing statement (footer)" hint="One line about the work. Empty shows the plain line “Planning a project?”.">
            {(id) => <input id={id} className={inputClass} value={s.wording?.closingStatement ?? ""} onChange={(e) => setS({ ...s, wording: { ...s.wording, closingStatement: e.target.value } })} />}
          </Field>
          <Field label="Response-time promise" hint="e.g. We call you back within one working day. Empty means no promise is made anywhere on the site.">
            {(id) => <input id={id} className={inputClass} value={s.wording?.responseTime ?? ""} onChange={(e) => setS({ ...s, wording: { ...s.wording, responseTime: e.target.value } })} />}
          </Field>
        </div>
        <label className="flex items-center gap-3 text-sm">
          <Switch label="The draft wording is approved" checked={s.wording?.copyApproved === true} onChange={(v) => setS({ ...s, wording: { ...s.wording, copyApproved: v } })} />
          I have read and approved the draft wording (Contact page, FAQ answers, service lists, Government work text, the consent sentence). Used by the launch check.
        </label>
      </section>

      <section className={`${panel} space-y-4 p-5`} aria-labelledby="set-about">
        <h2 id="set-about" className="text-base font-semibold">
          About page
        </h2>
        <p className="max-w-2xl text-sm text-text-2">The story and the people stay hidden until you fill them in.</p>
        <Field label="Company story" hint="Separate paragraphs with a blank line.">
          {(id) => (
            <textarea id={id} rows={6} className={inputClass} defaultValue={(s.about?.story ?? []).join("\n\n")} onBlur={(e) => setS({ ...s, about: { ...s.about, story: paras(e.target.value) } })} />
          )}
        </Field>
        <Field label="People shown" hint="One per line as Name | Role, e.g. Ramesh Verma | Founder. Leave empty to show no people.">
          {(id) => (
            <textarea
              id={id}
              rows={4}
              className={inputClass}
              defaultValue={(s.about?.people ?? []).map((p) => `${p.name} | ${p.role}`).join("\n")}
              onBlur={(e) => setS({ ...s, about: { ...s.about, people: pairs(e.target.value).map(([name, role]) => ({ name, role })) } })}
            />
          )}
        </Field>
      </section>

      <section className={`${panel} space-y-4 p-5`} aria-labelledby="set-gov">
        <h2 id="set-gov" className="text-base font-semibold">
          Government work
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Registrations" hint="One per line as Label | Value, e.g. Contractor class | Class A, PWD. Hidden while empty.">
            {(id) => (
              <textarea
                id={id}
                rows={5}
                className={inputClass}
                defaultValue={(s.government?.registrations ?? []).map((r) => `${r.label} | ${r.value}`).join("\n")}
                onBlur={(e) => setS({ ...s, government: { ...s.government, registrations: pairs(e.target.value).map(([label, value]) => ({ label, value })) } })}
              />
            )}
          </Field>
          <Field label="More departments you work with" hint="One per line, e.g. Jal Nigam. Nagar Nigam and PWD are always listed.">
            {(id) => (
              <textarea id={id} rows={5} className={inputClass} defaultValue={(s.government?.departments ?? []).join("\n")} onBlur={(e) => setS({ ...s, government: { ...s.government, departments: lines(e.target.value) } })} />
            )}
          </Field>
        </div>
      </section>

      <section className={`${panel} space-y-4 p-5`} aria-labelledby="set-re">
        <h2 id="set-re" className="text-base font-semibold">
          Real estate projects
        </h2>
        <Field label="Current and upcoming projects" hint="One per line as Name | Location, units, status, e.g. Ambika Residency | Lucknow, 2 and 3 BHK, booking open. The list is hidden while empty.">
          {(id) => (
            <textarea
              id={id}
              rows={4}
              className={inputClass}
              defaultValue={(s.realEstate?.projects ?? []).map((p) => `${p.title} | ${p.hint}`).join("\n")}
              onBlur={(e) => setS({ ...s, realEstate: { projects: pairs(e.target.value).map(([title, hint]) => ({ title, hint })) } })}
            />
          )}
        </Field>
      </section>

      <section className={`${panel} space-y-4 p-5`} aria-labelledby="set-privacy">
        <h2 id="set-privacy" className="text-base font-semibold">
          Privacy policy
        </h2>
        <label className="flex items-center gap-3 text-sm">
          <Switch label="The advocate has approved the privacy policy" checked={s.privacy?.approved === true} onChange={(v) => setS({ ...s, privacy: { ...s.privacy, approved: v } })} />
          The advocate has approved the policy text. This removes the &ldquo;draft&rdquo; notice and the square brackets in &ldquo;Who handles it&rdquo;.
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="How long enquiries are kept" hint="e.g. For as long as the enquiry or project is active, and then for 2 years.">
            {(id) => <input id={id} className={inputClass} value={s.privacy?.retention ?? ""} onChange={(e) => setS({ ...s, privacy: { ...s.privacy, retention: e.target.value } })} />}
          </Field>
          <Field label="“Last updated” date" hint="e.g. 12 November 2026">
            {(id) => <input id={id} className={inputClass} value={s.privacy?.updated ?? ""} onChange={(e) => setS({ ...s, privacy: { ...s.privacy, updated: e.target.value } })} />}
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

const paras = (v: string) => v.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
/** "Left | Right" per line; a line without a bar keeps its text as the left part. */
const pairs = (v: string): [string, string][] =>
  lines(v).map((l) => {
    const i = l.indexOf("|");
    return i === -1 ? [l, ""] : [l.slice(0, i).trim(), l.slice(i + 1).trim()];
  });
const lines = (v: string) => v.split("\n").map((s) => s.trim()).filter(Boolean);
function padTo<T>(list: T[], n: number, make: () => T): T[] {
  return [...list, ...Array.from({ length: Math.max(0, n - list.length) }, make)].slice(0, Math.max(n, list.length));
}
