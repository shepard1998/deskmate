export const PASSWORD_MIN_LENGTH = 8;
/** bcrypt, used by Supabase Auth, ignores bytes beyond 72. */
export const PASSWORD_MAX_LENGTH = 72;

export type AuthMode = "signIn" | "signUp";

export type EmailError = "emailRequired" | "emailInvalid";
export type PasswordError =
  "passwordRequired" | "passwordTooShort" | "passwordTooLong";

export type CredentialErrors = {
  email?: EmailError;
  password?: PasswordError;
};

export type CredentialsResult =
  | { ok: true; email: string; password: string }
  | { ok: false; errors: CredentialErrors };

// Deliberately loose: one "@", no spaces, and a dot in the domain. Supabase
// Auth performs the authoritative check.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates sign-in and sign-up input. The length rules apply only when
 * signing up, so existing accounts can always attempt to sign in.
 */
export function validateCredentials(
  input: { email: unknown; password: unknown },
  mode: AuthMode,
): CredentialsResult {
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const password = typeof input.password === "string" ? input.password : "";
  const errors: CredentialErrors = {};

  if (email === "") {
    errors.email = "emailRequired";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "emailInvalid";
  }

  if (password === "") {
    errors.password = "passwordRequired";
  } else if (mode === "signUp" && password.length < PASSWORD_MIN_LENGTH) {
    errors.password = "passwordTooShort";
  } else if (
    mode === "signUp" &&
    new TextEncoder().encode(password).length > PASSWORD_MAX_LENGTH
  ) {
    errors.password = "passwordTooLong";
  }

  return errors.email || errors.password
    ? { ok: false, errors }
    : { ok: true, email, password };
}

export type AuthErrorKey =
  | "invalidCredentials"
  | "emailTaken"
  | "weakPassword"
  | "emailInvalid"
  | "rateLimited"
  | "unexpected";

/** Maps a Supabase Auth error code to a translatable message key. */
export function authErrorKey(code: string | null | undefined): AuthErrorKey {
  switch (code) {
    case "invalid_credentials":
      return "invalidCredentials";
    case "user_already_exists":
    case "email_exists":
      return "emailTaken";
    case "weak_password":
      return "weakPassword";
    case "email_address_invalid":
      return "emailInvalid";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "rateLimited";
    default:
      return "unexpected";
  }
}

export const DEFAULT_SIGNED_IN_PATH = "/desk";

const INTERNAL_ORIGIN = "http://deskmate.internal";

/**
 * Returns `next` only when it is a path inside this app; otherwise the default
 * signed-in page. Prevents open redirects such as `//evil.com`.
 */
export function safeRedirectPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return DEFAULT_SIGNED_IN_PATH;
  }
  try {
    const url = new URL(next, INTERNAL_ORIGIN);
    if (url.origin !== INTERNAL_ORIGIN) {
      return DEFAULT_SIGNED_IN_PATH;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return DEFAULT_SIGNED_IN_PATH;
  }
}
