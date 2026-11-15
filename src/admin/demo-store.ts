// Demo mode (no Firebase project configured): the dashboard runs on sample data kept in this browser's IndexedDB.
// Sign-in accepts the demo account shown on the login screen; "Publish" is simulated and logged, never sent.
import { samplePosts, sampleProjects, samplePublishes, sampleSettings, sampleEnquiries } from "./sample-data";
import type { AdminStore, AdminUser, CrmLink, Enquiry, Post, Project, PublishEntry, PublishState, SiteSettings } from "./types";

export const DEMO_EMAIL = "demo@example.com";
export const DEMO_PASSWORD = "demo-only";

const DB = "ambika-admin-demo";
const STORE = "kv";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function get<T>(key: string, fallback: () => T): Promise<T> {
  const db = await open();
  const value = await new Promise<T | undefined>((resolve, reject) => {
    const req = db.transaction(STORE).objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
  if (value !== undefined) return value;
  const seeded = fallback();
  await set(key, seeded);
  return seeded;
}

async function set<T>(key: string, value: T): Promise<void> {
  const db = await open();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

const SESSION = "ambika-admin-demo-user";

export function createDemoStore(): AdminStore {
  const listeners = new Set<(u: AdminUser | null) => void>();
  const current = (): AdminUser | null => {
    try {
      return sessionStorage.getItem(SESSION) ? { email: DEMO_EMAIL, uid: "demo", isAdmin: true } : null;
    } catch {
      return null;
    }
  };
  const emit = () => listeners.forEach((cb) => cb(current()));
  const markChanged = async () => {
    const s = await get<PublishState>("publishState", () => ({ dirty: false, changes: 0, lastPublishAt: null }));
    await set("publishState", { ...s, dirty: true, changes: s.changes + 1 });
  };

  return {
    mode: "demo",
    onUser(cb) {
      listeners.add(cb);
      cb(current());
      return () => listeners.delete(cb);
    },
    async signIn(email, password) {
      if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) throw new Error("auth/invalid-credential");
      try {
        sessionStorage.setItem(SESSION, "1");
      } catch {}
      emit();
    },
    async signOut() {
      try {
        sessionStorage.removeItem(SESSION);
      } catch {}
      emit();
    },
    async resetPassword() {
      // Nothing is sent in demo mode; the UI says so.
    },

    listEnquiries: () => get<Enquiry[]>("enquiries", () => sampleEnquiries()),
    async updateEnquiry(id, patch) {
      const all = await get<Enquiry[]>("enquiries", () => sampleEnquiries());
      await set("enquiries", all.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    },

    listPosts: () => get<Post[]>("posts", () => samplePosts()),
    async savePost(post) {
      const all = await get<Post[]>("posts", () => samplePosts());
      await set("posts", all.some((p) => p.id === post.id) ? all.map((p) => (p.id === post.id ? post : p)) : [post, ...all]);
      await markChanged();
    },
    async deletePost(id) {
      await set("posts", (await get<Post[]>("posts", () => samplePosts())).filter((p) => p.id !== id));
      await markChanged();
    },

    listProjects: () => get<Project[]>("projects", () => sampleProjects()),
    async saveProject(project) {
      const all = await get<Project[]>("projects", () => sampleProjects());
      await set("projects", all.some((p) => p.id === project.id) ? all.map((p) => (p.id === project.id ? project : p)) : [...all, project]);
      await markChanged();
    },
    async deleteProject(id) {
      await set("projects", (await get<Project[]>("projects", () => sampleProjects())).filter((p) => p.id !== id));
      await markChanged();
    },

    // Demo: the compressed image stays in this browser as a data URL (nothing is uploaded anywhere).
    async uploadImage(_folder, _name, file) {
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    },

    getSiteSettings: () => get<SiteSettings>("settings", sampleSettings),
    async saveSiteSettings(settings) {
      await set("settings", settings);
      await markChanged();
    },
    getCrmLink: () => get<CrmLink>("crmLink", () => ({ baseUrl: "", keySet: false, updatedAt: null })),
    async saveCrmLink(baseUrl, apiKey) {
      const was = await get<CrmLink>("crmLink", () => ({ baseUrl: "", keySet: false, updatedAt: null }));
      await set("crmLink", { baseUrl, keySet: was.keySet || apiKey.trim() !== "", updatedAt: new Date().toISOString() });
    },

    getPublishState: () => get<PublishState>("publishState", () => ({ dirty: false, changes: 0, lastPublishAt: samplePublishes()[0].at })),
    markChanged,
    listPublishes: () => get<PublishEntry[]>("publishes", () => samplePublishes()),
    async publishSite() {
      const at = new Date().toISOString();
      const all = await get<PublishEntry[]>("publishes", () => samplePublishes());
      await set("publishes", [{ id: `demo-${Date.now()}`, at, by: DEMO_EMAIL, status: "simulated", credits: 15 }, ...all]);
      await set("publishState", { dirty: false, changes: 0, lastPublishAt: at });
    },
  };
}
