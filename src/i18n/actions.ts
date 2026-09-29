"use server";

import { isLocale } from "@/lib/domain/locale";
import { setLocaleCookie } from "@/lib/server/profile";
import { createClient } from "@/lib/server/supabase";

/**
 * Stores the locale picked in the language switcher: in the cookie, and in the
 * profile when signed in. Setting a cookie in a Server Function re-renders the
 * current page, so the UI switches language.
 */
export async function setLocale(locale: unknown): Promise<void> {
  if (!isLocale(locale)) {
    throw new Error("Unsupported locale.");
  }
  await setLocaleCookie(locale);

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) {
    const { error } = await supabase
      .from("profiles")
      .update({ locale })
      .eq("id", data.claims.sub);
    if (error) {
      throw error;
    }
  }
}
