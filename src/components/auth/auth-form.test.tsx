import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { renderWithIntl } from "@/i18n/test-utils";
import type { AuthFormState } from "@/lib/auth-form-state";
import { signIn, signUp } from "@/lib/server/auth-actions";

import { AuthForm } from "./auth-form";

vi.mock("@/lib/server/auth-actions", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

function respondWith(action: typeof signIn, state: AuthFormState) {
  vi.mocked(action).mockResolvedValueOnce(state);
}

beforeEach(() => {
  vi.mocked(signIn).mockReset();
  vi.mocked(signUp).mockReset();
});

describe("sign-in form", () => {
  test("has labelled fields, a submit button, and a link to sign up", () => {
    renderWithIntl(<AuthForm mode="signIn" />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Sign in" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "autocomplete",
      "email",
    );
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Create an account" }),
    ).toHaveAttribute("href", "/sign-up");
  });

  test("sends the credentials and the return path", async () => {
    const user = userEvent.setup();
    respondWith(signIn, {
      email: "ada@example.com",
      fieldErrors: {},
      formError: "invalidCredentials",
    });
    renderWithIntl(<AuthForm mode="signIn" next="/desk" />);

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "secret-pass");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    const formData = vi.mocked(signIn).mock.calls[0]?.[1];
    expect(formData?.get("email")).toBe("ada@example.com");
    expect(formData?.get("password")).toBe("secret-pass");
    expect(formData?.get("next")).toBe("/desk");
  });

  test("announces a form error and moves focus to the password", async () => {
    const user = userEvent.setup();
    respondWith(signIn, {
      email: "ada@example.com",
      fieldErrors: {},
      formError: "invalidCredentials",
    });
    renderWithIntl(<AuthForm mode="signIn" />);

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong-pass");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The email or password is incorrect.",
    );
    expect(screen.getByLabelText("Email")).toHaveValue("ada@example.com");
    expect(screen.getByLabelText("Password")).toHaveFocus();
  });

  test("marks invalid fields and focuses the first one", async () => {
    const user = userEvent.setup();
    respondWith(signIn, {
      email: "",
      fieldErrors: { email: "emailRequired", password: "passwordRequired" },
      formError: null,
    });
    renderWithIntl(<AuthForm mode="signIn" />);

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    const email = await screen.findByLabelText("Email");
    await vi.waitFor(() =>
      expect(email).toHaveAttribute("aria-invalid", "true"),
    );
    expect(email).toHaveAccessibleDescription("Enter your email.");
    expect(email).toHaveFocus();
    expect(screen.getByLabelText("Password")).toHaveAccessibleDescription(
      "Enter your password.",
    );
  });

  test("keeps the return path when switching to sign up", () => {
    renderWithIntl(<AuthForm mode="signIn" next="/desk?tab=today" />);

    expect(
      screen.getByRole("link", { name: "Create an account" }),
    ).toHaveAttribute("href", "/sign-up?next=%2Fdesk%3Ftab%3Dtoday");
  });
});

describe("sign-up form", () => {
  test("describes the password rule and suggests a new password", () => {
    renderWithIntl(<AuthForm mode="signUp" />);

    const password = screen.getByLabelText("Password");
    expect(password).toHaveAttribute("autocomplete", "new-password");
    expect(password).toHaveAccessibleDescription("At least 8 characters.");
  });

  test("is fully translated into Spanish", () => {
    renderWithIntl(<AuthForm mode="signUp" />, "es");

    expect(
      screen.getByRole("heading", { level: 1, name: "Crea tu cuenta" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toHaveAccessibleDescription(
      "Al menos 8 caracteres.",
    );
    expect(
      screen.getByRole("button", { name: "Crear cuenta" }),
    ).toBeInTheDocument();
  });

  test("shows that the email is already registered", async () => {
    const user = userEvent.setup();
    respondWith(signUp, {
      email: "ada@example.com",
      fieldErrors: {},
      formError: "emailTaken",
    });
    renderWithIntl(<AuthForm mode="signUp" />);

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "long-enough");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "An account with this email already exists.",
    );
    expect(signIn).not.toHaveBeenCalled();
  });
});
