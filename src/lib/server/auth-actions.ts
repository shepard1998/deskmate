"use server";

import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

import type { AuthFormState } from "@/lib/auth-form-state";
import {
  authErrorKey,
  safeRedirectPath,
  validateCredentials,
  type AuthMode,
} from "@/lib/domain/auth";

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
          // Kept for localized communication once emails exist (see backlog).
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

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
