import { DEFAULT_SIGNED_IN_PATH } from "./auth";

/** Pages that require a session. Subpaths are protected too. */
const PROTECTED_PATHS = ["/desk"];

/** Pages that only make sense without a session. */
const SIGNED_OUT_ONLY_PATHS = ["/sign-in", "/sign-up"];

function matches(pathname: string, paths: string[]): boolean {
  return paths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

/**
 * Decides whether a request must be redirected based on the session.
 * Returns the redirect target (path and query), or null to continue.
 */
export function redirectForRoute(
  pathname: string,
  search: string,
  isSignedIn: boolean,
): string | null {
  if (!isSignedIn && matches(pathname, PROTECTED_PATHS)) {
    const next = encodeURIComponent(`${pathname}${search}`);
    return `/sign-in?next=${next}`;
  }
  if (isSignedIn && matches(pathname, SIGNED_OUT_ONLY_PATHS)) {
    return DEFAULT_SIGNED_IN_PATH;
  }
  return null;
}
