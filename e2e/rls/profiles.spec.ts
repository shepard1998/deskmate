import { expect, test } from "@playwright/test";

import {
  adminClient,
  anonClient,
  createUser,
  signedInClient,
  testEmail,
} from "../support/supabase-admin";

// API-level checks of the profiles table: Row Level Security, column
// privileges, and the sign-up trigger. No browser needed.

const password = "correct-horse-battery";

async function twoUsers() {
  const emailA = testEmail("rls-a");
  const emailB = testEmail("rls-b");
  await createUser(emailA, password);
  const idB = await createUser(emailB, password);
  const a = await signedInClient(emailA, password);
  return { a, idB };
}

test.describe("profiles RLS", () => {
  test("a user reads only their own profile", async () => {
    const { a, idB } = await twoUsers();

    const { data: all, error } = await a.client.from("profiles").select("id");
    expect(error).toBeNull();
    expect(all).toEqual([{ id: a.userId }]);

    const { data: other } = await a.client
      .from("profiles")
      .select("id")
      .eq("id", idB);
    expect(other).toEqual([]);
  });

  test("a user cannot update another user's profile", async () => {
    const { a, idB } = await twoUsers();

    const { data } = await a.client
      .from("profiles")
      .update({ display_name: "Hijacked" })
      .eq("id", idB)
      .select();
    expect(data).toEqual([]);

    const { data: stored } = await adminClient()
      .from("profiles")
      .select("display_name")
      .eq("id", idB)
      .single();
    expect(stored?.display_name).not.toBe("Hijacked");
  });

  test("a user updates their own settings", async () => {
    const { a } = await twoUsers();

    const { data, error } = await a.client
      .from("profiles")
      .update({ theme_mode: "dark", pomodoro_focus_minutes: 50 })
      .eq("id", a.userId)
      .select("theme_mode, pomodoro_focus_minutes");
    expect(error).toBeNull();
    expect(data).toEqual([{ theme_mode: "dark", pomodoro_focus_minutes: 50 }]);
  });

  test("protected columns cannot be changed", async () => {
    const { a, idB } = await twoUsers();

    for (const change of [
      { id: idB },
      { avatar_url: "https://example.com/me.png" },
      { created_at: "2000-01-01T00:00:00Z" },
    ]) {
      const { error } = await a.client
        .from("profiles")
        .update(change)
        .eq("id", a.userId);
      expect(error?.code, JSON.stringify(change)).toBe("42501");
    }
  });

  test("a user cannot insert or delete profiles", async () => {
    const { a } = await twoUsers();

    const insert = await a.client
      .from("profiles")
      .insert({ id: crypto.randomUUID(), display_name: "Ghost" });
    expect(insert.error?.code).toBe("42501");

    const del = await a.client.from("profiles").delete().eq("id", a.userId);
    expect(del.error?.code).toBe("42501");
    const { data } = await a.client.from("profiles").select("id");
    expect(data).toHaveLength(1);
  });

  test("visitors without a session cannot read profiles", async () => {
    await twoUsers();

    const { data, error } = await anonClient().from("profiles").select("id");
    expect(data ?? []).toEqual([]);
    expect(error?.code ?? "42501").toBe("42501");
  });

  test("the database rejects invalid values", async () => {
    const { a } = await twoUsers();

    for (const change of [
      { timezone: "Mars/Olympus_Mons" },
      { sound_volume: 101 },
      { streak_threshold: 40 },
      { theme_mode: "sepia" },
      { display_name: "" },
    ]) {
      const { error } = await a.client
        .from("profiles")
        .update(change)
        .eq("id", a.userId);
      expect(error, JSON.stringify(change)).not.toBeNull();
    }
  });
});

test.describe("profile creation on sign-up", () => {
  test("uses the GitHub name, photo, and sign-up language", async () => {
    const id = await createUser(testEmail("meta"), password, {
      full_name: "Ada Lovelace",
      avatar_url: "https://avatars.githubusercontent.com/u/1",
      locale: "es",
    });

    const { data } = await adminClient()
      .from("profiles")
      .select("display_name, avatar_url, locale, timezone, theme_mode")
      .eq("id", id)
      .single();
    expect(data).toEqual({
      display_name: "Ada Lovelace",
      avatar_url: "https://avatars.githubusercontent.com/u/1",
      locale: "es",
      timezone: null,
      theme_mode: "auto",
    });
  });

  test("falls back to the email name and English", async () => {
    const email = testEmail("plain");
    const id = await createUser(email, password);

    const { data } = await adminClient()
      .from("profiles")
      .select("display_name, avatar_url, locale")
      .eq("id", id)
      .single();
    expect(data).toEqual({
      display_name: email.split("@")[0]?.slice(0, 50),
      avatar_url: null,
      locale: "en",
    });
  });
});
