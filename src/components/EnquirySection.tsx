import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { ENQUIRY_ANCHOR, routes } from "@/config/routes";
import type { FormId } from "@/config/forms";
import { site, telLink, whatsappLink } from "@/config/site";
import { getContent } from "@/content";
import { localePath, type Locale } from "@/i18n/config";
import { EnquiryForm } from "./EnquiryForm";
import { SectionHeading } from "./SectionHeading";
import { container } from "./ui";

/**
 * The enquiry, framed as a closing statement (brief §14): index line + large title + lead, a
 * "prefer to talk?" block with call / WhatsApp, and the form beside it on a technical paper ground.
 * Each placement passes its own form_id (contract v2).
 */
export function EnquirySection({
  locale,
  formId,
  title,
  body,
  index,
}: {
  locale: Locale;
  formId: FormId;
  title: string;
  body: string;
  /** Section number in the page's sequence, e.g. "06". */
  index?: string;
}) {
  const { form, common } = getContent(locale);
  const contactLink = "arrow-link t-meta inline-flex min-h-12 items-center gap-3 text-text sm:min-h-10";
  return (
    <section id={ENQUIRY_ANCHOR} className="section-y tech-grid scroll-mt-28 border-t border-rule bg-paper">
      <div className={`${container} grid gap-12 lg:grid-cols-12 lg:gap-8`}>
        <div className="lg:col-span-5">
          <SectionHeading index={index} label={common.enquiry.label} title={title} intro={body} />
          <div className="mt-10 border-t border-rule pt-6" data-reveal="">
            <p className="t-h3">{common.enquiry.talkHeading}</p>
            <p className="mt-1 text-text-2">{common.enquiry.talkBody}</p>
            <ul className="mt-4 space-y-1">
              <li>
                <a href={telLink()} className={contactLink}>
                  <Phone aria-hidden="true" size={16} />
                  {common.actions.call} <span className="tabular normal-case">{site.phone.display}</span>
                  <ArrowRight aria-hidden="true" size={16} className="arrow" />
                </a>
              </li>
              <li>
                <a href={whatsappLink(common.whatsappButton.prefill)} target="_blank" rel="noopener" className={contactLink}>
                  <MessageCircle aria-hidden="true" size={16} />
                  {common.actions.whatsapp} <span className="tabular normal-case">{site.whatsapp.display}</span>
                  <ArrowRight aria-hidden="true" size={16} className="arrow" />
                </a>
              </li>
            </ul>
            <p className="t-meta mt-4 text-text-2">
              {common.footer.hoursLabel}: <span className="normal-case">{site.hours}</span>
            </p>
          </div>
        </div>
        <div className="lg:col-span-7" data-reveal="">
          <EnquiryForm
            formId={formId}
            locale={locale}
            copy={form}
            privacyHref={localePath(locale, routes.privacy)}
            whatsappPrefill={common.whatsappButton.prefill}
            whatsappLabel={common.actions.whatsapp}
          />
        </div>
      </div>
    </section>
  );
}
