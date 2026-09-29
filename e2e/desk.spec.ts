import { expect, test, type Page } from "@playwright/test";

import { createUser, testEmail } from "./support/supabase-admin";

test.use({ locale: "en-US", timezoneId: "Europe/Madrid" });

const password = "correct-horse-battery";

async function openDesk(page: Page) {
  const email = testEmail("desk");
  await createUser(email, password, { full_name: "Ada Lovelace" });
  await page.goto("/sign-in?next=%2Fdesk");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL("/desk");
}

async function hasHorizontalScroll(page: Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
}

test.describe("on a desktop screen", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("shows the sheet stack and the desk objects", async ({ page }) => {
    await openDesk(page);

    await expect(
      page.getByRole("heading", { level: 1, name: /, Ada Lovelace$/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("tablist", { name: "Parts of the day" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Sticky notes" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Desk calendar" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Job search board" }),
    ).toBeVisible();
    await expect(page.getByRole("list", { name: "Desk objects" })).toBeHidden();
    expect(await hasHorizontalScroll(page)).toBe(false);
  });

  test("the day part tabs work with the keyboard", async ({ page }) => {
    await openDesk(page);

    await page.getByRole("tab", { name: "Morning" }).click();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Afternoon" })).toBeFocused();
    await expect(
      page.getByRole("tabpanel", { name: "Afternoon" }),
    ).toContainText("Code review for Ana");

    await page.keyboard.press("End");
    await expect(page.getByRole("tabpanel", { name: "Night" })).toBeVisible();
  });

  test("the skip link jumps to the sheet", async ({ page }) => {
    await openDesk(page);

    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to your sheet" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#sheet$/);
  });
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("stacks the sheets and moves the objects to a bottom bar", async ({
    page,
  }) => {
    await openDesk(page);

    await expect(
      page.getByRole("tablist", { name: "Parts of the day" }),
    ).toBeVisible();
    const bar = page.getByRole("list", { name: "Desk objects" });
    await expect(bar).toBeVisible();
    await expect(bar).toContainText("Calendar");
    await expect(bar).toContainText("Notes");
    await expect(bar).toContainText("Jobs");
    await expect(
      page.getByRole("heading", { name: "Sticky notes" }),
    ).toBeHidden();
    expect(await hasHorizontalScroll(page)).toBe(false);
  });
});
