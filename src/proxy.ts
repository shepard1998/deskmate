import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/database.types";
import { redirectForRoute } from "@/lib/domain/route-access";
import { getPublicEnv } from "@/lib/env";

/**
 * Refreshes the Supabase session on every page request and guards routes that
 * depend on it. Pages still verify the user themselves; this is the first line.
 */
export async function proxy(request: NextRequest) {
  const env = getPublicEnv();
  let response = NextResponse.next({ request });
  // No-cache headers Supabase requires on responses that set session cookies.
  let sessionHeaders: Record<string, string> = {};

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // Pages rendered for this request must see the refreshed session.
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
          sessionHeaders = { ...sessionHeaders, ...headers };
        },
      },
    },
  );

  // Verifies the JWT and refreshes an expiring session. Do not add code
  // between creating the client and this call.
  const { data } = await supabase.auth.getClaims();

  const target = redirectForRoute(
    request.nextUrl.pathname,
    request.nextUrl.search,
    Boolean(data?.claims),
  );
  if (target) {
    const redirect = NextResponse.redirect(new URL(target, request.url));
    for (const cookie of response.cookies.getAll()) {
      redirect.cookies.set(cookie);
    }
    response = redirect;
  }

  for (const [key, value] of Object.entries(sessionHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: [
    // Every page, except Next.js internals and static files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$).*)",
  ],
};
