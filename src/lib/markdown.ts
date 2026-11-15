// Markdown → HTML for blog posts, shared by the build (app/(en)/blog) and the admin preview, so both show the same.
import { Marked } from "marked";

// Admins write the Markdown, but raw HTML is still escaped: the body can only produce headings, lists, links,
// emphasis, quotes, code and images. External links open safely.
const attr = (v: string) => v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const md = new Marked({
  gfm: true,
  renderer: {
    html({ text }) {
      return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const safe = /^(https?:|mailto:|tel:|\/|#)/i.test(href) ? href : "#";
      const ext = /^https?:/i.test(safe);
      return `<a href="${attr(safe)}"${title ? ` title="${attr(title)}"` : ""}${ext ? ' rel="noopener" target="_blank"' : ""}>${text}</a>`;
    },
    image({ href, title, text }) {
      const safe = /^https:/i.test(href) ? href : "";
      return safe ? `<img src="${attr(safe)}" alt="${attr(text)}" loading="lazy" decoding="async"${title ? ` title="${attr(title)}"` : ""}>` : "";
    },
  },
});

export function renderMarkdown(body: string): string {
  return md.parse(body ?? "", { async: false }) as string;
}
