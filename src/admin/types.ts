// Shapes of the website back end's Firestore documents (firestore.rules), shared by the Firebase store and the
// demo store, so the dashboard code is the same in both modes.
import type { ServiceKey } from "@/config/routes";
import type { CmsSettings } from "@/lib/cms";

export const enquiryStatuses = ["new", "contacted", "quoted", "won", "lost"] as const;
export type EnquiryStatus = (typeof enquiryStatuses)[number];

export interface EnquiryNote {
  at: string; // ISO time
  by: string;
  text: string;
}

export interface Enquiry {
  id: string;
  createdAt: string; // ISO time
  name: string;
  phone: string; // +91XXXXXXXXXX
  email: string;
  work_type: string;
  work_type_raw?: string;
  location: string;
  size_or_budget: string;
  message: string;
  consent: string;
  source_url: string;
  sourcePath: string;
  source: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  form_id: string;
  lang: string;
  status: EnquiryStatus;
  needsChecking?: boolean;
  rejectReasons?: string[];
  notes: EnquiryNote[];
  /** First move away from "new" (call, WhatsApp, or a status change): the response-time measure. */
  firstContactAt: string | null;
  statusHistory?: { at: string; status: EnquiryStatus }[];
  email_status?: string;
  crm_status?: string;
  sample?: boolean;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  status: "draft" | "published";
  publishedAt: string | null;
  updatedAt: string;
  cover: { url: string; alt: string } | null;
  relatedProjects: string[];
  sample?: boolean;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  service: ServiceKey;
  location: string;
  year: string;
  clientType: string;
  status: "ongoing" | "completed";
  summary: string;
  scope: string[];
  photos: { url: string; alt: string }[];
  showOnWebsite: boolean;
  /** Set when a project turns "completed" (or arrives completed from the CRM) and the owner hasn't decided yet. */
  reviewFlag: boolean;
  crmLinked: boolean;
  crmId?: string;
  order: number;
  updatedAt: string;
  sample?: boolean;
}

export type SiteSettings = CmsSettings;

export interface PublishState {
  dirty: boolean;
  changes: number;
  lastPublishAt: string | null;
}

export interface PublishEntry {
  id: string;
  at: string;
  by: string;
  status: "triggered" | "failed" | "simulated";
  http?: number;
  credits: number;
}

export interface CrmLink {
  baseUrl: string;
  keySet: boolean;
  updatedAt: string | null;
}

export interface AdminUser {
  email: string;
  uid: string;
  isAdmin: boolean;
}

/** One data source for the dashboard: Firebase when configured, otherwise sample data in the browser (demo). */
export interface AdminStore {
  mode: "firebase" | "demo";
  onUser(cb: (user: AdminUser | null) => void): () => void;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;

  listEnquiries(): Promise<Enquiry[]>;
  updateEnquiry(id: string, patch: Partial<Pick<Enquiry, "status" | "notes" | "firstContactAt" | "statusHistory" | "needsChecking">>): Promise<void>;

  listPosts(): Promise<Post[]>;
  savePost(post: Post): Promise<void>;
  deletePost(id: string): Promise<void>;

  listProjects(): Promise<Project[]>;
  saveProject(project: Project): Promise<void>;
  deleteProject(id: string): Promise<void>;

  /** Uploads an already compressed image; returns its public URL. */
  uploadImage(folder: "blog" | "projects", name: string, file: Blob): Promise<string>;

  getSiteSettings(): Promise<SiteSettings>;
  saveSiteSettings(settings: SiteSettings): Promise<void>;
  getCrmLink(): Promise<CrmLink>;
  /** apiKey is write-only: it goes to the server-side doc and is never read back. Empty keeps the current key. */
  saveCrmLink(baseUrl: string, apiKey: string): Promise<void>;

  getPublishState(): Promise<PublishState>;
  markChanged(): Promise<void>;
  listPublishes(): Promise<PublishEntry[]>;
  publishSite(): Promise<void>;
}
