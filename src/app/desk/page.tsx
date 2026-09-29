import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { DeskScene } from "@/components/desk/desk-scene";
import { TimezoneSync } from "@/components/timezone-sync";
import { dayPartAt, hourInTimeZone } from "@/lib/domain/day-parts";
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

  // Until the browser reports a time zone, UTC keeps the date deterministic.
  const timeZone = profile?.timezone ?? "UTC";
  const now = new Date();

  return (
    <>
      <TimezoneSync hasTimezone={profile?.timezone != null} />
      <DeskScene
        displayName={profile?.displayName ?? user.email ?? ""}
        avatarUrl={profile?.avatarUrl ?? null}
        email={user.email ?? ""}
        now={now}
        timeZone={timeZone}
        currentPart={dayPartAt(hourInTimeZone(now, timeZone))}
      />
    </>
  );
}
