import { describe, expect, test } from "vitest";

import { initials, isValidTimeZone, validateSettings } from "./profile";

const validInput = {
  displayName: "  Ada Lovelace ",
  locale: "es",
  timezone: "America/Mexico_City",
  themeMode: "dark",
  soundEnabled: "on",
  soundVolume: "40",
  reducedMotion: "reduce",
  streakThreshold: "85",
  pomodoroFocusMinutes: "50",
  pomodoroShortBreakMinutes: "10",
  pomodoroLongBreakMinutes: "20",
  pomodoroSessionsBeforeLongBreak: "3",
  aiNoteEnabled: "on",
};

describe("validateSettings", () => {
  test("converts valid form input into settings", () => {
    expect(validateSettings(validInput)).toEqual({
      ok: true,
      settings: {
        displayName: "Ada Lovelace",
        locale: "es",
        timezone: "America/Mexico_City",
        themeMode: "dark",
        soundEnabled: true,
        soundVolume: 40,
        reducedMotion: "reduce",
        streakThreshold: 85,
        pomodoroFocusMinutes: 50,
        pomodoroShortBreakMinutes: 10,
        pomodoroLongBreakMinutes: 20,
        pomodoroSessionsBeforeLongBreak: 3,
        aiNoteEnabled: true,
      },
    });
  });

  test("treats missing checkboxes as off", () => {
    const unchecked: Record<string, string> = { ...validInput };
    delete unchecked.soundEnabled;
    delete unchecked.aiNoteEnabled;
    expect(validateSettings(unchecked)).toMatchObject({
      ok: true,
      settings: { soundEnabled: false, aiNoteEnabled: false },
    });
  });

  test("requires a display name", () => {
    expect(validateSettings({ ...validInput, displayName: "   " })).toEqual({
      ok: false,
      errors: { displayName: "required" },
    });
  });

  test("limits the display name to 50 characters, counting emoji once", () => {
    expect(
      validateSettings({ ...validInput, displayName: "a".repeat(51) }),
    ).toEqual({ ok: false, errors: { displayName: "tooLong" } });
    expect(
      validateSettings({ ...validInput, displayName: "🙂".repeat(50) }).ok,
    ).toBe(true);
  });

  test.each([
    ["locale", "fr"],
    ["timezone", "Mars/Olympus_Mons"],
    ["themeMode", "sepia"],
    ["reducedMotion", "sometimes"],
  ])("rejects an unknown %s", (field, value) => {
    expect(validateSettings({ ...validInput, [field]: value })).toEqual({
      ok: false,
      errors: { [field]: "invalid" },
    });
  });

  test.each([
    ["soundVolume", "101"],
    ["soundVolume", "-1"],
    ["streakThreshold", "45"],
    ["pomodoroFocusMinutes", "0"],
    ["pomodoroFocusMinutes", "121"],
    ["pomodoroShortBreakMinutes", "61"],
    ["pomodoroLongBreakMinutes", "0"],
    ["pomodoroSessionsBeforeLongBreak", "13"],
    ["pomodoroFocusMinutes", "25.5"],
    ["pomodoroFocusMinutes", ""],
    ["pomodoroFocusMinutes", "abc"],
  ])("rejects %s = %j", (field, value) => {
    expect(validateSettings({ ...validInput, [field]: value })).toEqual({
      ok: false,
      errors: { [field]: "outOfRange" },
    });
  });

  test("accepts the limits of every range", () => {
    expect(
      validateSettings({
        ...validInput,
        soundVolume: "0",
        streakThreshold: "100",
        pomodoroFocusMinutes: "120",
        pomodoroShortBreakMinutes: "1",
        pomodoroLongBreakMinutes: "120",
        pomodoroSessionsBeforeLongBreak: "12",
      }).ok,
    ).toBe(true);
  });

  test("reports every invalid field at once", () => {
    const result = validateSettings({});
    expect(result.ok).toBe(false);
    expect(!result.ok && Object.keys(result.errors).sort()).toEqual(
      [
        "displayName",
        "locale",
        "timezone",
        "themeMode",
        "reducedMotion",
        "soundVolume",
        "streakThreshold",
        "pomodoroFocusMinutes",
        "pomodoroShortBreakMinutes",
        "pomodoroLongBreakMinutes",
        "pomodoroSessionsBeforeLongBreak",
      ].sort(),
    );
  });
});

describe("isValidTimeZone", () => {
  test.each(["UTC", "Europe/Madrid", "America/Bogota"])("accepts %s", (tz) => {
    expect(isValidTimeZone(tz)).toBe(true);
  });

  test.each(["", "Nowhere/City", 5, null])("rejects %j", (tz) => {
    expect(isValidTimeZone(tz)).toBe(false);
  });
});

describe("initials", () => {
  test.each([
    ["Ada Lovelace", "AL"],
    ["Grace Brewster Murray Hopper", "GH"],
    ["linus", "LI"],
    ["  ñandú  ", "ÑA"],
    ["🙂 Smile", "🙂S"],
    ["", "?"],
  ])("%j → %j", (name, expected) => {
    expect(initials(name)).toBe(expected);
  });
});
