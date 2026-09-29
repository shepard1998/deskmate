import { DEFAULT_SIGNED_IN_PATH, safeRedirectPath } from "./auth";

export const OAUTH_CALLBACK_PATH = "/auth/callback";

/**
 * URL that Supabase sends the user back to after GitHub. The return path is
 * only included when it differs from the default, and is always internal.
 */
export function oauthCallbackUrl(
  origin: string,
  next: string | null | undefined,
): string {
  const url = new URL(OAUTH_CALLBACK_PATH, origin);
  const target = safeRedirectPath(next);
  if (target !== DEFAULT_SIGNED_IN_PATH) {
    url.searchParams.set("next", target);
  }
  return url.toString();
}

/** Reasons a GitHub sign-in can fail, as passed to `/sign-in?error=`. */
export type OAuthFailure = "github_cancelled" | "github_failed";

/** Classifies the `error` parameter the OAuth provider sent back. */
export function oauthFailure(providerError: string | null): OAuthFailure {
  return providerError === "access_denied"
    ? "github_cancelled"
    : "github_failed";
}

export type OAuthErrorKey = "githubCancelled" | "githubFailed";

/** Maps the `error` search parameter of the sign-in page to a message key. */
export function oauthErrorKey(param: unknown): OAuthErrorKey | null {
  switch (param) {
    case "github_cancelled":
      return "githubCancelled";
    case "github_failed":
      return "githubFailed";
    default:
      return null;
  }
}
