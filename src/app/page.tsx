import Link from "next/link";
import { useTranslations } from "next-intl";

import { SiteHeader } from "@/components/site-header";

const linkFocus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";

export default function Home() {
  const t = useTranslations("Home");

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader homeLink={false} />
      <main className="flex flex-1 flex-col items-center justify-center gap-3 p-4 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Deskmate</h1>
        <p className="text-lg text-neutral-700">{t("tagline")}</p>
        <nav className="mt-4 flex gap-3">
          <Link
            href="/sign-in"
            className={`rounded-md border border-neutral-900 px-4 py-2 font-medium hover:bg-neutral-100 ${linkFocus}`}
          >
            {t("signIn")}
          </Link>
          <Link
            href="/sign-up"
            className={`rounded-md bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-neutral-700 ${linkFocus}`}
          >
            {t("signUp")}
          </Link>
        </nav>
      </main>
    </div>
  );
}
