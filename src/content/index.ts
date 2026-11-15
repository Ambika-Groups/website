import type { Locale } from "@/i18n/config";
import about from "./en/about";
import blog from "./en/blog";
import common from "./en/common";
import contact from "./en/contact";
import form from "./en/form";
import government from "./en/government";
import home from "./en/home";
import notFound from "./en/notFound";
import privacy from "./en/privacy";
import projects from "./en/projects";
import services from "./en/services";

const en = { about, blog, common, contact, form, government, home, notFound, privacy, projects, services };

/** The English dictionary defines the shape every locale must match. */
export type Dictionary = typeof en;

// Hindi: add src/content/hi/*.ts and register `hi` here, typed `satisfies Dictionary`.
const dictionaries: Partial<Record<Locale, Dictionary>> = { en };

export function getContent(locale: Locale): Dictionary {
  return dictionaries[locale] ?? en;
}

export type FormCopy = Dictionary["form"];
