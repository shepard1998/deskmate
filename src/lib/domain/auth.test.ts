import { describe, expect, test } from "vitest";

import { authErrorKey, safeRedirectPath, validateCredentials } from "./auth";

describe("validateCredentials", () => {
  test("accepts valid sign-up input and trims the email", () => {
    expect(
      validateCredentials(
        { email: "  ada@example.com ", password: "correct horse" },
        "signUp",
      ),
    ).toEqual({
      ok: true,
      email: "ada@example.com",
      password: "correct horse",
    });
  });

  test("keeps the password exactly as typed", () => {
    const result = validateCredentials(
      { email: "ada@example.com", password: " spaced password " },
      "signUp",
    );
    expect(result).toMatchObject({ ok: true, password: " spaced password " });
  });

  test("requires both fields", () => {
    expect(validateCredentials({ email: "", password: "" }, "signIn")).toEqual({
      ok: false,
      errors: { email: "emailRequired", password: "passwordRequired" },
    });
  });

  test("treats non-string input as missing", () => {
    expect(
      validateCredentials({ email: null, password: undefined }, "signIn"),
    ).toEqual({
      ok: false,
      errors: { email: "emailRequired", password: "passwordRequired" },
    });
  });

  test.each(["ada", "ada@", "@example.com", "ada@example", "a da@example.com"])(
    "rejects the malformed email %j",
    (email) => {
      expect(
        validateCredentials({ email, password: "correct horse" }, "signIn"),
      ).toEqual({ ok: false, errors: { email: "emailInvalid" } });
    },
  );

  test("requires at least 8 characters when signing up", () => {
    expect(
      validateCredentials(
        { email: "ada@example.com", password: "1234567" },
        "signUp",
      ),
    ).toEqual({ ok: false, errors: { password: "passwordTooShort" } });
    expect(
      validateCredentials(
        { email: "ada@example.com", password: "12345678" },
        "signUp",
      ).ok,
    ).toBe(true);
  });

  test("rejects passwords longer than 72 bytes when signing up", () => {
    expect(
      validateCredentials(
        { email: "ada@example.com", password: "ñ".repeat(37) },
        "signUp",
      ),
    ).toEqual({ ok: false, errors: { password: "passwordTooLong" } });
  });

  test("does not apply length rules when signing in", () => {
    expect(
      validateCredentials(
        { email: "ada@example.com", password: "short" },
        "signIn",
      ).ok,
    ).toBe(true);
  });
});

describe("authErrorKey", () => {
  test.each([
    ["invalid_credentials", "invalidCredentials"],
    ["user_already_exists", "emailTaken"],
    ["email_exists", "emailTaken"],
    ["weak_password", "weakPassword"],
    ["email_address_invalid", "emailInvalid"],
    ["over_request_rate_limit", "rateLimited"],
    ["over_email_send_rate_limit", "rateLimited"],
    ["something_new", "unexpected"],
    [undefined, "unexpected"],
  ])("maps %j to %j", (code, key) => {
    expect(authErrorKey(code)).toBe(key);
  });
});

describe("safeRedirectPath", () => {
  test.each(["/desk", "/desk/settings?tab=profile", "/stats#streaks"])(
    "keeps the internal path %j",
    (path) => {
      expect(safeRedirectPath(path)).toBe(path);
    },
  );

  test.each([
    null,
    undefined,
    "",
    "desk",
    "https://evil.com",
    "//evil.com",
    "/\\evil.com",
    "javascript:alert(1)",
  ])("falls back to /desk for %j", (next) => {
    expect(safeRedirectPath(next)).toBe("/desk");
  });
});
