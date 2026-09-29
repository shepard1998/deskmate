import { isLocale, type Locale } from "./locale";

export const DISPLAY_NAME_MAX_LENGTH = 50;

export const themeModes = ["auto", "light", "dark"] as const;
export type ThemeMode = (typeof themeModes)[number];

export const reducedMotionModes = [
  "system",
  "reduce",
  "no-preference",
] as const;
export type ReducedMotionMode = (typeof reducedMotionModes)[number];

/** Inclusive limits of the numeric settings; the database enforces the same. */
export const settingRanges = {
  soundVolume: { min: 0, max: 100 },
  streakThreshold: { min: 50, max: 100 },
  pomodoroFocusMinutes: { min: 1, max: 120 },
  pomodoroShortBreakMinutes: { min: 1, max: 60 },
  pomodoroLongBreakMinutes: { min: 1, max: 120 },
  pomodoroSessionsBeforeLongBreak: { min: 1, max: 12 },
} as const;

type NumericSetting = keyof typeof settingRanges;

export type Settings = {
  displayName: string;
  locale: Locale;
  timezone: string;
  themeMode: ThemeMode;
  soundEnabled: boolean;
  soundVolume: number;
  reducedMotion: ReducedMotionMode;
  streakThreshold: number;
  pomodoroFocusMinutes: number;
  pomodoroShortBreakMinutes: number;
  pomodoroLongBreakMinutes: number;
  pomodoroSessionsBeforeLongBreak: number;
  aiNoteEnabled: boolean;
};

export type SettingsFieldError =
  "required" | "tooLong" | "invalid" | "outOfRange";

export type SettingsErrors = Partial<
  Record<keyof Settings, SettingsFieldError>
>;

export type SettingsResult =
  { ok: true; settings: Settings } | { ok: false; errors: SettingsErrors };

/** True for IANA time zone names the runtime knows, such as "Europe/Madrid". */
export function isValidTimeZone(value: unknown): value is string {
  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

function oneOf<T extends string>(
  options: readonly T[],
  value: unknown,
): value is T {
  return (
    typeof value === "string" && (options as readonly string[]).includes(value)
  );
}

/**
 * Validates the settings form. Checkboxes arrive as "on" when checked and are
 * absent otherwise; numbers must be whole and inside `settingRanges`.
 */
export function validateSettings(
  input: Record<string, unknown>,
): SettingsResult {
  const errors: SettingsErrors = {};

  const displayName =
    typeof input.displayName === "string" ? input.displayName.trim() : "";
  if (displayName === "") {
    errors.displayName = "required";
  } else if ([...displayName].length > DISPLAY_NAME_MAX_LENGTH) {
    errors.displayName = "tooLong";
  }

  if (!isLocale(input.locale)) errors.locale = "invalid";
  if (!isValidTimeZone(input.timezone)) errors.timezone = "invalid";
  if (!oneOf(themeModes, input.themeMode)) errors.themeMode = "invalid";
  if (!oneOf(reducedMotionModes, input.reducedMotion)) {
    errors.reducedMotion = "invalid";
  }

  const numbers = {} as Record<NumericSetting, number>;
  for (const key of Object.keys(settingRanges) as NumericSetting[]) {
    const raw = input[key];
    const value =
      typeof raw === "string" && raw.trim() !== "" ? Number(raw) : NaN;
    const { min, max } = settingRanges[key];
    if (!Number.isInteger(value) || value < min || value > max) {
      errors[key] = "outOfRange";
    } else {
      numbers[key] = value;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    settings: {
      displayName,
      locale: input.locale as Locale,
      timezone: input.timezone as string,
      themeMode: input.themeMode as ThemeMode,
      soundEnabled: input.soundEnabled === "on",
      reducedMotion: input.reducedMotion as ReducedMotionMode,
      aiNoteEnabled: input.aiNoteEnabled === "on",
      ...numbers,
    },
  };
}

/** Up to two initials for the avatar placeholder, e.g. "Ada Lovelace" → "AL". */
export function initials(displayName: string): string {
  const words = displayName.trim().split(/\s+/).filter(Boolean);
  const letters =
    words.length > 1
      ? [words[0], words[words.length - 1]].map((word) => [...(word ?? "")][0])
      : [...(words[0] ?? "")].slice(0, 2);
  return letters.join("").toLocaleUpperCase() || "?";
}
