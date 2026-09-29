"use server";

import { cookies } from "next/headers";

import { isLocale } from "@/lib/domain/locale";

import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "./config";

/**
 * Stores the locale picked in the language switcher. Setting a cookie in a
 * Server Function re-renders the current page, so the UI switches language.
 */
export async function setLocale(locale: unknown): Promise<void> {
  if (!isLocale(locale)) {
    throw new Error("Unsupported locale.");
  }
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
  });
}
