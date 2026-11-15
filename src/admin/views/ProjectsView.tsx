"use client";

import { ArrowDown, ArrowUp, ImagePlus, Link2, Link2Off, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { serviceKeys } from "@/config/routes";
import { getContent } from "@/content";
import type { AdminStore, Project } from "../types";
import { Badge, btn, compressImage, Dialog, Field, inputClass, panel, slugify, Status, Switch, useLoad } from "../ui";

const serviceNames = getContent("en").common.serviceNames;

const blank = (order: number): Project => ({
  id: `project-${Date.now().toString(36)}`,
  slug: "",
  title: "",
  service: "construction",
  location: "",
  year: String(new Date().getFullYear()),
  clientType: "",
  status: "ongoing",
  summary: "",
  scope: [],
  photos: [],
  showOnWebsite: false, // off by default: the owner decides what the public sees
  reviewFlag: false,
  crmLinked: false,
  order,
  updatedAt: new Date().toISOString(),
});

export function ProjectsView({ store, onChanged }: { store: AdminStore; onChanged: () => void }) {
  const { data: projects, error, setData, reload } = useLoad<Project[]>(() => store.listProjects(), []);
  const [editing, setEditing] = useState<Project | null>(null);
  const [msg, setMsg] = useState<{ text: string; tone?: "error" }>({ text: "" });

  const save = async (p: Project, done: string) => {
    try {
      const next = { ...p, updatedAt: new Date().toISOString() };
      await store.saveProject(next);
      setData((all) => (all?.some((x) => x.id === p.id) ? all.map((x) => (x.id === p.id ? next : x)) : [...(all ?? []), next]));
      setMsg({ text: done });
      onChanged();
    } catch (e) {
      setMsg({ text: `Not saved: ${(e as Error).message}`, tone: "error" });
    }
  };
  const move = async (i: number, dir: -1 | 1) => {
    const list = [...(projects ?? [])];
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    const renumbered = list.map((p, k) => ({ ...p, order: k + 1 }));
    setData(renumbered);
    await Promise.all(renumbered.filter((p, k) => p.order !== projects![k]?.order || p.id !== projects![k]?.id).map((p) => store.saveProject(p)));
    onChanged();
  };

  const toReview = projects?.filter((p) => p.reviewFlag) ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="t-h2 !text-3xl">Projects</h1>
          <p className="mt-1 max-w-2xl text-text-2">
            Only projects switched to &ldquo;Show on website&rdquo; appear on /projects and the Home page, in this order, after the next &ldquo;Publish site&rdquo;.
          </p>
        </div>
        <button type="button" className={btn.primary} onClick={() => setEditing(blank((projects?.length ?? 0) + 1))}>
          <Plus aria-hidden="true" size={16} /> New project
        </button>
      </div>
      {toReview.length > 0 && (
        <p className="rounded-field border border-warning/60 px-4 py-3 text-sm">
          <strong>{toReview.length} completed project{toReview.length === 1 ? "" : "s"} to review:</strong> {toReview.map((p) => p.title).join(", ")}. Decide whether each one should be shown on the website.
        </p>
      )}
      {error && <p className="text-error">Could not load projects: {error}</p>}
      <ul className="space-y-2">
        {projects?.map((p, i) => (
          <li key={p.id} className={`${panel} flex flex-wrap items-center gap-3 p-4 shadow-none`}>
            <div className="flex flex-col">
              <button type="button" className={`${btn.ghost} !min-h-8 !px-2`} aria-label={`Move ${p.title} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                <ArrowUp aria-hidden="true" size={14} />
              </button>
              <button type="button" className={`${btn.ghost} !min-h-8 !px-2`} aria-label={`Move ${p.title} down`} disabled={i === projects.length - 1} onClick={() => move(i, 1)}>
                <ArrowDown aria-hidden="true" size={14} />
              </button>
            </div>
            <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setEditing(p)}>
              <span className="flex flex-wrap items-center gap-2">
                <strong>{p.title || "(untitled)"}</strong>
                <Badge tone={p.status === "completed" ? "success" : "neutral"}>{p.status}</Badge>
                {p.reviewFlag && <Badge tone="warning">to review</Badge>}
                {p.sample && <Badge>sample</Badge>}
              </span>
              <span className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-text-2">
                <span>
                  {serviceNames[p.service]} · {p.location || "—"} · {p.year || "—"} · {p.photos.length} photo{p.photos.length === 1 ? "" : "s"}
                </span>
                <span className="inline-flex items-center gap-1">
                  {p.crmLinked ? <Link2 aria-hidden="true" size={14} /> : <Link2Off aria-hidden="true" size={14} />}
                  {p.crmLinked ? "Linked to CRM" : "Not linked to CRM"}
                </span>
              </span>
            </button>
            <label className="flex items-center gap-2 text-sm">
              <span>Show on website</span>
              <Switch
                label={`Show ${p.title} on the website`}
                checked={p.showOnWebsite}
                onChange={(v) => save({ ...p, showOnWebsite: v, reviewFlag: false }, v ? `${p.title} will show after the next publish.` : `${p.title} will be hidden after the next publish.`)}
              />
            </label>
          </li>
        ))}
        {projects && !projects.length && <li className="text-text-2">No projects yet.</li>}
      </ul>
      <Status text={msg.text} tone={msg.tone} />
      <Dialog open={!!editing} onClose={() => setEditing(null)} title={editing?.title ? `Edit: ${editing.title}` : "New project"} wide>
        {editing && (
          <ProjectEditor
            key={editing.id}
            initial={editing}
            store={store}
            takenSlugs={["none", ...(projects ?? []).filter((p) => p.id !== editing.id).map((p) => p.slug)]}
            onSave={(p) => save(p, "Saved. It goes live with the next “Publish site”.").then(() => setEditing(null))}
            onDelete={async () => {
              if (!confirm(`Delete “${editing.title || "this project"}”? This can't be undone.`)) return;
              await store.deleteProject(editing.id);
              setEditing(null);
              reload();
              onChanged();
            }}
          />
        )}
      </Dialog>
    </div>
  );
}

