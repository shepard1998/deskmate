import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";

import { renderWithIntl } from "@/i18n/test-utils";

import { AccountMenu } from "./account-menu";

vi.mock("@/lib/server/auth-actions", () => ({ signOut: vi.fn() }));

function renderMenu() {
  return renderWithIntl(
    <div>
      <AccountMenu email="ada@example.com" avatar={<span>AL</span>} />
      <p>Outside</p>
    </div>,
  );
}

test("opens from the avatar and moves focus into the menu", async () => {
  const user = userEvent.setup();
  renderMenu();

  const toggle = screen.getByRole("button", { name: "Account menu" });
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(screen.getByText("Signed in as ada@example.com")).not.toBeVisible();

  await user.click(toggle);

  expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByText("Signed in as ada@example.com")).toBeVisible();
  expect(screen.getByRole("link", { name: "Settings" })).toHaveFocus();
  expect(screen.getByRole("button", { name: "Sign out" })).toBeVisible();
});

test("closes with Escape and returns focus to the avatar", async () => {
  const user = userEvent.setup();
  renderMenu();
  const toggle = screen.getByRole("button", { name: "Account menu" });

  await user.click(toggle);
  await user.keyboard("{Escape}");

  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(toggle).toHaveFocus();
});

test("closes when clicking outside", async () => {
  const user = userEvent.setup();
  renderMenu();
  const toggle = screen.getByRole("button", { name: "Account menu" });

  await user.click(toggle);
  await user.click(screen.getByText("Outside"));

  expect(toggle).toHaveAttribute("aria-expanded", "false");
});
