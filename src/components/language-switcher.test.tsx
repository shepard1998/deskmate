import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";

import { setLocale } from "@/i18n/actions";
import { renderWithIntl } from "@/i18n/test-utils";

import { LanguageSwitcher } from "./language-switcher";

vi.mock("@/i18n/actions", () => ({ setLocale: vi.fn() }));

beforeEach(() => {
  vi.mocked(setLocale).mockClear();
});

test("shows the active locale in a labelled control", () => {
  renderWithIntl(<LanguageSwitcher />, "es");

  const select = screen.getByRole("combobox", { name: "Idioma" });
  expect(select).toHaveValue("es");
  expect(screen.getByRole("option", { name: "English" })).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "Español" })).toBeInTheDocument();
});

test("stores the locale the user picks", async () => {
  const user = userEvent.setup();
  renderWithIntl(<LanguageSwitcher />, "en");

  await user.selectOptions(
    screen.getByRole("combobox", { name: "Language" }),
    "es",
  );

  expect(setLocale).toHaveBeenCalledExactlyOnceWith("es");
});

// jsdom does not emulate arrow keys on a native select; the E2E test changes
// the language with the keyboard in a real browser.
test("can be reached with the keyboard", async () => {
  const user = userEvent.setup();
  renderWithIntl(<LanguageSwitcher />, "en");

  await user.tab();

  expect(screen.getByRole("combobox", { name: "Language" })).toHaveFocus();
});
