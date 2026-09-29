import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Avatar } from "@/components/avatar";
import { SettingsForm } from "@/components/settings/settings-form";
import { SiteHeader } from "@/components/site-header";
import { TimezoneSync } from "@/components/timezone-sync";
import { getProfile } from "@/lib/server/profile";
import { createClient } from "@/lib/server/supabase";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Settings");
  return { title: t("title") };
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in?next=%2Fsettings");
  }
  const profile = await getProfile(supabase, user.id);
  if (!profile) {
    // Every user gets a profile on sign-up; a missing one is a bug.
    throw new Error("Profile not found.");
  }

  const t = await getTranslations("Settings");
  const timeZones = Intl.supportedValuesOf("timeZone");

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <TimezoneSync hasTimezone={profile.timezone !== null} />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pt-6 pb-16">
        <Link
          href="/desk"
          className="w-fit text-sm font-medium text-blue-800 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          {t("backToDesk")}
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <div className="flex items-center gap-4">
          <Avatar
            name={profile.displayName}
            url={profile.avatarUrl}
            size={56}
          />
          <div>
            <p className="font-medium">{profile.displayName}</p>
            <p className="text-sm text-neutral-700">{t("avatarHint")}</p>
          </div>
        </div>
        <SettingsForm values={profile} timeZones={timeZones} />
      </main>
    </div>
  );
}
