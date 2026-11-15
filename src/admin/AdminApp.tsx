"use client";

// Website admin (M7c). One static page (/admin); everything runs in the browser against the website's own
// Firebase project, or against sample data in demo mode when no project is configured.
import { BarChart3, FileText, FolderKanban, Inbox, LogOut, Settings, UploadCloud } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { CREDITS_PER_PUBLISH, creditsThisMonth, MONTHLY_CREDITS } from "./credits";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./demo-store";
import type { AdminStore, AdminUser, PublishEntry, PublishState } from "./types";
import { Badge, btn, Dialog, Field, fmtDate, inputClass, panel, Status, useLoad } from "./ui";
import { BlogView } from "./views/BlogView";
import { InboxView } from "./views/InboxView";
import { OverviewView } from "./views/OverviewView";
import { ProjectsView } from "./views/ProjectsView";
import { SettingsView } from "./views/SettingsView";

const views = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "enquiries", label: "Enquiries", icon: Inbox },
  { id: "blog", label: "Blog", icon: FileText },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "settings", label: "Site settings", icon: Settings },
] as const;
export type ViewId = (typeof views)[number]["id"];


async function createStore(): Promise<AdminStore> {
  // The Firebase SDK is loaded only when a project is configured; demo mode never downloads it.
  if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    const { createFirebaseStore } = await import("./firebase-store");
    return createFirebaseStore();
  }
  const { createDemoStore } = await import("./demo-store");
  return createDemoStore();
}

const viewFromHash = (): ViewId => {
  const h = typeof location === "undefined" ? "" : location.hash.slice(1);
  return (views.find((v) => v.id === h)?.id ?? "overview") as ViewId;
};

export function AdminApp() {
  const [store, setStore] = useState<AdminStore | null>(null);
  const [user, setUser] = useState<AdminUser | null | undefined>(undefined);

  useEffect(() => {
    let off = () => {};
    let alive = true;
    createStore().then((s) => {
      if (!alive) return;
      setStore(s);
      off = s.onUser(setUser);
    });
    return () => {
      alive = false;
      off();
    };
  }, []);

  if (!store || user === undefined) {
    return (
      <main className="grid min-h-dvh place-items-center bg-bg text-text-2">
        <p role="status">Loading the admin…</p>
      </main>
    );
  }
  if (!user) return <Login store={store} />;
  if (!user.isAdmin) {
    return (
      <main className="grid min-h-dvh place-items-center bg-bg p-4">
        <div className={`${panel} max-w-md p-6`}>
          <h1 className="t-h3">No admin access</h1>
          <p className="mt-2 text-text-2">
            {user.email} is signed in but is not on the admin list. Ask the site owner to add this account (DEPLOY.md, &ldquo;First admin user&rdquo;).
          </p>
          <button type="button" className={`${btn.secondary} mt-5`} onClick={() => store.signOut()}>
            <LogOut aria-hidden="true" size={16} /> Sign out
          </button>
        </div>
      </main>
    );
  }
  return <Shell store={store} user={user} />;
}

function Login({ store }: { store: AdminStore }) {
  const demo = store.mode === "demo";
  const [email, setEmail] = useState(demo ? DEMO_EMAIL : "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; tone?: "error" }>({ text: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg({ text: "Signing in…" });
    try {
      await store.signIn(email, password);
    } catch {
      setMsg({ text: "That email and password don't match an account.", tone: "error" });
    } finally {
      setBusy(false);
    }
  };
  const reset = async () => {
    if (!email.trim()) return setMsg({ text: "Enter your email first, then choose “Forgot password”.", tone: "error" });
    try {
      await store.resetPassword(email);
      setMsg({ text: demo ? "Demo mode: no email is sent." : "If that account exists, a reset link is on its way to the inbox." });
    } catch {
      setMsg({ text: "Could not send the reset email. Try again in a minute.", tone: "error" });
    }
  };

  return (
    <main className="grid min-h-dvh place-items-center bg-bg p-4">
      <form onSubmit={submit} className={`${panel} w-full max-w-sm space-y-4 p-6`} noValidate>
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="grid size-10 place-items-center rounded-[12px] bg-[#f12136] font-[family-name:var(--font-display)] text-sm font-semibold text-[#0b0b0c]">
            AG
          </span>
          <h1 className="t-h3 !text-xl">Website admin</h1>
        </div>
        {demo && (
          <p className="rounded-field border border-warning/60 px-3 py-2 text-sm text-text">
            <strong>Demo mode.</strong> No Firebase project is set up yet, so this runs on sample data kept in this browser. Sign in with {DEMO_EMAIL} and the password <code>{DEMO_PASSWORD}</code>.
          </p>
        )}
        <Field label="Email">{(id) => <input id={id} type="email" autoComplete="username" required className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />}</Field>
        <Field label="Password">
          {(id) => <input id={id} type="password" autoComplete="current-password" required className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />}
        </Field>
        <button type="submit" className={`${btn.primary} w-full`} disabled={busy}>
          Sign in
        </button>
        <button type="button" className={`${btn.ghost} w-full`} onClick={reset}>
          Forgot password
        </button>
        <Status text={msg.text} tone={msg.tone} />
      </form>
    </main>
  );
}

