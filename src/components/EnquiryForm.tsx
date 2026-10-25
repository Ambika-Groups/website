"use client";

import Link from "next/link";
import { AlertCircle, Check, CheckCircle2, MessageCircle, Phone } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ENQUIRY_ENDPOINT, fieldLimits, isWeb3Forms, workTypes, type FormId, type WorkType } from "@/config/forms";
import { site, telLink, whatsappLink } from "@/config/site";
import type { FormCopy } from "@/content";
import enForm from "@/content/en/form";
import type { Locale } from "@/i18n/config";
import {
  buildPayload,
  isEnquirySuccess,
  readFields,
  validateEnquiry,
  visibleFields,
  type FieldErrors,
  type VisibleField,
} from "@/lib/enquiry";
import { readUtm } from "@/lib/utm";
import { button, field } from "./ui";
import { ENQUIRY_ATTR } from "./WhatsAppButton";

type Status = "idle" | "sending" | "success" | "error";

interface Props {
  formId: FormId;
  locale: Locale;
  copy: FormCopy;
  privacyHref: string;
  whatsappPrefill: string;
  whatsappLabel: string;
}

export function EnquiryForm({ formId, locale, copy, privacyHref, whatsappPrefill, whatsappLabel }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const sending = useRef(false);
  const successRef = useRef<HTMLHeadingElement>(null);
  const failureRef = useRef<HTMLDivElement>(null);
  const idp = `enq-${formId}`;

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
    if (status === "error") failureRef.current?.focus();
  }, [status]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const form = event.currentTarget;
    const raw = readFields(new FormData(form));
    const email = form.elements.namedItem("email") as HTMLInputElement;
    const found = validateEnquiry(raw, email.validity.valid);
    setErrors(found);

    const firstInvalid = visibleFields.find((field) => found[field]);
    if (firstInvalid) {
      (form.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
      return;
    }

    sending.current = true;
    setStatus("sending");
    let storage: Storage | undefined;
    try {
      storage = window.sessionStorage;
    } catch {
      storage = undefined;
    }
    const payload = buildPayload(raw, {
      accessKey: isWeb3Forms(ENQUIRY_ENDPOINT) ? (process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "") : undefined,
      formId,
      lang: locale,
      sourceUrl: window.location.href,
      utm: readUtm(storage),
      workTypeLabel: enForm.workTypes[raw.work_type as WorkType],
    });

    try {
      const response = await fetch(ENQUIRY_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const result: unknown = await response.json().catch(() => null);
      setStatus(isEnquirySuccess(response.ok, result) ? "success" : "error");
    } catch {
      setStatus("error");
    } finally {
      sending.current = false;
    }
  }

  // Clear a field's error as soon as the visitor edits it.
  function onInput(event: FormEvent<HTMLFormElement>) {
    const name = (event.target as HTMLInputElement).name as VisibleField;
    if (!errors[name]) return;
    setErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  if (status === "success") {
    return (
      <div {...{ [ENQUIRY_ATTR]: "" }} className="border border-divider bg-surface p-6 sm:p-8" role="status">
        <CheckCircle2 aria-hidden="true" className="text-success" size={28} />
        <h3 ref={successRef} tabIndex={-1} className="mt-3 text-xl outline-none">
          {copy.success.title}
        </h3>
        <p className="mt-2 text-text-2">{copy.success.body}</p>
        <ContactFallback whatsappPrefill={whatsappPrefill} whatsappLabel={whatsappLabel} />
      </div>
    );
  }

  const errorText = (name: VisibleField) => {
    const code = errors[name];
    return code ? copy.errors[code] : undefined;
  };

  /** Shared props for one field: id, name, required state and ARIA wiring. */
  const wire = (name: VisibleField, opts: { optional?: boolean; hint?: boolean } = {}) => {
    const id = `${idp}-${name}`;
    const describedBy = [opts.hint && `${id}-hint`, errors[name] && `${id}-error`].filter(Boolean).join(" ");
    return {
      id,
      name,
      required: !opts.optional,
      "aria-invalid": !!errors[name],
      "aria-describedby": describedBy || undefined,
    };
  };

  const f = copy.fields;

  return (
    <form
      {...{ [ENQUIRY_ATTR]: "" }}
      noValidate
      onSubmit={onSubmit}
      onInput={onInput}
      className="relative space-y-6 border border-divider bg-surface p-4 sm:p-8"
    >
      <p className="text-sm text-text-2">{copy.requiredNote}</p>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id={`${idp}-name`} label={f.name.label} error={errorText("name")}>
          <input {...wire("name")} type="text" autoComplete="name" maxLength={fieldLimits.nameMax} className={field} />
        </Field>

        <Field id={`${idp}-phone`} label={f.phone.label} hint={f.phone.hint} error={errorText("phone")}>
          <input
            {...wire("phone", { hint: true })}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className={`${field} tabular`}
          />
        </Field>

        <Field id={`${idp}-email`} label={f.email.label} hint={f.email.hint} error={errorText("email")}>
          <input {...wire("email", { optional: true, hint: true })} type="email" autoComplete="email" className={field} />
        </Field>

        <Field id={`${idp}-work_type`} label={f.work_type.label} error={errorText("work_type")}>
          <select {...wire("work_type")} defaultValue="" className={field}>
            <option value="" disabled>
              {f.work_type.placeholder}
            </option>
            {workTypes.map((value) => (
              <option key={value} value={value}>
                {copy.workTypes[value]}
              </option>
            ))}
          </select>
        </Field>

        <Field id={`${idp}-location`} label={f.location.label} hint={f.location.hint} error={errorText("location")}>
          <input
            {...wire("location", { hint: true })}
            type="text"
            autoComplete="address-level2"
            maxLength={fieldLimits.location}
            className={field}
          />
        </Field>

        <Field
          id={`${idp}-size_or_budget`}
          label={f.size_or_budget.label}
          hint={f.size_or_budget.hint}
          error={errorText("size_or_budget")}
        >
          <input
            {...wire("size_or_budget", { optional: true, hint: true })}
            type="text"
            maxLength={fieldLimits.sizeOrBudget}
            className={field}
          />
        </Field>
      </div>

      <Field id={`${idp}-message`} label={f.message.label} hint={f.message.hint} error={errorText("message")}>
        <textarea {...wire("message", { hint: true })} rows={4} maxLength={fieldLimits.message} className={field} />
      </Field>

      <div>
        <label htmlFor={`${idp}-consent`} className="flex cursor-pointer items-start gap-3 py-1">
          {/* Square custom checkbox (brand.md v2: only radios are round). */}
          <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
            <input
              {...wire("consent")}
              type="checkbox"
              value="yes"
              className="peer size-5 cursor-pointer appearance-none border-2 border-input-border bg-surface checked:border-primary checked:bg-primary aria-[invalid=true]:border-error"
            />
            <Check
              aria-hidden="true"
              size={14}
              strokeWidth={3}
              className="pointer-events-none absolute hidden text-on-primary peer-checked:block"
            />
          </span>
          <span className="text-sm text-text-2">
            {copy.consent.before}
            <Link href={privacyHref} className="font-medium text-brand underline underline-offset-2">
              {copy.consent.link}
            </Link>
            {copy.consent.after}
          </span>
        </label>
        {errors.consent && <FieldError id={`${idp}-consent-error`}>{errorText("consent")}</FieldError>}
      </div>

      {/* Honeypot (contract: botcheck). Off-screen, unfocusable and hidden from assistive tech. */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px] size-px overflow-hidden">
        <label>
          {copy.honeypotLabel}
          <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {status === "error" && (
        <div
          ref={failureRef}
          tabIndex={-1}
          role="alert"
          className="border border-l-[3px] border-error bg-selected p-4 text-sm outline-none"
        >
          <p className="flex items-center gap-2 font-medium text-error">
            <AlertCircle aria-hidden="true" size={18} />
            {copy.failure.title}
          </p>
          <p className="mt-1 text-text">{copy.failure.body}</p>
          <ContactFallback whatsappPrefill={whatsappPrefill} whatsappLabel={whatsappLabel} />
        </div>
      )}

      {Object.keys(errors).length > 0 && (
        <p className="flex items-center gap-2 text-sm font-medium text-error" role="alert">
          <AlertCircle aria-hidden="true" size={16} />
          {copy.errorSummary}
        </p>
      )}

      <button type="submit" className={`${button.primary} w-full sm:w-auto`} disabled={status === "sending"}>
        {status === "sending" ? copy.sending : copy.submit}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-text-2">
          {hint}
        </p>
      )}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  );
}

/** Error = icon + words, never colour alone (brand.md v2: red also means brand). */
function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-error">
      <AlertCircle aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
      {children}
    </p>
  );
}

function ContactFallback({ whatsappPrefill, whatsappLabel }: { whatsappPrefill: string; whatsappLabel: string }) {
  const linkClass = "inline-flex min-h-12 items-center gap-1.5 font-medium text-brand tabular sm:min-h-10";
  return (
    <p className="mt-2 flex flex-wrap gap-x-6 text-sm">
      <a href={telLink()} className={linkClass}>
        <Phone aria-hidden="true" size={16} />
        {site.phone.display}
      </a>
      <a href={whatsappLink(whatsappPrefill)} target="_blank" rel="noopener" className={linkClass}>
        <MessageCircle aria-hidden="true" size={16} />
        {whatsappLabel} {site.whatsapp.display}
      </a>
    </p>
  );
}
