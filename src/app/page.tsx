import { useTranslations } from "next-intl";

import { LanguageSwitcher } from "@/components/language-switcher";

export default function Home() {
  const t = useTranslations("Home");

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex justify-end p-4">
        <LanguageSwitcher />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-3 p-4 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Deskmate</h1>
        <p className="text-lg text-neutral-700">{t("tagline")}</p>
      </main>
    </div>
  );
}
