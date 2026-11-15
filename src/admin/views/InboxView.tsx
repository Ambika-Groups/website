"use client";

import { AlertTriangle, Download, MessageCircle, Phone, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toCsv } from "@/lib/csv";
import { enquiryStatuses, type AdminStore, type AdminUser, type Enquiry, type EnquiryStatus } from "../types";
import { Badge, btn, Dialog, fmtDate, inputClass, panel, Status, useLoad } from "../ui";

const PAGE = 20;
const workLabels: Record<string, string> = { house: "House", apartment: "Apartment", road: "Road", interlocking: "Interlocking / paver", other: "Other" };
const statusTone: Record<EnquiryStatus, "brand" | "neutral" | "success" | "warning"> = { new: "brand", contacted: "neutral", quoted: "warning", won: "success", lost: "neutral" };

const csvColumns: [string, (e: Enquiry) => unknown][] = [
  ["Received", (e) => e.createdAt],
  ["Status", (e) => e.status],
  ["Name", (e) => e.name],
  ["Phone", (e) => e.phone],
  ["Email", (e) => e.email],
  ["Work type", (e) => e.work_type],
  ["Location", (e) => e.location],
  ["Size or budget", (e) => e.size_or_budget],
  ["Message", (e) => e.message],
  ["Page", (e) => e.source_url],
  ["Form", (e) => e.form_id],
  ["UTM source", (e) => e.utm_source],
  ["UTM medium", (e) => e.utm_medium],
  ["UTM campaign", (e) => e.utm_campaign],
  ["UTM term", (e) => e.utm_term],
  ["UTM content", (e) => e.utm_content],
  ["Language", (e) => e.lang],
  ["First contact", (e) => e.firstContactAt ?? ""],
  ["Notes", (e) => e.notes.map((n) => `${n.at} ${n.by}: ${n.text}`).join(" | ")],
  ["Needs checking", (e) => (e.needsChecking ? "yes" : "")],
];

