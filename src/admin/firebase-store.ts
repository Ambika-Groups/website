// The live dashboard: the website's own Firebase project (Auth, Firestore, Storage, Functions). Loaded only by
// /admin. What a signed-in user may read or change is enforced by firestore.rules and storage.rules, not here.
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  limit,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";
import type { AdminStore, AdminUser, CrmLink, Enquiry, Post, Project, PublishEntry, PublishState, SiteSettings } from "./types";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

export const firebaseConfigured = () => !!(firebaseConfig.projectId && firebaseConfig.apiKey);

const iso = (v: unknown): string | null =>
  v instanceof Timestamp ? v.toDate().toISOString() : typeof v === "string" ? v : null;

// The inbox loads the latest enquiries in one read (a small business gets far fewer than this a year); search,
// filters, sorting and paging then work instantly in the browser.
const ENQUIRY_LIMIT = 2000;

function toEnquiry(id: string, d: DocumentData): Enquiry {
  return {
    ...(d as Enquiry),
    id,
    createdAt: iso(d.createdAt) ?? new Date(0).toISOString(),
    firstContactAt: iso(d.firstContactAt),
    notes: Array.isArray(d.notes) ? d.notes : [],
    email_status: d.email?.status,
    crm_status: d.crm?.status,
  };
}

export function createFirebaseStore(): AdminStore {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  const functions = getFunctions(app, "asia-south1");

  const markChanged = async () => {
    await setDoc(doc(db, "settings/publishState"), { dirty: true, changes: increment(1) }, { merge: true });
  };

  return {
    mode: "firebase",
    onUser(cb) {
      return onAuthStateChanged(auth, async (user) => {
        if (!user) return cb(null);
        // Admin = a document at admins/{uid} (created by hand for the first admin; DEPLOY.md). The rules let a user
        // read only their own entry.
        const entry = await getDoc(doc(db, "admins", user.uid)).catch(() => null);
        const u: AdminUser = { email: user.email ?? "", uid: user.uid, isAdmin: !!entry?.exists() };
        cb(u);
      });
    },
    async signIn(email, password) {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    },
    async signOut() {
      await signOut(auth);
    },
    async resetPassword(email) {
      await sendPasswordResetEmail(auth, email.trim());
    },

    async listEnquiries() {
      const snap = await getDocs(query(collection(db, "enquiries"), orderBy("createdAt", "desc"), limit(ENQUIRY_LIMIT)));
      return snap.docs.map((d) => toEnquiry(d.id, d.data()));
    },
    async updateEnquiry(id, patch) {
      await updateDoc(doc(db, "enquiries", id), { ...patch, updatedAt: new Date().toISOString() });
    },

    async listPosts() {
      const snap = await getDocs(collection(db, "posts"));
      return snap.docs.map((d) => ({ ...(d.data() as Post), id: d.id })).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async savePost(post) {
      const { id, ...data } = post;
      await setDoc(doc(db, "posts", id), data);
      await markChanged();
    },
    async deletePost(id) {
      await deleteDoc(doc(db, "posts", id));
      await markChanged();
    },

    async listProjects() {
      const snap = await getDocs(collection(db, "projects"));
      return snap.docs.map((d) => ({ ...(d.data() as Project), id: d.id })).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },
    async saveProject(project) {
      const { id, ...data } = project;
      await setDoc(doc(db, "projects", id), data);
      await markChanged();
    },
    async deleteProject(id) {
      await deleteDoc(doc(db, "projects", id));
      await markChanged();
    },

    async uploadImage(folder, name, file) {
      const r = ref(storage, `${folder}/${name}`);
      await uploadBytes(r, file, { contentType: file.type || "image/jpeg", cacheControl: "public, max-age=31536000" });
      return await getDownloadURL(r);
    },

    async getSiteSettings() {
      const snap = await getDoc(doc(db, "settings/site"));
      return (snap.exists() ? snap.data() : {}) as SiteSettings;
    },
    async saveSiteSettings(settings) {
      await setDoc(doc(db, "settings/site"), settings);
      await markChanged();
    },
    async getCrmLink() {
      const snap = await getDoc(doc(db, "settings/crmLink"));
      const d = snap.exists() ? snap.data() : {};
      return { baseUrl: d.baseUrl ?? "", keySet: !!d.keySet, updatedAt: iso(d.updatedAt) } satisfies CrmLink;
    },
    async saveCrmLink(baseUrl, apiKey) {
      const was = await this.getCrmLink();
      // The key goes only to private/crm, which no browser can read back (firestore.rules); the function uses it.
      await setDoc(doc(db, "private/crm"), apiKey.trim() ? { baseUrl, apiKey: apiKey.trim() } : { baseUrl }, { merge: true });
      await setDoc(doc(db, "settings/crmLink"), { baseUrl, keySet: was.keySet || apiKey.trim() !== "", updatedAt: new Date().toISOString() });
    },

    async getPublishState() {
      const snap = await getDoc(doc(db, "settings/publishState"));
      const d = snap.exists() ? snap.data() : {};
      return { dirty: !!d.dirty, changes: d.changes ?? 0, lastPublishAt: iso(d.lastPublishAt) } satisfies PublishState;
    },
    markChanged,
    async listPublishes() {
      const snap = await getDocs(query(collection(db, "publishes"), orderBy("at", "desc"), limit(100)));
      return snap.docs.map((d) => ({ ...(d.data() as PublishEntry), id: d.id, at: iso(d.data().at) ?? "" }));
    },
    async publishSite() {
      await httpsCallable(functions, "publishSite")();
    },
  };
}
