import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Avatar } from "@/components/avatar";
import { SiteHeader } from "@/components/site-header";
import { TimezoneSync } from "@/components/timezone-sync";
import { signOut } from "@/lib/server/auth-actions";
import { getProfile } from "@/lib/server/profile";
import { createClient } from "@/lib/server/supabase";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Desk");
  return { title: t("title") };
}

export default async function DeskPage() {
  const supabase = await createClient();
  // The proxy already redirects signed-out visitors; this is the authoritative
  // check, verified against Supabase Auth.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in?next=%2Fdesk");
  }
  const profile = await getProfile(supabase, user.id);

  const t = await getTranslations("Desk");
  const tSettings = await getTranslations("Settings");

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <TimezoneSync hasTimezone={profile?.timezone != null} />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
        {profile ? (
          <Avatar
            name={profile.displayName}
            url={profile.avatarUrl}
            size={64}
          />
        ) : null}
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p>{t("signedInAs", { email: user.email ?? "" })}</p>
        <p className="text-neutral-700">{t("comingSoon")}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/settings"
            className="rounded-md border border-neutral-900 px-4 py-2 font-medium hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            {tSettings("openSettings")}
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md border border-neutral-900 px-4 py-2 font-medium hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              {t("signOut")}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