function ProjectEditor({
  initial,
  store,
  takenSlugs,
  onSave,
  onDelete,
}: {
  initial: Project;
  store: AdminStore;
  takenSlugs: string[];
  onSave: (p: Project) => void;
  onDelete: () => void;
}) {
  const [p, setP] = useState<Project>(initial);
  const [slugTouched, setSlugTouched] = useState(!!initial.slug);
  const [msg, setMsg] = useState<{ text: string; tone?: "error" }>({ text: "" });
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<Project>) => setP((x) => ({ ...x, ...patch }));

  const problems = [
    !p.title.trim() && "a title",
    !p.slug && "a URL slug",
    takenSlugs.includes(p.slug) && "a URL slug no other project uses",
    p.photos.some((ph) => !ph.alt.trim()) && "a description for every photo",
  ].filter(Boolean) as string[];

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const added: Project["photos"] = [];
      for (const [i, file] of [...files].entries()) {
        setMsg({ text: `Compressing and uploading photo ${i + 1} of ${files.length}…` });
        const blob = await compressImage(file);
        added.push({ url: await store.uploadImage("projects", `${p.slug || p.id}-${Date.now().toString(36)}-${i}.jpg`, blob), alt: "" });
      }
      set({ photos: [...p.photos, ...added] });
      setMsg({ text: "Photos ready. Describe each one, then save. The first photo is the main one." });
    } catch (e) {
      setMsg({ text: `Upload failed: ${(e as Error).message}`, tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title">
          {(id) => <input id={id} className={inputClass} value={p.title} onChange={(e) => set({ title: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })} />}
        </Field>
        <Field label="URL slug" hint={`/projects/${p.slug || "…"}`}>
          {(id) => <input id={id} className={inputClass} value={p.slug} onChange={(e) => (setSlugTouched(true), set({ slug: slugify(e.target.value) }))} />}
        </Field>
        <Field label="Service">
          {(id) => (
            <select id={id} className={inputClass} value={p.service} onChange={(e) => set({ service: e.target.value as Project["service"] })}>
              {serviceKeys.map((k) => (
                <option key={k} value={k}>
                  {serviceNames[k]}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Status" hint="Marking it completed asks you (on the Projects list) whether to show it.">
          {(id) => (
            <select
              id={id}
              className={inputClass}
              value={p.status}
              onChange={(e) => {
                const status = e.target.value as Project["status"];
                set({ status, reviewFlag: status === "completed" && initial.status !== "completed" && !p.showOnWebsite ? true : p.reviewFlag });
              }}
            >
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          )}
        </Field>
        <Field label="Location">{(id) => <input id={id} className={inputClass} value={p.location} onChange={(e) => set({ location: e.target.value })} />}</Field>
        <Field label="Year">{(id) => <input id={id} className={inputClass} inputMode="numeric" value={p.year} onChange={(e) => set({ year: e.target.value })} />}</Field>
        <Field label="Client type (optional)" hint="e.g. Private client, Government department">
          {(id) => <input id={id} className={inputClass} value={p.clientType} onChange={(e) => set({ clientType: e.target.value })} />}
        </Field>
      </div>
      <Field label="Summary" hint="One or two sentences: what was built and for whom.">
        {(id) => <textarea id={id} rows={3} className={inputClass} value={p.summary} onChange={(e) => set({ summary: e.target.value })} />}
      </Field>
      <Field label="Scope of work" hint="One item per line, e.g. G+1 house, 1,800 sq ft">
        {(id) => (
          <textarea
            id={id}
            rows={4}
            className={inputClass}
            defaultValue={p.scope.join("\n")}
            onBlur={(e) => set({ scope: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
          />
        )}
      </Field>

      <fieldset className="space-y-3 rounded-field border border-divider p-4">
        <legend className="px-1 text-sm font-medium">Photos</legend>
        <ul className="grid gap-3 sm:grid-cols-2">
          {p.photos.map((ph, i) => (
            <li key={ph.url} className="space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ph.url} alt="" className="aspect-[4/3] w-full rounded-field object-cover" />
              <label className="block text-sm">
                <span className="mb-1 block">
                  Describe photo {i + 1}
                  {i === 0 ? " (main photo)" : ""}
                </span>
                <input className={inputClass} value={ph.alt} onChange={(e) => set({ photos: p.photos.map((x, k) => (k === i ? { ...x, alt: e.target.value } : x)) })} />
              </label>
              <button type="button" className={btn.ghost} onClick={() => set({ photos: p.photos.filter((_, k) => k !== i) })}>
                Remove
              </button>
            </li>
          ))}
        </ul>
        <label className={`${btn.secondary} cursor-pointer`}>
          <ImagePlus aria-hidden="true" size={16} /> Add photos
          <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => addPhotos(e.target.files)} />
        </label>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3 border-t border-divider pt-4">
        <label className="flex items-center gap-2 text-sm">
          <span>Show on website</span>
          <Switch label="Show on website" checked={p.showOnWebsite} onChange={(v) => set({ showOnWebsite: v, reviewFlag: false })} />
        </label>
        <button
          type="button"
          className={btn.primary}
          disabled={busy}
          onClick={() => (problems.length ? setMsg({ text: `Add ${problems.join(", ")} before saving.`, tone: "error" }) : onSave(p))}
        >
          Save
        </button>
        <button type="button" className={`${btn.danger} ml-auto`} disabled={busy} onClick={onDelete}>
          <Trash2 aria-hidden="true" size={16} /> Delete
        </button>
      </div>
      <p className="text-sm text-text-2">
        {p.crmLinked ? "Linked to the CRM: its completion status syncs from there; showing it here stays your decision." : "Not linked to the CRM yet (the link starts once the CRM API is connected in Site settings)."}
      </p>
      <Status text={msg.text} tone={msg.tone} />
    </div>
  );
}
