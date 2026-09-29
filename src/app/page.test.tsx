import { screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import { renderWithIntl } from "@/i18n/test-utils";

import Home from "./page";

vi.mock("@/i18n/actions", () => ({ setLocale: vi.fn() }));

test("renders the app name as the main heading", () => {
  renderWithIntl(<Home />);

  expect(
    screen.getByRole("heading", { level: 1, name: "Deskmate" }),
  ).toBeInTheDocument();
});

test("renders the tagline in the active locale", () => {
  renderWithIntl(<Home />, "es");

  expect(
    screen.getByText("Un escritorio para tu día a día de desarrollo."),
  ).toBeInTheDocument();
});

test("links to sign in and sign up", () => {
  renderWithIntl(<Home />);

  expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
    "href",
    "/sign-in",
  );
  expect(screen.getByRole("link", { name: "Create account" })).toHaveAttribute(
    "href",
    "/sign-up",
  );
});
