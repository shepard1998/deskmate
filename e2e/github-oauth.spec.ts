import { expect, test, type Page } from "@playwright/test";

test.use({ locale: "en-US" });

const GITHUB_CLIENT_ID = "Ov23limcIVBrAEMrIvbl";

function formAlert(page: Page, text: string) {
  return page.getByRole("alert").filter({ hasText: text });
}

test("the GitHub button sends the user to GitHub with minimal scopes", async ({
  page,
}) => {
  await page.goto("/sign-in?next=%2Fdesk%3Ftab%3Dtoday");
  // Supabase redirects to GitHub's authorize endpoint. Capture that request
  // rather than depending on GitHub's own pages.
  const authorizeRequest = page.waitForRequest((request) =>
    request.url().startsWith("https://github.com/login/oauth/authorize"),
  );
  await page.getByRole("button", { name: "Continue with GitHub" }).click();

  const authorize = new URL((await authorizeRequest).url());
  expect(authorize.searchParams.get("client_id")).toBe(GITHUB_CLIENT_ID);
  expect(authorize.searchParams.get("scope")).toBe("user:email");
  expect(authorize.searchParams.get("redirect_uri")).toMatch(
    /\.supabase\.co\/auth\/v1\/callback$/,
  );
});

test("cancelling on GitHub returns to sign in with a message", async ({
  page,
}) => {
  await page.goto("/auth/callback?error=access_denied&next=%2Fdesk%2Fstats");

  await expect(page).toHaveURL(
    "/sign-in?error=github_cancelled&next=%2Fdesk%2Fstats",
  );
  await expect(formAlert(page, "GitHub sign-in was cancelled.")).toBeVisible();
});

test("a callback without a valid code returns to sign in", async ({ page }) => {
  await page.goto("/auth/callback?code=not-a-real-code");

  await expect(page).toHaveURL("/sign-in?error=github_failed");
  await expect(
    formAlert(page, "We couldn't sign you in with GitHub. Please try again."),
  ).toBeVisible();
});
