"use client";

import { Bold, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { renderMarkdown } from "@/lib/markdown";
import type { AdminStore, Post, Project } from "../types";
import { Badge, btn, compressImage, Dialog, Field, fmtDate, inputClass, panel, slugify, Status, useLoad } from "../ui";

const blank = (): Post => ({
  id: `post-${Date.now().toString(36)}`,
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  tags: [],
  seoTitle: "",
  seoDescription: "",
  status: "draft",
  publishedAt: null,
  updatedAt: new Date().toISOString(),
  cover: null,
  relatedProjects: [],
});

export function BlogView({ store, onChanged }: { store: AdminStore; onChanged: () => void }) {
  const { data: posts, error, reload } = useLoad<Post[]>(() => store.listPosts(), []);
  const { data: projects } = useLoad<Project[]>(() => store.listProjects(), []);
  const [editing, setEditing] = useState<Post | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="t-h2 !text-3xl">Blog</h1>
          <p className="mt-1 text-text-2">Saved posts go live with the next &ldquo;Publish site&rdquo;.</p>
        </div>
        <button type="button" className={btn.primary} onClick={() => setEditing(blank())}>
          <Plus aria-hidden="true" size={16} /> New post
        </button>
      </div>
      {error && <p className="text-error">Could not load posts: {error}</p>}
      <ul className="space-y-2">
        {posts?.map((p) => (
          <li key={p.id}>
            <button type="button" onClick={() => setEditing(p)} className={`${panel} block w-full p-4 text-left shadow-none hover:border-rule`}>
              <span className="flex flex-wrap items-center gap-2">
                <strong>{p.title || "(untitled)"}</strong>
                <Badge tone={p.status === "published" ? "success" : "neutral"}>{p.status}</Badge>
                {p.sample && <Badge>sample</Badge>}
                <span className="ml-auto text-sm text-text-2">Updated {fmtDate(p.updatedAt)}</span>
              </span>
              <span className="mt-1 block text-sm text-text-2">
                /blog/{p.slug || "…"} {p.tags.length ? `· ${p.tags.join(", ")}` : ""}
              </span>
            </button>
          </li>
        ))}
        {posts && !posts.length && <li className="text-text-2">No posts yet.</li>}
      </ul>
      <Dialog open={!!editing} onClose={() => setEditing(null)} title={editing?.title ? `Edit: ${editing.title}` : "New post"} wide>
        {editing && (
          <PostEditor
            key={editing.id}
            initial={editing}
            store={store}
            projects={projects ?? []}
            takenSlugs={["tag", "none", ...(posts ?? []).filter((p) => p.id !== editing.id).map((p) => p.slug)]}
            onSaved={() => (reload(), onChanged())}
            onDeleted={() => (setEditing(null), reload(), onChanged())}
          />
        )}
      </Dialog>
    </div>
  );
}

