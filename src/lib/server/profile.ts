import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "@/i18n/config";
import type { Database, Tables, TablesUpdate } from "@/lib/database.types";
import { isLocale } from "@/lib/domain/locale";
import type {
  ReducedMotionMode,
  Settings,
  ThemeMode,
} from "@/lib/domain/profile";

type Client = SupabaseClient<Database>;
type ProfileRow = Tables<"profiles">;

export type Profile = Omit<Settings, "timezone"> & {
  avatarUrl: string | null;
  /** Null until the browser has reported it. */
  timezone: string | null;
};

function toProfile(row: ProfileRow): Profile {
  return {
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    locale: isLocale(row.locale) ? row.locale : "en",
    timezone: row.timezone,
    // The database constrains these columns to the same values.
    themeMode: row.theme_mode as ThemeMode,
    soundEnabled: row.sound_enabled,
    soundVolume: row.sound_volume,
    reducedMotion: row.reduced_motion as ReducedMotionMode,
    streakThreshold: row.streak_threshold,
    pomodoroFocusMinutes: row.pomodoro_focus_minutes,
    pomodoroShortBreakMinutes: row.pomodoro_short_break_minutes,
    pomodoroLongBreakMinutes: row.pomodoro_long_break_minutes,
    pomodoroSessionsBeforeLongBreak: row.pomodoro_sessions_before_long_break,
    aiNoteEnabled: row.ai_note_enabled,
  };
}

export function toProfileUpdate(settings: Settings): TablesUpdate<"profiles"> {
  return {
    display_name: settings.displayName,
    locale: settings.locale,
    timezone: settings.timezone,
    theme_mode: settings.themeMode,
    sound_enabled: settings.soundEnabled,
    sound_volume: settings.soundVolume,
    reduced_motion: settings.reducedMotion,
    streak_threshold: settings.streakThreshold,
    pomodoro_focus_minutes: settings.pomodoroFocusMinutes,
    pomodoro_short_break_minutes: settings.pomodoroShortBreakMinutes,
    pomodoro_long_break_minutes: settings.pomodoroLongBreakMinutes,
    pomodoro_sessions_before_long_break:
      settings.pomodoroSessionsBeforeLongBreak,
    ai_note_enabled: settings.aiNoteEnabled,
  };
}

/** The signed-in user's profile, or null. RLS limits the query to their row. */
export async function getProfile(
  supabase: Client,
  userId: string,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data ? toProfile(data) : null;
}

/**
 * Makes the saved profile language the UI language (CLAUDE.md 4.2: profile
 * first). Call after signing in, from a Server Function or Route Handler.
 */
export async function applyProfileLocale(
  supabase: Client,
  userId: string,
): Promise<void> {
  const profile = await getProfile(supabase, userId);
  if (profile) {
    await setLocaleCookie(profile.locale);
  }
}

export async function setLocaleCookie(locale: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
  });
}
