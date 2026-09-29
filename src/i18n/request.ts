import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { resolveLocale } from "@/lib/domain/locale";

import { LOCALE_COOKIE } from "./config";

export default getRequestConfig(async () => {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const locale = resolveLocale({
    preferred: cookieStore.get(LOCALE_COOKIE)?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
