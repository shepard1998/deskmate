import { expect, type Page } from "@playwright/test";

/** Opens the account menu and checks who is signed in (English UI). */
export async function expectSignedInAs(page: Page, email: string) {
  await page.getByRole("button", { name: "Account menu" }).click();
  await expect(page.getByText(`Signed in as ${email}`)).toBeVisible();
  await page.keyboard.press("Escape");
}

/** Signs out through the account menu (English UI). */
export async function signOutFromDesk(page: Page) {
  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("button", { name: "Sign out" }).click();
}
