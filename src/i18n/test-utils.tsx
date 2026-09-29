import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";

import type { Locale } from "@/lib/domain/locale";

import en from "../../messages/en.json";
import es from "../../messages/es.json";

const messages = { en, es } satisfies Record<Locale, unknown>;

/** Renders a component with the real messages of the given locale. */
export function renderWithIntl(ui: ReactElement, locale: Locale = "en") {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages[locale]}>
      {ui}
    </NextIntlClientProvider>,
  );
}