function Shell({ store, user }: { store: AdminStore; user: AdminUser }) {
  const [view, setView] = useState<ViewId>(viewFromHash);
  const [publishTick, setPublishTick] = useState(0);
  useEffect(() => {
    const onHash = () => setView(viewFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const changed = () => setPublishTick((t) => t + 1);

  let content: ReactNode;
  if (view === "overview") content = <OverviewView store={store} publishTick={publishTick} />;
  else if (view === "enquiries") content = <InboxView store={store} user={user} />;
  else if (view === "blog") content = <BlogView store={store} onChanged={changed} />;
  else if (view === "projects") content = <ProjectsView store={store} onChanged={changed} />;
  else content = <SettingsView store={store} onChanged={changed} />;

  return (
    <div className="min-h-dvh bg-bg text-text">
      <header className="sticky top-0 z-20 border-b border-divider bg-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-[90rem] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span aria-hidden="true" className="grid size-9 place-items-center rounded-[10px] bg-[#f12136] text-xs font-semibold text-[#0b0b0c]">
              AG
            </span>
            <span className="font-[family-name:var(--font-display)] font-semibold">Website admin</span>
            {store.mode === "demo" && <Badge tone="warning">Demo · sample data</Badge>}
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <PublishControl store={store} tick={publishTick} onPublished={changed} />
            <div className="hidden sm:block">
              <ThemeSwitch label="Dark mode" />
            </div>
            <button type="button" className={btn.ghost} onClick={() => store.signOut()} title={user.email}>
              <LogOut aria-hidden="true" size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
        <nav aria-label="Admin" className="mx-auto max-w-[90rem] overflow-x-auto px-2 sm:px-4">
          <ul className="flex gap-1 pb-2">
            {views.map((v) => (
              <li key={v.id}>
                <a
                  href={`#${v.id}`}
                  aria-current={view === v.id ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full px-3.5 text-sm font-medium whitespace-nowrap ${
                    view === v.id ? "bg-text/[0.08] text-text" : "text-text-2 hover:bg-text/[0.05] hover:text-text"
                  }`}
                >
                  <v.icon aria-hidden="true" size={16} />
                  {v.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main id="main" className="mx-auto max-w-[90rem] px-4 py-6 sm:px-6">
        {content}
      </main>
    </div>
  );
}

/** "Publish site": batches every saved change into one Netlify build, with the credit cost spelt out first. */
function PublishControl({ store, tick, onPublished }: { store: AdminStore; tick: number; onPublished: () => void }) {
  const { data: state, reload } = useLoad<PublishState>(() => store.getPublishState(), [tick]);
  const { data: log, reload: reloadLog } = useLoad<PublishEntry[]>(() => store.listPublishes(), [tick]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; tone?: "error" }>({ text: "" });
  const credits = creditsThisMonth(log ?? []);
  const left = MONTHLY_CREDITS - credits.used;

  const publish = async () => {
    setBusy(true);
    setMsg({ text: "Starting the build…" });
    try {
      await store.publishSite();
      setMsg({ text: store.mode === "demo" ? "Demo: publish recorded (nothing was sent to Netlify)." : "Build started. The site updates in a few minutes." });
      reload();
      reloadLog();
      onPublished();
    } catch (e) {
      setMsg({ text: (e as Error).message || "Could not start the build.", tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" className={state?.dirty ? btn.primary : btn.secondary} onClick={() => (setMsg({ text: "" }), setOpen(true))}>
        <UploadCloud aria-hidden="true" size={16} />
        Publish site
        {state?.dirty ? <span className="rounded-full bg-[#0b0b0c]/15 px-1.5 text-xs tabular">{state.changes}</span> : null}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Publish the website">
        <div className="space-y-3 text-sm">
          <p>
            {state?.dirty
              ? `${state.changes} saved change${state.changes === 1 ? "" : "s"} (blog, projects or settings) will go live together in one build.`
              : "No saved changes since the last publish. Publishing again rebuilds the same site."}
          </p>
          <p className="rounded-field border border-warning/60 px-3 py-2">
            Each publish uses <strong>{CREDITS_PER_PUBLISH}</strong> of the <strong>{MONTHLY_CREDITS}</strong> monthly Netlify credits. This month: {credits.used} used ({credits.count} publish
            {credits.count === 1 ? "" : "es"}), {left} left. Make all your edits first, then publish once.
          </p>
          <p className="text-text-2">Last publish: {fmtDate(state?.lastPublishAt, true)}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <button type="button" className={btn.primary} onClick={publish} disabled={busy || left < CREDITS_PER_PUBLISH}>
              Publish now
            </button>
            <button type="button" className={btn.secondary} onClick={() => setOpen(false)}>
              Not now
            </button>
          </div>
          <Status text={msg.text} tone={msg.tone} />
        </div>
      </Dialog>
    </>
  );
}