function PostEditor({
  initial,
  store,
  projects,
  takenSlugs,
  onSaved,
  onDeleted,
}: {
  initial: Post;
  store: AdminStore;
  projects: Project[];
  takenSlugs: string[];
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [post, setPost] = useState<Post>(initial);
  const [slugTouched, setSlugTouched] = useState(!!initial.slug);
  const [preview, setPreview] = useState(false);
  const [msg, setMsg] = useState<{ text: string; tone?: "error" }>({ text: "" });
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const set = (patch: Partial<Post>) => setPost((p) => ({ ...p, ...patch }));

  // Wraps the selection (or inserts at the cursor) so the toolbar works with the keyboard and on phones.
  const wrap = (before: string, after = "", placeholder = "text") => {
    const el = bodyRef.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b, value } = el;
    const sel = value.slice(a, b) || placeholder;
    const next = value.slice(0, a) + before + sel + after + value.slice(b);
    set({ body: next });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a + before.length, a + before.length + sel.length);
    });
  };

  const problems = [
    !post.title.trim() && "a title",
    !post.slug && "a URL slug",
    takenSlugs.includes(post.slug) && "a URL slug no other post uses",
    post.status === "published" && !post.body.trim() && "some text",
    post.cover && !post.cover.alt.trim() && "a description of the cover photo (for screen readers)",
  ].filter(Boolean) as string[];

  const save = async () => {
    if (problems.length) return setMsg({ text: `Add ${problems.join(", ")} before saving.`, tone: "error" });
    setBusy(true);
    try {
      const now = new Date().toISOString();
      const next: Post = { ...post, updatedAt: now, publishedAt: post.status === "published" ? (post.publishedAt ?? now) : post.publishedAt };
      await store.savePost(next);
      setPost(next);
      setMsg({ text: "Saved. It goes live with the next “Publish site”." });
      onSaved();
    } catch (e) {
      setMsg({ text: `Not saved: ${(e as Error).message}`, tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  const uploadCover = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setMsg({ text: "Compressing and uploading the photo…" });
    try {
      const blob = await compressImage(file);
      const url = await store.uploadImage("blog", `${post.slug || post.id}-${Date.now().toString(36)}.jpg`, blob);
      set({ cover: { url, alt: post.cover?.alt ?? "" } });
      setMsg({ text: `Photo ready (${Math.round(blob.size / 1024)} KB). Describe it below, then save.` });
    } catch (e) {
      setMsg({ text: `Upload failed: ${(e as Error).message}`, tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  // [label, icon, text before, text after, placeholder]; a line-start item begins on a new line.
  const tools: [string, typeof Bold, string, string, string][] = [
    ["Heading", Heading2, "\n## ", "\n", "Heading"],
    ["Subheading", Heading3, "\n### ", "\n", "Subheading"],
    ["Bold", Bold, "**", "**", "text"],
    ["Italic", Italic, "_", "_", "text"],
    ["Bulleted list", List, "\n- ", "", "item"],
    ["Numbered list", ListOrdered, "\n1. ", "", "item"],
    ["Link", Link2, "[", "](https://)", "link text"],
    ["Image (paste an https link)", ImagePlus, "![", "](https://)", "describe the image"],
  ];

  return (
    <div className="space-y-4">
      <Field label="Title">
        {(id) => (
          <input
            id={id}
            className={inputClass}
            value={post.title}
            maxLength={120}
            onChange={(e) => set({ title: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })}
          />
        )}
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="URL slug" hint={`The page address: /blog/${post.slug || "…"}`}>
          {(id) => <input id={id} className={inputClass} value={post.slug} onChange={(e) => (setSlugTouched(true), set({ slug: slugify(e.target.value) }))} />}
        </Field>
        <Field label="Tags" hint="Separate with commas, e.g. Houses, Roads">
          {(id) => (
            <input
              id={id}
              className={inputClass}
              defaultValue={post.tags.join(", ")}
              onBlur={(e) => set({ tags: [...new Set(e.target.value.split(",").map((t) => t.trim()).filter(Boolean))].slice(0, 8) })}
            />
          )}
        </Field>
      </div>
      <Field label="Short summary" hint={`Shown in the blog list and in search results (${post.excerpt.length}/200).`}>
        {(id) => <textarea id={id} rows={2} maxLength={200} className={inputClass} value={post.excerpt} onChange={(e) => set({ excerpt: e.target.value })} />}
      </Field>

      <div>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span id="body-label" className="text-sm font-medium">
            Text (Markdown)
          </span>
          <div role="tablist" aria-label="Editor view" className="flex gap-1">
            {(["Write", "Preview"] as const).map((t) => (
              <button key={t} type="button" role="tab" aria-selected={(t === "Preview") === preview} className={`${btn.ghost} !min-h-9`} onClick={() => setPreview(t === "Preview")}>
                {t}
              </button>
            ))}
          </div>
        </div>
        {preview ? (
          <div className="blog-prose min-h-60 rounded-field border border-divider p-4" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
        ) : (
          <>
            <div role="toolbar" aria-label="Formatting" className="mb-1 flex flex-wrap gap-1">
              {tools.map(([label, Icon, before, after, placeholder]) => (
                <button key={label} type="button" className={`${btn.ghost} !min-h-9 !px-2.5`} onClick={() => wrap(before, after, placeholder)} aria-label={label} title={label}>
                  <Icon aria-hidden="true" size={16} />
                </button>
              ))}
            </div>
            <textarea ref={bodyRef} aria-labelledby="body-label" rows={14} className={`${inputClass} font-mono !text-sm`} value={post.body} onChange={(e) => set({ body: e.target.value })} />
          </>
        )}
      </div>

      <fieldset className="space-y-3 rounded-field border border-divider p-4">
        <legend className="px-1 text-sm font-medium">Cover photo</legend>
        {post.cover?.url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.cover.url} alt="" className="aspect-video w-full max-w-sm rounded-field object-cover" />
        )}
        <label className={`${btn.secondary} cursor-pointer`}>
          <ImagePlus aria-hidden="true" size={16} /> {post.cover ? "Replace photo" : "Add photo"}
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => uploadCover(e.target.files?.[0])} />
        </label>
        {post.cover && (
          <>
            <Field label="Describe the photo" hint="For people using screen readers, e.g. “New G+1 house with a paver driveway”.">
              {(id) => <input id={id} className={inputClass} value={post.cover!.alt} onChange={(e) => set({ cover: { ...post.cover!, alt: e.target.value } })} />}
            </Field>
            <button type="button" className={btn.ghost} onClick={() => set({ cover: null })}>
              Remove photo
            </button>
          </>
        )}
      </fieldset>

      <fieldset className="grid gap-4 rounded-field border border-divider p-4 sm:grid-cols-2">
        <legend className="px-1 text-sm font-medium">Search engines (optional)</legend>
        <Field label="SEO title" hint={`${post.seoTitle.length}/60. Empty uses the title.`}>
          {(id) => <input id={id} className={inputClass} maxLength={70} value={post.seoTitle} onChange={(e) => set({ seoTitle: e.target.value })} />}
        </Field>
        <Field label="SEO description" hint={`${post.seoDescription.length}/160. Empty uses the summary.`}>
          {(id) => <textarea id={id} rows={2} maxLength={170} className={inputClass} value={post.seoDescription} onChange={(e) => set({ seoDescription: e.target.value })} />}
        </Field>
      </fieldset>

      {projects.length > 0 && (
        <fieldset className="rounded-field border border-divider p-4">
          <legend className="px-1 text-sm font-medium">Related projects (shown under the post)</legend>
          <div className="grid gap-1 sm:grid-cols-2">
            {projects.map((pr) => (
              <label key={pr.id} className="flex min-h-11 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 accent-[#f12136]"
                  checked={post.relatedProjects.includes(pr.slug)}
                  onChange={(e) => set({ relatedProjects: e.target.checked ? [...post.relatedProjects, pr.slug] : post.relatedProjects.filter((s) => s !== pr.slug) })}
                />
                {pr.title}
                {!pr.showOnWebsite && <span className="text-text-2">(hidden on the site)</span>}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-divider pt-4">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium">Status</span>
          <select className={`${inputClass} !w-auto`} value={post.status} onChange={(e) => set({ status: e.target.value as Post["status"] })}>
            <option value="draft">Draft (not on the site)</option>
            <option value="published">Published</option>
          </select>
        </label>
        <button type="button" className={btn.primary} onClick={save} disabled={busy}>
          Save
        </button>
        <button
          type="button"
          className={`${btn.danger} ml-auto`}
          disabled={busy}
          onClick={async () => {
            if (!confirm(`Delete “${post.title || "this post"}”? This can't be undone.`)) return;
            await store.deletePost(post.id);
            onDeleted();
          }}
        >
          <Trash2 aria-hidden="true" size={16} /> Delete
        </button>
      </div>
      <Status text={msg.text} tone={msg.tone} />
    </div>
  );
}
