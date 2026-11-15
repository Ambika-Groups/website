"use client";

import { ClipboardList, Clock, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import type { FormId } from "@/config/forms";
import { shown } from "@/config/launch";
import { site, telLink, whatsappLink } from "@/config/site";
import type { Dictionary, FormCopy } from "@/content";
import type { Locale } from "@/i18n/config";
import { EnquiryForm } from "./EnquiryForm";
import { button } from "./ui";

type Intent = "form" | "talk";

interface Props {
  copy: Dictionary["contact"]["card"];
  formCopy: FormCopy;
  formId: FormId;
  locale: Locale;
  privacyHref: string;
  whatsappPrefill: string;
  callLabel: string;
  whatsappLabel: string;
}

/**
 * The Contact card's two ways in (ad landing traffic): the enquiry form, or call / WhatsApp straight away.
 * The form is the default, so the page works as a plain form if the visitor never touches the switch.
 */
export function ContactIntent({ copy, formCopy, formId, locale, privacyHref, whatsappPrefill, callLabel, whatsappLabel }: Props) {
  const [intent, setIntent] = useState<Intent>("form");
  const icons = { form: ClipboardList, talk: Phone } as const;

  return (
    <>
      <div role="group" aria-label={copy.intentLabel} className="grid grid-cols-2 gap-2">
        {(["form", "talk"] as const).map((key) => {
          const Icon = icons[key];
          const on = intent === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={on}
              aria-controls="contact-intent-panel"
              onClick={() => setIntent(key)}
              className={`flex min-h-14 flex-col items-start justify-center gap-0.5 rounded-field border px-3 py-2.5 text-left transition-colors duration-200 sm:px-4 ${
                on ? "border-brand-strong bg-selected" : "border-divider hover:border-rule"
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-medium text-text sm:text-base">
                <Icon aria-hidden="true" size={18} className={on ? "text-brand" : "text-text-2"} />
                {copy.intents[key].title}
              </span>
              <span className="text-xs text-text-2 sm:text-sm">{copy.intents[key].sub}</span>
            </button>
          );
        })}
      </div>

      <div id="contact-intent-panel" className="mt-6">
        {intent === "form" ? (
          <EnquiryForm
            formId={formId}
            locale={locale}
            copy={formCopy}
            privacyHref={privacyHref}
            whatsappPrefill={whatsappPrefill}
            whatsappLabel={whatsappLabel}
            embedded
          />
        ) : (
          <div className="space-y-5 border-t border-divider pt-6">
            <div>
              <h3 className="t-h3">{copy.talk.title}</h3>
              <p className="mt-2 text-text-2">{copy.talk.body}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <a href={telLink()} className={button.primary}>
                <Phone aria-hidden="true" size={18} />
                <span>
                  {callLabel} <span className="tabular">{site.phone.display}</span>
                </span>
              </a>
              <a href={whatsappLink(whatsappPrefill)} target="_blank" rel="noopener" className={button.secondary}>
                <MessageCircle aria-hidden="true" size={18} />
                {whatsappLabel}
              </a>
            </div>
            {shown(site.hours) && (
              <p className="flex items-center gap-2 text-sm text-text-2">
                <Clock aria-hidden="true" size={16} />
                {copy.talk.hours}: {site.hours}
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
