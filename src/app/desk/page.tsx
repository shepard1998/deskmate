import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { SiteHeader } from "@/components/site-header";
import { signOut } from "@/lib/server/auth-actions";
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

  const t = await getTranslations("Desk");

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p>{t("signedInAs", { email: user.email ?? "" })}</p>
        <p className="text-neutral-700">{t("comingSoon")}</p>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-md border border-neutral-900 px-4 py-2 font-medium hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            {t("signOut")}
          </button>
        </form>
      </main>
    </div>
  );
}
