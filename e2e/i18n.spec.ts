import { expect, test } from "@playwright/test";

const englishTagline = "A desk for your developer day.";
const spanishTagline = "Un escritorio para tu día a día de desarrollo.";

test.describe("with an English browser", () => {
  test.use({ locale: "en-US" });

  test("switching to Spanish persists across reloads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(englishTagline)).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.getByRole("combobox", { name: "Language" }).selectOption("es");

    await expect(page.getByText(spanishTagline)).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "es");

    await page.reload();
    await expect(page.getByText(spanishTagline)).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Idioma" })).toHaveValue(
      "es",
    );
  });

  test("the language can be changed with the keyboard", async ({ page }) => {
    await page.goto("/");

    await page.keyboard.press("Tab");
    const select = page.getByRole("combobox", { name: "Language" });
    await expect(select).toBeFocused();

    await select.press("ArrowDown");

    await expect(page.getByText(spanishTagline)).toBeVisible();
  });
});

test.describe("with a Spanish browser", () => {
  test.use({ locale: "es-MX" });

  test("the first visit is in Spanish", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText(spanishTagline)).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
  });
});
