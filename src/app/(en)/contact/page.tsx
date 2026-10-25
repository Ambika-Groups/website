import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { EnquiryForm } from "@/components/EnquiryForm";
import { MapEmbed } from "@/components/MapEmbed";
import { PageHeader } from "@/components/PageHeader";
import { button, container } from "@/components/ui";
import { formIds } from "@/config/forms";
import { ENQUIRY_ANCHOR, routes } from "@/config/routes";
import { addressLine, mapsEmbedUrl, mapsLink, site, telLink, whatsappLink } from "@/config/site";
import { getContent } from "@/content";
import { localePath, type Locale } from "@/i18n/config";
import { sectionRef } from "@/lib/sections";
import { pageMetadata } from "../../metadata";

const locale: Locale = "en";
const { common, contact, form } = getContent(locale);

export const metadata: Metadata = pageMetadata({
  locale,
  path: localePath(locale, routes.contact),
  title: contact.meta.title,
  description: contact.meta.description,
  absoluteTitle: true,
});

export default function ContactPage() {
  const d = contact.details;
  return (
    <>
      <PageHeader
        {...sectionRef(common, "contact")}
        title={contact.title}
        intro={contact.intro}
        actions={
          <>
            <a href={telLink()} className={button.secondary}>
              <Phone aria-hidden="true" size={18} />
              {common.actions.call}
            </a>
            <a
              href={whatsappLink(common.whatsappButton.prefill)}
              target="_blank"
              rel="noopener"
              className={button.secondary}
            >
              <MessageCircle aria-hidden="true" size={18} />
              {common.actions.whatsapp}
            </a>
          </>
        }
      />
      <div className={`${container} section-y`}>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <section id={ENQUIRY_ANCHOR} aria-labelledby="enquiry-title" className="scroll-mt-28 lg:col-span-7">
            <h2 id="enquiry-title" className="sr-only">
              {form.title}
            </h2>
            <EnquiryForm
              formId={formIds.contactPage}
              locale={locale}
              copy={form}
              privacyHref={localePath(locale, routes.privacy)}
              whatsappPrefill={common.whatsappButton.prefill}
              whatsappLabel={common.actions.whatsapp}
            />
          </section>

          {/* Tablet: details and map side by side; desktop: stacked beside the form. */}
          <aside className="grid content-start gap-10 sm:grid-cols-2 lg:col-span-4 lg:col-start-9 lg:grid-cols-1">
            <section className="border-t border-rule pt-6" data-reveal="">
              <h2 className="t-h3">{d.heading}</h2>
              <dl className="mt-5 space-y-5">
                <Detail icon={<Phone size={18} />} label={d.phone}>
                  <a href={telLink()} className="font-medium text-brand tabular">
                    {site.phone.display}
                  </a>
                </Detail>
                <Detail icon={<MessageCircle size={18} />} label={d.whatsapp}>
                  <a
                    href={whatsappLink(common.whatsappButton.prefill)}
                    target="_blank"
                    rel="noopener"
                    className="font-medium text-brand tabular"
                  >
                    {site.whatsapp.display}
                  </a>
                </Detail>
                <Detail icon={<Mail size={18} />} label={d.email}>
                  {site.email}
                </Detail>
                <Detail icon={<MapPin size={18} />} label={d.address}>
                  {addressLine()}
                </Detail>
                <Detail icon={<Clock size={18} />} label={d.hours}>
                  {site.hours}
                </Detail>
                <Detail icon={<MapPin size={18} />} label={d.serviceArea}>
                  {site.serviceArea}
                </Detail>
              </dl>
            </section>

            <section className="border-t border-rule pt-6" data-reveal="">
              <h2 className="t-h3">{contact.map.heading}</h2>
              <MapEmbed
                embedUrl={mapsEmbedUrl()}
                openUrl={mapsLink()}
                loadLabel={contact.map.load}
                openLabel={common.actions.openMaps}
                note={contact.map.note}
                title={contact.map.title}
              />
            </section>
          </aside>
        </div>
      </div>
    </>
  );
}

// A <dl> group may only hold <dt>/<dd>, so the icon lives inside the <dt>.
function Detail({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="t-meta flex items-center gap-2 text-text-2">
        <span aria-hidden="true">{icon}</span>
        {label}
      </dt>
      <dd className="mt-0.5 pl-[26px] text-text">{children}</dd>
    </div>
  );
}
