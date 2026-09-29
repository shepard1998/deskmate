import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";

import { renderWithIntl } from "@/i18n/test-utils";
import { saveSettings } from "@/lib/server/settings-actions";

import { SettingsForm, type SettingsFormValues } from "./settings-form";

vi.mock("@/lib/server/settings-actions", () => ({
  saveSettings: vi.fn(),
  saveDetectedTimeZone: vi.fn(),
}));

const values: SettingsFormValues = {
  displayName: "Ada Lovelace",
  locale: "en",
  timezone: "Europe/London",
  themeMode: "auto",
  soundEnabled: true,
  soundVolume: 70,
  reducedMotion: "system",
  streakThreshold: 80,
  pomodoroFocusMinutes: 25,
  pomodoroShortBreakMinutes: 5,
  pomodoroLongBreakMinutes: 15,
  pomodoroSessionsBeforeLongBreak: 4,
  aiNoteEnabled: true,
};

const timeZones = ["America/Bogota", "Europe/London", "Europe/Madrid", "UTC"];

beforeEach(() => {
  vi.mocked(saveSettings).mockReset();
});

test("shows every setting with its current value", () => {
  renderWithIntl(<SettingsForm values={values} timeZones={timeZones} />);

  expect(screen.getByLabelText("Display name")).toHaveValue("Ada Lovelace");
  expect(screen.getByLabelText("Language")).toHaveValue("en");
  expect(screen.getByLabelText("Time zone")).toHaveValue("Europe/London");
  expect(
    screen.getByRole("radio", { name: "Automatic (follows the time of day)" }),
  ).toBeChecked();
  expect(screen.getByLabelText("Play sounds")).toBeChecked();
  expect(screen.getByLabelText("Volume")).toHaveValue("70");
  expect(screen.getByText("70%")).toBeInTheDocument();
  expect(
    screen.getByRole("radio", { name: "Follow my system setting" }),
  ).toBeChecked();
  expect(screen.getByLabelText("Streak threshold")).toHaveValue("80");
  expect(screen.getByLabelText("Focus (minutes)")).toHaveValue(25);
  expect(screen.getByLabelText("Short break (minutes)")).toHaveValue(5);
  expect(screen.getByLabelText("Long break (minutes)")).toHaveValue(15);
  expect(
    screen.getByLabelText("Focus sessions before a long break"),
  ).toHaveValue(4);
  expect(screen.getByLabelText("Write my morning note with AI")).toBeChecked();
});

test("groups radio options under a legend", () => {
  renderWithIntl(<SettingsForm values={values} timeZones={timeZones} />);

  expect(screen.getByRole("group", { name: "Theme" })).toBeInTheDocument();
  expect(screen.getByRole("group", { name: "Animations" })).toBeInTheDocument();
});

test("saves the edited settings and announces it", async () => {
  const user = userEvent.setup();
  vi.mocked(saveSettings).mockResolvedValueOnce({
    status: "saved",
    errors: {},
    submission: 1,
  });
  renderWithIntl(<SettingsForm values={values} timeZones={timeZones} />);

  await user.clear(screen.getByLabelText("Display name"));
  await user.type(screen.getByLabelText("Display name"), "Ada");
  await user.click(screen.getByRole("radio", { name: "Dark" }));
  await user.click(screen.getByLabelText("Play sounds"));
  await user.selectOptions(screen.getByLabelText("Time zone"), "Europe/Madrid");
  await user.click(screen.getByRole("button", { name: "Save settings" }));

  const formData = vi.mocked(saveSettings).mock.calls[0]?.[1];
  expect(Object.fromEntries(formData ?? [])).toMatchObject({
    displayName: "Ada",
    themeMode: "dark",
    timezone: "Europe/Madrid",
    soundVolume: "70",
    pomodoroFocusMinutes: "25",
    aiNoteEnabled: "on",
  });
  expect(formData?.has("soundEnabled")).toBe(false);
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Settings saved.",
  );
});

test("marks invalid fields, explains the range, and keeps the typed values", async () => {
  const user = userEvent.setup();
  vi.mocked(saveSettings).mockResolvedValueOnce({
    status: "invalid",
    errors: { pomodoroFocusMinutes: "outOfRange" },
    submission: 1,
  });
  renderWithIntl(<SettingsForm values={values} timeZones={timeZones} />);

  const focus = screen.getByLabelText("Focus (minutes)");
  await user.clear(focus);
  await user.type(focus, "500");
  await user.click(screen.getByRole("button", { name: "Save settings" }));

  expect(await screen.findByRole("status")).toHaveTextContent(
    "Some settings need attention.",
  );
  expect(focus).toHaveAttribute("aria-invalid", "true");
  expect(focus).toHaveAccessibleDescription(
    "Enter a whole number from 1 to 120.",
  );
  expect(focus).toHaveValue(500);
  expect(focus).toHaveFocus();
});

test("keeps typed values when a slider moves", async () => {
  const user = userEvent.setup();
  renderWithIntl(<SettingsForm values={values} timeZones={timeZones} />);

  await user.clear(screen.getByLabelText("Focus (minutes)"));
  await user.type(screen.getByLabelText("Focus (minutes)"), "45");
  fireEvent.change(screen.getByLabelText("Volume"), {
    target: { value: "30" },
  });

  expect(screen.getByText("30%")).toBeInTheDocument();
  expect(screen.getByLabelText("Focus (minutes)")).toHaveValue(45);
});

test("defaults to the browser's time zone when the profile has none", () => {
  const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  renderWithIntl(
    <SettingsForm
      values={{ ...values, timezone: null }}
      timeZones={timeZones}
    />,
  );

  expect(screen.getByLabelText("Time zone")).toHaveValue(browserZone);
});

test("fills in the browser's time zone on request", async () => {
  const user = userEvent.setup();
  const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  renderWithIntl(<SettingsForm values={values} timeZones={timeZones} />);

  await user.selectOptions(screen.getByLabelText("Time zone"), "UTC");
  await user.click(
    screen.getByRole("button", { name: "Use my browser's time zone" }),
  );

  expect(screen.getByLabelText("Time zone")).toHaveValue(browserZone);
});

test("is translated into Spanish, including number formats", () => {
  renderWithIntl(
    <SettingsForm values={{ ...values, locale: "es" }} timeZones={timeZones} />,
    "es",
  );

  expect(screen.getByLabelText("Nombre visible")).toBeInTheDocument();
  expect(screen.getByRole("group", { name: "Tema" })).toBeInTheDocument();
  expect(screen.getByLabelText("Volumen")).toHaveAttribute(
    "aria-valuetext",
    // Spanish separates the percent sign with a non-breaking space.
    expect.stringMatching(/^70\s%$/),
  );
  expect(
    screen.getByRole("button", { name: "Guardar ajustes" }),
  ).toBeInTheDocument();
});
