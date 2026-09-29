import { createClient } from "@supabase/supabase-js";

import type { Database } from "../../src/lib/database.types";

/**
 * Test users live in the shared Supabase project, so every one of them uses
 * this reserved domain and is deleted by the global setup and teardown.
 */
const TEST_EMAIL_DOMAIN = "deskmate.test";

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`E2E tests need ${name} (see .env.example).`);
  }
  return value;
}

const clientOptions = {
  auth: { persistSession: false, autoRefreshToken: false },
} as const;

/** Bypasses RLS. Only for arranging and inspecting test data. */
export function adminClient() {
  return createClient<Database>(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("SUPABASE_SECRET_KEY"),
    clientOptions,
  );
}

/** A client with the publishable key and no session, like a visitor. */
export function anonClient() {
  return createClient<Database>(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    clientOptions,
  );
}

/** A client signed in as the given user, subject to RLS like the app. */
export async function signedInClient(email: string, password: string) {
  const client = anonClient();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    throw error;
  }
  return { client, userId: data.user.id };
}

function runId(): string {
  const id = process.env.E2E_RUN_ID;
  if (!id) {
    throw new Error("E2E_RUN_ID is set by the global setup.");
  }
  return id;
}

/** A unique email for this test run, e.g. `e2e-lx2k9-signup-4f1a@deskmate.test`. */
export function testEmail(label: string): string {
  const suffix = Math.random().toString(36).slice(2, 6);
  return `e2e-${runId()}-${label}-${suffix}@${TEST_EMAIL_DOMAIN}`;
}

/** Creates a user that can sign in right away and returns its id. */
export async function createUser(
  email: string,
  password: string,
  metadata: Record<string, string> = {},
): Promise<string> {
  const { data, error } = await adminClient().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });
  if (error) {
    throw error;
  }
  return data.user.id;
}

/** Deletes the test users that match `shouldDelete`. */
export async function deleteTestUsers(
  shouldDelete: (user: { email: string; createdAt: string }) => boolean,
) {
  const admin = adminClient().auth.admin;
  const doomed: string[] = [];

  for (let page = 1; ; page += 1) {
    const { data, error } = await admin.listUsers({ page, perPage: 1000 });
    if (error) {
      throw error;
    }
    for (const user of data.users) {
      const email = user.email ?? "";
      if (
        email.endsWith(`@${TEST_EMAIL_DOMAIN}`) &&
        shouldDelete({ email, createdAt: user.created_at })
      ) {
        doomed.push(user.id);
      }
    }
    if (data.users.length < 1000) {
      break;
    }
  }

  for (const id of doomed) {
    const { error } = await admin.deleteUser(id);
    if (error) {
      throw error;
    }
  }
}

/** Email prefix shared by every user created in the current run. */
export function currentRunPrefix(): string {
  return `e2e-${runId()}-`;
}
