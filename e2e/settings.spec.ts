import { expect, test, type Page } from "@playwright/test";

import { adminClient, createUser, testEmail } from "./support/supabase-admin";

test.use({ locale: "en-US", timezoneId: "America/Bogota" });

const password = "correct-horse-battery";

async function signIn(page: Page, email: string, next = "/desk") {
  await page.goto(`/sign-in?next=${encodeURIComponent(next)}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(next);
}

test("settings require a session", async ({ page }) => {
  await page.goto("/settings");
  await expect(page).toHaveURL("/sign-in?next=%2Fsettings");
});

test("the desk stores the browser's time zone on the first visit", async ({
  page,
}) => {
  const email = testEmail("tz");
  const id = await createUser(email, password);

  await signIn(page, email);

  await expect
    .poll(async () => {
      const { data } = await adminClient()
        .from("profiles")
        .select("timezone")
        .eq("id", id)
        .single();
      return data?.timezone;
    })
    .toBe("America/Bogota");
});

test("saved settings persist across reloads", async ({ page }) => {
  const email = testEmail("settings");
  await createUser(email, password, { full_name: "Ada Lovelace" });
  await signIn(page, email, "/settings");

  await expect(page.getByLabel("Display name")).toHaveValue("Ada Lovelace");
  await page.getByLabel("Display name").fill("Ada L.");
  await page
    .getByRole("button", { name: "Use my browser's time zone" })
    .click();
  await page.getByRole("radio", { name: "Dark" }).check();
  await page.getByLabel("Play sounds").uncheck();
  await page.getByRole("radio", { name: "Reduce animations" }).check();
  await page.getByLabel("Focus (minutes)").fill("50");
  await page.getByLabel("Focus sessions before a long break").fill("3");
  await page.getByLabel("Write my morning note with AI").uncheck();
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByRole("status")).toHaveText("Settings saved.");

  await page.reload();
  await expect(page.getByLabel("Display name")).toHaveValue("Ada L.");
  await expect(page.getByLabel("Time zone")).toHaveValue("America/Bogota");
  await expect(page.getByRole("radio", { name: "Dark" })).toBeChecked();
  await expect(page.getByLabel("Play sounds")).not.toBeChecked();
  await expect(
    page.getByRole("radio", { name: "Reduce animations" }),
  ).toBeChecked();
  await expect(page.getByLabel("Focus (minutes)")).toHaveValue("50");
  await expect(
    page.getByLabel("Focus sessions before a long break"),
  ).toHaveValue("3");
  await expect(
    page.getByLabel("Write my morning note with AI"),
  ).not.toBeChecked();
});

test("invalid values are explained and not saved", async ({ page }) => {
  const email = testEmail("invalid");
  const id = await createUser(email, password);
  await signIn(page, email, "/settings");

  await page.getByLabel("Focus (minutes)").fill("500");
  await page.getByRole("button", { name: "Save settings" }).click();

  await expect(page.getByRole("status")).toHaveText(
    "Some settings need attention.",
  );
  await expect(page.getByLabel("Focus (minutes)")).toBeFocused();
  await expect(
    page.getByText("Enter a whole number from 1 to 120."),
  ).toBeVisible();
  const { data } = await adminClient()
    .from("profiles")
    .select("pomodoro_focus_minutes")
    .eq("id", id)
    .single();
  expect(data?.pomodoro_focus_minutes).toBe(25);
});

test("changing the language in settings switches the UI", async ({ page }) => {
  const email = testEmail("lang");
  await createUser(email, password);
  await signIn(page, email, "/settings");

  // The header's language switcher has the same label; use the form's.
  await page.locator("main").getByLabel("Language").selectOption("es");
  await page.getByRole("button", { name: "Save settings" }).click();

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ajustes");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});

test("the profile language applies when signing in on a new browser", async ({
  page,
}) => {
  const email = testEmail("profile-lang");
  await createUser(email, password, { locale: "es" });

  await signIn(page, email);

  await expect(
    page.getByRole("heading", { level: 1, name: "Tu escritorio" }),
  ).toBeVisible();
});

test("the language switcher also updates the profile", async ({ page }) => {
  const email = testEmail("switcher");
  const id = await createUser(email, password);
  await signIn(page, email);

  await page.getByRole("combobox", { name: "Language" }).selectOption("es");
  await expect(
    page.getByRole("heading", { level: 1, name: "Tu escritorio" }),
  ).toBeVisible();

  const { data } = await adminClient()
    .from("profiles")
    .select("locale")
    .eq("id", id)
    .single();
  expect(data?.locale).toBe("es");
});
