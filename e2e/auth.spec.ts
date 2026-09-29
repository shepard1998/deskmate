import { expect, test, type Page } from "@playwright/test";

import { expectSignedInAs, signOutFromDesk } from "./support/desk";
import { createUser, testEmail } from "./support/supabase-admin";

test.use({ locale: "en-US" });

const password = "correct-horse-battery";

/** The form's error message. Next.js' route announcer is also an alert. */
function formAlert(page: Page, text: string) {
  return page.getByRole("alert").filter({ hasText: text });
}

async function fillCredentials(page: Page, email: string, secret: string) {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(secret);
}

test("the desk requires a session", async ({ page }) => {
  await page.goto("/desk");

  await expect(page).toHaveURL("/sign-in?next=%2Fdesk");
  await expect(
    page.getByRole("heading", { level: 1, name: "Sign in" }),
  ).toBeVisible();
});

test("a visitor signs up, lands on the desk, and signs out", async ({
  page,
}) => {
  const email = testEmail("signup");

  await page.goto("/");
  await page.getByRole("link", { name: "Create account" }).click();
  await expect(page).toHaveURL("/sign-up");
  await fillCredentials(page, email, password);
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL("/desk");
  await expectSignedInAs(page, email);

  // The session survives a reload, and the auth pages send users back.
  await page.reload();
  await expectSignedInAs(page, email);
  await page.goto("/sign-in");
  await expect(page).toHaveURL("/desk");

  await signOutFromDesk(page);
  await expect(page).toHaveURL("/");
  await page.goto("/desk");
  await expect(page).toHaveURL("/sign-in?next=%2Fdesk");
});

test("an existing user signs in and returns to the page they asked for", async ({
  page,
}) => {
  const email = testEmail("signin");
  await createUser(email, password);

  await page.goto("/desk");
  await expect(page).toHaveURL("/sign-in?next=%2Fdesk");
  await fillCredentials(page, email, password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL("/desk");
  await expectSignedInAs(page, email);
});

test("a wrong password shows an error and keeps the email", async ({
  page,
}) => {
  const email = testEmail("wrongpw");
  await createUser(email, password);

  await page.goto("/sign-in");
  await fillCredentials(page, email, "not-the-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(
    formAlert(page, "The email or password is incorrect."),
  ).toBeVisible();
  await expect(page).toHaveURL("/sign-in");
  await expect(page.getByLabel("Email")).toHaveValue(email);
  await expect(page.getByLabel("Password")).toBeFocused();
});

test("signing up with a registered email shows an error", async ({ page }) => {
  const email = testEmail("taken");
  await createUser(email, password);

  await page.goto("/sign-up");
  await fillCredentials(page, email, password);
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(
    formAlert(page, "An account with this email already exists."),
  ).toBeVisible();
  await expect(page).toHaveURL("/sign-up");
});

test("an empty or short submission shows field errors", async ({ page }) => {
  await page.goto("/sign-up");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByText("Enter your email.")).toBeVisible();
  await expect(page.getByText("Enter your password.")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeFocused();

  await fillCredentials(page, "ada@example.com", "short");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("The password is too short.")).toBeVisible();
});

test("an external return path is ignored", async ({ page }) => {
  const email = testEmail("redirect");
  await createUser(email, password);

  await page.goto("/sign-in?next=//evil.example");
  await fillCredentials(page, email, password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL("/desk");
});
