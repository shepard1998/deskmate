"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

import type { AuthFormState } from "@/lib/auth-form-state";
import {
  authErrorKey,
  safeRedirectPath,
  validateCredentials,
  type AuthMode,
} from "@/lib/domain/auth";
import { oauthCallbackUrl, oauthFailure } from "@/lib/domain/oauth";

import { applyProfileLocale } from "./profile";
import { createClient } from "./supabase";

function readForm(formData: FormData) {
  const email = formData.get("email");
  const next = formData.get("next");
  return {
    email,
    password: formData.get("password"),
    echoedEmail: typeof email === "string" ? email : "",
    next: typeof next === "string" ? next : null,
  };
}

async function authenticate(
  mode: AuthMode,
  formData: FormData,
): Promise<AuthFormState> {
  const form = readForm(formData);
  const credentials = validateCredentials(form, mode);
  if (!credentials.ok) {
    return {
      email: form.echoedEmail,
      fieldErrors: credentials.errors,
      formError: null,
    };
  }

  const supabase = await createClient();
  const { data, error } =
    mode === "signIn"
      ? await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        })
      : await supabase.auth.signUp({
          email: credentials.email,
          password: credentials.password,
          // The profile trigger reads it to set the profile language.
          options: { data: { locale: await getLocale() } },
        });

  if (error || !data.session) {
    return {
      email: form.echoedEmail,
      fieldErrors: {},
      // A sign-up without a session means email confirmation is on, which
      // this app does not support yet.
      formError: error ? authErrorKey(error.code) : "unexpected",
    };
  }

  if (mode === "signIn") {
    await applyProfileLocale(supabase, data.session.user.id);
  }
  redirect(safeRedirectPath(form.next));
}

export async function signIn(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  return authenticate("signIn", formData);
}

export async function signUp(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  return authenticate("signUp", formData);
}

/** Starts the GitHub OAuth flow; GitHub sends the user back to /auth/callback. */
export async function signInWithGitHub(formData: FormData): Promise<void> {
  const next = formData.get("next");
  const headerStore = await headers();
  // Server Functions only accept same-origin requests, so Origin is this app.
  const origin =
    headerStore.get("origin") ??
    `${headerStore.get("x-forwarded-proto") ?? "http"}://${headerStore.get("host")}`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: oauthCallbackUrl(
        origin,
        typeof next === "string" ? next : null,
      ),
    },
  });

  if (error || !data.url) {
    redirect(`/sign-in?error=${oauthFailure(null)}`);
  }
  redirect(data.url);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
