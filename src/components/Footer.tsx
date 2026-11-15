import Link from "next/link";
import { ArrowRight, ArrowUp } from "lucide-react";
import { routes } from "@/config/routes";
import { hasProjects, shown } from "@/config/launch";
import { addressLine, site, telLink, whatsappLink } from "@/config/site";
import type { Dictionary } from "@/content";
import { localePath, type Locale } from "@/i18n/config";
import { BrandMark } from "./BrandMark";
import { arrowClass, container } from "./ui";

/**
 * Footer as "the final page of a premium publication" (brief §15): a dark closing statement with
 * one quiet action, then a hairline grid of columns, then the legal line. Bottom padding reserves
 * room for the floating WhatsApp button, so it never covers the last line.
 */
export function Footer({ locale, t }: { locale: Locale; t: Dictionary["common"] }) {
  const href = (path: string) => localePath(locale, path);
  const year = new Date().getFullYear();
  const linkClass = "inline-flex min-h-10 items-center py-1 text-text-2 transition-colors duration-200 hover:text-text";
  const heading = "t-meta mb-4 text-text-2";

  return (
    <footer className="tone-dark pb-20 sm:pb-24">
      <div className={container}>
        <div className="grid gap-8 border-b border-divider py-16 lg:grid-cols-12 lg:items-end lg:py-24">
          <p className="t-h1 lg:col-span-9">{t.footer.statement}</p>
          <div className="lg:col-span-3 lg:text-right">
            <Link href={href(routes.contact)} className="group/btn arrow-link t-meta text-text">
              {t.actions.requestQuote}
              <ArrowRight aria-hidden="true" size={16} className={`arrow ${arrowClass}`} />
            </Link>
          </div>
        </div>

        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <BrandMark href={href(routes.home)} />
            <p className="max-w-xs text-text-2">{t.footer.tagline}</p>
          </div>

          <nav aria-labelledby="footer-services" className="lg:col-span-2">
            <h2 id="footer-services" className={heading}>
              {t.footer.servicesHeading}
            </h2>
            <ul>
              {(Object.keys(t.serviceNames) as (keyof typeof t.serviceNames)[]).map((key) => (
                <li key={key}>
                  <Link href={href(routes[key])} className={linkClass}>
                    {t.serviceNames[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-company" className="lg:col-span-2">
            <h2 id="footer-company" className={heading}>
              {t.footer.companyHeading}
            </h2>
            <ul>
              {t.nav.items
                .filter((item) => item.route !== "services" && (item.route !== "projects" || hasProjects))
                .map((item) => (
                  <li key={item.route}>
                    <Link href={href(routes[item.route])} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>

          <div className="lg:col-span-4">
            <h2 className={heading}>{t.footer.contactHeading}</h2>
            <dl className="grid grid-cols-[6.5rem_1fr] gap-x-4 gap-y-2 text-text-2">
              <dt className="t-meta pt-0.5 !text-[0.75rem]">{t.actions.call}</dt>
              <dd>
                <a href={telLink()} className="tabular hover:text-text">
                  {site.phone.display}
                </a>
              </dd>
              <dt className="t-meta pt-0.5 !text-[0.75rem]">{t.actions.whatsapp}</dt>
              <dd>
                <a href={whatsappLink()} target="_blank" rel="noopener" className="tabular hover:text-text">
                  {site.whatsapp.display}
                </a>
              </dd>
              {shown(site.email) && (
                <>
                  <dt className="t-meta pt-0.5 !text-[0.75rem]">{t.footer.emailLabel}</dt>
                  <dd>{site.email}</dd>
                </>
              )}
              {shown(site.address.street) && (
                <>
                  <dt className="t-meta pt-0.5 !text-[0.75rem]">{t.footer.addressLabel}</dt>
                  <dd>{addressLine()}</dd>
                </>
              )}
              {shown(site.gstin) && (
                <>
                  <dt className="t-meta pt-0.5 !text-[0.75rem]">{t.footer.gstinLabel}</dt>
                  <dd className="tabular">{site.gstin}</dd>
                </>
              )}
            </dl>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-divider py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-meta text-text-2">
            © <span className="tabular">{year}</span> {site.name}. <span className="normal-case">{t.footer.rights}</span>
          </p>
          <div className="flex items-center gap-6">
            <Link href={href(routes.privacy)} className={`${linkClass} t-meta`}>
              {t.footer.privacy}
            </Link>
            <a href="#main" className={`${linkClass} t-meta gap-2`}>
              {t.footer.backToTop}
              <ArrowUp aria-hidden="true" size={14} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