export function InboxView({ store, user }: { store: AdminStore; user: AdminUser }) {
  const { data, error, setData } = useLoad<Enquiry[]>(() => store.listEnquiries(), []);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | EnquiryStatus | "check">("");
  const [work, setWork] = useState("");
  const [source, setSource] = useState("");
  const [sort, setSort] = useState<"new" | "old" | "name">("new");
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);

  const sources = useMemo(() => [...new Set((data ?? []).map((e) => e.utm_source || "direct"))].sort(), [data]);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = (data ?? []).filter(
      (e) =>
        (!status || (status === "check" ? e.needsChecking : e.status === status)) &&
        (!work || e.work_type === work) &&
        (!source || (e.utm_source || "direct") === source) &&
        (!needle || [e.name, e.phone, e.email, e.location, e.message, e.form_id].some((v) => v?.toLowerCase().includes(needle))),
    );
    return list.sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : sort === "old" ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt)));
  }, [data, q, status, work, source, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const current = Math.min(page, pages - 1);
  const rows = filtered.slice(current * PAGE, current * PAGE + PAGE);
  const open = data?.find((e) => e.id === openId) ?? null;

  const update = async (e: Enquiry, patch: Partial<Enquiry>) => {
    await store.updateEnquiry(e.id, patch);
    setData((all) => all?.map((x) => (x.id === e.id ? { ...x, ...patch } : x)));
  };

  const exportCsv = () => {
    const csv = toCsv(
      csvColumns.map(([h]) => h),
      filtered.map((e) => csvColumns.map(([, get]) => get(e))),
    );
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `enquiries-${new Date().toLocaleDateString("en-CA")}.csv`; // local YYYY-MM-DD
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetPage = <T,>(set: (v: T) => void) => (v: T) => (set(v), setPage(0));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="t-h2 !text-3xl">Enquiries</h1>
          <p className="mt-1 text-text-2">{data ? `${filtered.length} of ${data.length}` : "Loading…"}</p>
        </div>
        <button type="button" className={btn.secondary} onClick={exportCsv} disabled={!filtered.length}>
          <Download aria-hidden="true" size={16} /> Export CSV ({filtered.length})
        </button>
      </div>

      <div className={`${panel} grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]`}>
        <label className="relative block">
          <span className="sr-only">Search name, phone, location or message</span>
          <Search aria-hidden="true" size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-text-2" />
          <input type="search" className={`${inputClass} pl-9`} placeholder="Search name, phone, place, message" value={q} onChange={(e) => resetPage(setQ)(e.target.value)} />
        </label>
        <label>
          <span className="sr-only">Status</span>
          <select className={inputClass} value={status} onChange={(e) => resetPage(setStatus)(e.target.value as typeof status)}>
            <option value="">All statuses</option>
            {enquiryStatuses.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
            <option value="check">Needs checking</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Type of work</span>
          <select className={inputClass} value={work} onChange={(e) => resetPage(setWork)(e.target.value)}>
            <option value="">All work types</option>
            {Object.entries(workLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Source</span>
          <select className={inputClass} value={source} onChange={(e) => resetPage(setSource)(e.target.value)}>
            <option value="">All sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Sort</span>
          <select className={inputClass} value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="new">Newest first</option>
            <option value="old">Oldest first</option>
            <option value="name">Name A–Z</option>
          </select>
        </label>
      </div>

      {error && <p className="text-error">Could not load enquiries: {error}</p>}

      <ul className="space-y-2">
        {rows.map((e) => (
          <li key={e.id}>
            <button type="button" onClick={() => setOpenId(e.id)} className={`${panel} block w-full p-4 text-left shadow-none transition-colors hover:border-rule`}>
              <span className="flex flex-wrap items-center gap-2">
                <strong className="font-semibold">{e.name}</strong>
                <Badge tone={statusTone[e.status]}>{e.status}</Badge>
                {e.needsChecking && (
                  <Badge tone="warning">
                    <AlertTriangle aria-hidden="true" size={12} /> needs checking
                  </Badge>
                )}
                {e.sample && <Badge>sample</Badge>}
                <span className="ml-auto text-sm text-text-2 tabular">{fmtDate(e.createdAt, true)}</span>
              </span>
              <span className="mt-1 block text-sm text-text-2">
                {workLabels[e.work_type] ?? e.work_type} · {e.location} · {e.phone} · {e.utm_source || "direct"} · {e.form_id}
              </span>
              <span className="mt-1 block truncate text-sm">{e.message}</span>
            </button>
          </li>
        ))}
      </ul>
      {data && !filtered.length && <p className="text-text-2">No enquiries match these filters.</p>}

      {pages > 1 && (
        <nav aria-label="Pages" className="flex items-center justify-center gap-2">
          <button type="button" className={btn.secondary} disabled={current === 0} onClick={() => setPage(current - 1)}>
            Previous
          </button>
          <span className="text-sm text-text-2 tabular">
            Page {current + 1} of {pages}
          </span>
          <button type="button" className={btn.secondary} disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>
            Next
          </button>
        </nav>
      )}

      <Dialog open={!!open} onClose={() => setOpenId(null)} title={open ? open.name : "Enquiry"} wide>
        {open && <EnquiryDetail enquiry={open} user={user} update={update} />}
      </Dialog>
    </div>
  );
}

function EnquiryDetail({ enquiry: e, user, update }: { enquiry: Enquiry; user: AdminUser; update: (e: Enquiry, patch: Partial<Enquiry>) => Promise<void> }) {
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<{ text: string; tone?: "error" }>({ text: "" });
  const digits = e.phone.replace(/\D/g, "");
  const now = () => new Date().toISOString();

  const save = async (patch: Partial<Enquiry>, done: string) => {
    try {
      await update(e, patch);
      setMsg({ text: done });
    } catch (err) {
      setMsg({ text: `Not saved: ${(err as Error).message}`, tone: "error" });
    }
  };
  // The first call, WhatsApp or status change counts as the first contact (the response-time measure).
  const firstContact = () => (e.firstContactAt ? {} : { firstContactAt: now() });

  const rows: [string, React.ReactNode][] = [
    ["Received", fmtDate(e.createdAt, true)],
    ["Phone", e.phone],
    ["Email", e.email || "—"],
    ["Work", `${workLabels[e.work_type] ?? e.work_type}${e.work_type_raw ? ` (sent as "${e.work_type_raw}")` : ""}`],
    ["Location", e.location],
    ["Size or budget", e.size_or_budget || "—"],
    ["Language", e.lang],
    ["Page", e.source_url],
    ["Form", e.form_id],
    ["UTM", [e.utm_source, e.utm_medium, e.utm_campaign, e.utm_term, e.utm_content].map((v) => v || "–").join(" / ")],
    ["First contact", e.firstContactAt ? fmtDate(e.firstContactAt, true) : "Not yet"],
    ["Owner email", e.email_status ?? "—"],
    ["CRM", e.crm_status ?? "—"],
  ];

  return (
    <div className="space-y-5">
      {e.needsChecking && (
        <p className="rounded-field border border-warning/60 px-3 py-2 text-sm">
          This enquiry failed a check ({(e.rejectReasons ?? []).join(", ") || "unknown"}) but has consent and a phone number, so it was kept. Call to confirm the details.
        </p>
      )}
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <a href={`tel:+${digits}`} className={btn.primary} onClick={() => !e.firstContactAt && save(firstContact(), "First contact recorded.")}>
          <Phone aria-hidden="true" size={16} /> Call
        </a>
        <a href={`https://wa.me/${digits}`} target="_blank" rel="noopener" className={btn.secondary} onClick={() => !e.firstContactAt && save(firstContact(), "First contact recorded.")}>
          <MessageCircle aria-hidden="true" size={16} /> WhatsApp
        </a>
      </div>
      <label className="block max-w-xs text-sm">
        <span className="mb-1 block font-medium">Status</span>
        <select
          className={inputClass}
          value={e.status}
          onChange={(ev) => {
            const s = ev.target.value as EnquiryStatus;
            save({ status: s, statusHistory: [...(e.statusHistory ?? []), { at: now(), status: s }], ...(s !== "new" ? firstContact() : {}) }, `Status set to ${s}.`);
          }}
        >
          {enquiryStatuses.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </label>
      {e.needsChecking && (
        <button type="button" className={btn.secondary} onClick={() => save({ needsChecking: false }, "Marked as checked.")}>
          Mark as checked
        </button>
      )}
      <div>
        <h3 className="text-sm font-semibold">Message</h3>
        <p className="mt-1 whitespace-pre-wrap">{e.message}</p>
      </div>
      <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[9rem_1fr]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-text-2">{k}</dt>
            <dd className="break-words">{v}</dd>
          </div>
        ))}
      </dl>
      <div>
        <h3 className="text-sm font-semibold">Notes</h3>
        <ul className="mt-2 space-y-2">
          {e.notes.map((n, i) => (
            <li key={i} className="rounded-field border border-divider px-3 py-2 text-sm">
              <span className="block text-xs text-text-2">
                {fmtDate(n.at, true)} · {n.by}
              </span>
              {n.text}
            </li>
          ))}
          {!e.notes.length && <li className="text-sm text-text-2">No notes yet.</li>}
        </ul>
        <form
          className="mt-3 flex flex-col gap-2 sm:flex-row"
          onSubmit={(ev) => {
            ev.preventDefault();
            if (!note.trim()) return;
            save({ notes: [...e.notes, { at: now(), by: user.email, text: note.trim().slice(0, 2000) }] }, "Note added.").then(() => setNote(""));
          }}
        >
          <label className="flex-1">
            <span className="sr-only">New note</span>
            <input className={inputClass} value={note} onChange={(ev) => setNote(ev.target.value)} placeholder="Add a note (call outcome, visit date…)" />
          </label>
          <button type="submit" className={btn.secondary}>
            Add note
          </button>
        </form>
      </div>
      <Status text={msg.text} tone={msg.tone} />
    </div>
  );
}
