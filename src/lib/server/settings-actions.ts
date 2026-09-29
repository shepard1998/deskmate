"use server";

import { revalidatePath } from "next/cache";

import { isValidTimeZone, validateSettings } from "@/lib/domain/profile";
import type { SettingsFormState } from "@/lib/settings-form-state";

import { setLocaleCookie, toProfileUpdate } from "./profile";
import { createClient } from "./supabase";

async function currentUserId() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return { supabase, userId: data?.claims?.sub ?? null };
}

export async function saveSettings(
  previous: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const submission = previous.submission + 1;
  const result = validateSettings(Object.fromEntries(formData));
  if (!result.ok) {
    return { status: "invalid", errors: result.errors, submission };
  }

  const { supabase, userId } = await currentUserId();
  if (!userId) {
    return { status: "failed", errors: {}, submission };
  }
  const { error } = await supabase
    .from("profiles")
    .update(toProfileUpdate(result.settings))
    .eq("id", userId);
  if (error) {
    return { status: "failed", errors: {}, submission };
  }

  // The language may have changed; the cookie keeps the UI in sync.
  await setLocaleCookie(result.settings.locale);
  revalidatePath("/", "layout");
  return { status: "saved", errors: {}, submission };
}

/**
 * Stores the time zone the browser reports, only while the profile has none,
 * so it never overwrites a choice made in settings.
 */
export async function saveDetectedTimeZone(timezone: string): Promise<void> {
  if (!isValidTimeZone(timezone)) {
    return;
  }
  const { supabase, userId } = await currentUserId();
  if (!userId) {
    return;
  }
  await supabase
    .from("profiles")
    .update({ timezone })
    .eq("id", userId)
    .is("timezone", null);
}
