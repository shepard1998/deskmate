"use client";

import { useLocale, useTranslations } from "next-intl";
import { useId, useTransition } from "react";

import { setLocale } from "@/i18n/actions";
import { locales } from "@/lib/domain/locale";

export function LanguageSwitcher() {
  const t = useTranslations("LanguageSwitcher");
  const locale = useLocale();
  const selectId = useId();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2 text-sm">
      {/* Visually hidden on narrow screens; the select keeps its name. */}
      <label htmlFor={selectId} className="max-sm:sr-only">
        {t("label")}
      </label>
      <select
        id={selectId}
        value={locale}
        // Not `disabled` while pending, so keyboard focus stays on the control.
        aria-busy={isPending}
        onChange={(event) => {
          const next = event.target.value;
          startTransition(() => setLocale(next));
        }}
        className="min-h-11 rounded-md border border-neutral-400 bg-white px-2 py-1 text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        {locales.map((option) => (
          <option key={option} value={option} lang={option}>
            {t(option)}
          </option>
        ))}
      </select>
    </div>
  );
}
