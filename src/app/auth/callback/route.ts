import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_SIGNED_IN_PATH, safeRedirectPath } from "@/lib/domain/auth";
import { oauthFailure } from "@/lib/domain/oauth";
import { createClient } from "@/lib/server/supabase";

/**
 * Supabase redirects here after GitHub with a one-time `code` (PKCE). It is
 * exchanged for a session cookie, then the user continues to `next`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeRedirectPath(searchParams.get("next"));
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  const signIn = new URL("/sign-in", origin);
  signIn.searchParams.set("error", oauthFailure(searchParams.get("error")));
  if (next !== DEFAULT_SIGNED_IN_PATH) {
    signIn.searchParams.set("next", next);
  }
  return NextResponse.redirect(signIn);
}
